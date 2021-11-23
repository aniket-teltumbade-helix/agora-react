import React, { useEffect, useState } from 'react'
import style from '../styles/rooms.module.css'
import firebase from '../firebase'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AgoraRTC from 'agora-rtc-sdk'
import { Spinner } from 'react-bootstrap'
import AgoraRTM from 'agora-rtm-sdk'
import { recordAcquire, recordQuery, recordStart, recordStop } from '../helper'
import RoomChat from './RoomChat'

export default function RoomDetail (props) {
  const [room, setRoom] = useState('')
  const [client, setClient] = useState(null)
  const [rtmClient, setRtmClient] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState()
  const [currentUserId, setCurrentUserId] = useState()
  const [userRole, setUserRole] = useState('')
  const location = useLocation()
  const url = location.pathname.split('/')
  const { currentUser } = useAuth()
  const [localStream, setLocalStream] = useState('')
  const [localStreams, setLocalStreams] = useState([])
  const [instance, setinstance] = useState('')

  const [recording, setrecording] = useState(false)

  let streamOptions = {
    audio: false,
    video: false,
    streamID: null,
    screen: false
  }
  // let [audioURL, isRecording, startRecording, stopRecording] = useRecorder()
  const handleError = err => {
    console.error(err)
  }
  // const rtm = new RtmClient()

  const createLocalStream = tempClient => {
    const locStream = AgoraRTC.createStream(streamOptions)
    console.log(locStream, 'new stream is this')
    setLocalStream(locStream)
    locStream.init(() => {
      tempClient.publish(locStream, handleError)
    }, handleError)
  }

  const addStream = elementId => {
    console.log(elementId)
    // Creates a new div for every stream
    const streamDiv = document.createElement('div')
    streamDiv.id = elementId
    const container = document.querySelector('#roomSection')

    container.appendChild(streamDiv)
  }
  const removeStream = elementId => {
    const remoteDiv = document.getElementById(elementId)
    if (remoteDiv) {
      remoteDiv.remove()
    }
  }

  const subscribeToStreamStart = tempClient => {
    tempClient.on('stream-added', evt => {
      if (!localStreams.includes(evt.stream.getId())) {
        tempClient.subscribe(evt.stream, null, handleError)
      }
    })
    // Play the remote stream when it is subsribed
    tempClient.on('stream-subscribed', evt => {
      console.log('stream subscribed')
      const stream = evt.stream
      const streamId = String(stream.getId())
      addStream(streamId)
      stream.play(streamId)
    })
  }

  const subscribeToStreamStop = tempClient => {
    // Remove the corresponding view when a remote user unpublishes.
    tempClient.on('stream-removed', evt => {
      const stream = evt.stream
      const streamId = String(stream.getId())
      stream.close()
      removeStream(streamId)
    })
    // Remove the corresponding view when a remote user leaves the channel.
    tempClient.on('peer-leave', evt => {
      const stream = evt.stream
      const streamId = String(stream.getId())
      stream.close()
      removeStream(streamId)
    })
  }

  const joinStream = tempRole => {
    let tempClient = AgoraRTC.createClient({
      mode: 'live',
      codec: 'vp8'
    })
    tempClient.init(process.env.REACT_APP_AGORA_APP_ID)
    subscribeToStreamStart(tempClient)
    subscribeToStreamStop(tempClient)
    setClient(tempClient)
    streamOptions.streamID = room.id
    tempClient.on('client-role-changed', (evt, role) => {
      console.log('User role changed', evt)
    })

    tempClient.join(
      '006b99b87affd9948e19aa9e4a01e86ac66IABlRqzWZRHa7+XubqVGeCbzPsqG7jjCvoAVccREXzTE92+RnZMAAAAAEADsTG0XHaicYQEAAQAeqJxh',
      'latest',
      null,
      null,
      uid => {
        setCurrentUserId(uid)
        setLocalStreams([...localStreams, uid])
        console.log({ localStreams })
        // Create a local stream
        console.log(tempRole, 'is this')
        // if (tempRole == "host") {
        tempClient.setClientRole('host')
        createLocalStream(tempClient)
        // } else {
        //   setTimeout(() => {
        //     tempClient.setClientRole("host");
        //   }, 10000);
        // }

        // Params for login
        // let options = {
        //   uid: uid,
        //   token:
        //     "00608731afc714841759f4e13d9232f5006IACDQpAlJ1Rv5qgz1eGHo9gVD7FFnBqIizO/1AWov25LVepuE8wAAAAAEAC26B3+YQU3YQEAAQBhBTdh",
        // };
        // const tempRtmClient = AgoraRTM.createInstance(
        //   "08731afc714841759f4e13d9232f5006"
        // );
        // tempRtmClient.on("MessageFromPeer", function (message, peerId) {
        //   console.log("Message from: " + peerId + " Message: " + message);
        // });

        // tempRtmClient.login(options);

        // setRtmClient(tempRtmClient);
      },
      handleError
    )
  }

  const leaveRoom = () => {
    console.log('leaving room', localStream)
    setPresenceOffline()
    if (localStream) {
      localStream.stop()
      localStream.close()
    }
    props.history.push('/')
  }

  const setUidOfUser = (roomId, newUser, agoraId) => {
    const reference = firebase
      .database()
      .ref(`/online/${roomId}/${newUser.uid}`)
    const online = {
      displayName: newUser.email,
      date: new Date().getTime(),
      key: newUser.uid,
      agoraId
    }
    reference.set(online).then(() => {})

    reference
      .onDisconnect()
      .remove()
      .then(() => console.log('On disconnect configured'))
  }

  useEffect(() => {
    const roomRef = firebase.database().ref('rooms')
    roomRef.on('value', snapshot => {
      const rooms = snapshot.val()
      for (let id in rooms) {
        if (id == url[2]) {
          setRoom({ ...rooms[id], id })
          setUserRole(currentUser.email == rooms[id].host ? 'host' : 'audience')

          joinStream(currentUser.email == rooms[id].host ? 'host' : 'audience')
          const onlineRef = firebase.database().ref(`/online/${id}`)
          onlineRef.on('value', snapshot => {
            const onlineUsers = snapshot.val()
            const onlineUsersList = []
            for (let id in onlineUsers) {
              onlineUsersList.push({ ...onlineUsers[id], id: id })
            }
            setOnlineUsers(onlineUsersList)
          })
        }
      }
    })
    return () => {
      leaveRoom()
    }
  }, [])

  useEffect(() => {
    if (room && currentUserId) setUidOfUser(room.id, currentUser, currentUserId)
  }, [room, currentUserId])

  const setPresenceOffline = () => {
    setRoom(room => {
      firebase
        .database()
        .ref(`/online/${room.id}/${currentUser.uid}`)
        .remove()
      return room
    })
  }

  const sendMessageToPeer = peerId => {
    // const peerMessage = "Hey this is a test message from the host";
    // if (userRole == "host") {
    //   rtmClient
    //     .sendMessageToPeer({ text: peerMessage }, peerId)
    //     .then((sendResult) => {
    //       if (sendResult.hasPeerReceived) {
    //         alert(
    //           "Message has been received by: " +
    //             peerId +
    //             " Message: " +
    //             peerMessage
    //         );
    //       } else {
    //         alert("Message sent to: " + peerId + " Message: " + peerMessage);
    //       }
    //     });
    // } else alert("Audience can not send a message");
  }
  const [resourceID, setresourceID] = useState()
  const [sid, setsid] = useState([])

  // useEffect(() => {

  // }, [currentUserId])
  const handleRecordStart = async () => {
    recordAcquire(currentUserId).then(val => {
      recordStart(currentUserId, val.data.resourceId).then(val2 => {
        setsid(val2)
        setrecording(true)
      })
    })
  }
  const handleRecordStop = async () => {
    try {
      recordQuery(sid)
        .then(async d1 => {
          console.warn(d1)
          let data = await recordStop(sid, currentUserId)
          console.log(data)
          setrecording(false)
          return data
        })
        .catch(error => {
          console.error(error)
          setrecording(false)
        })
    } catch (error) {
      console.error(error)
      setrecording(false)
    }
  }
  return (
    <>
      <div id='roomSection' className={style.roomsSection}>
        <div className='d-flex align-items-center justify-content-between'>
          {' '}
          <h3 className='mb-0'>{room.title}</h3>{' '}
          <p className='mb-0'>{userRole}</p>
        </div>
        <div className='mt-5'>
          <ul>
            {onlineUsers ? (
              onlineUsers.map(item => (
                <>
                  <li
                    className='d-flex align-items-center justify-content-between'
                    style={{ cursir: 'pointer' }}
                    onClick={() => sendMessageToPeer(item.agoraId)}
                  >
                    <span>{item.displayName}</span>
                    <span>{item.agoraId}</span>
                    <span>
                      {item.displayName == room.host ? 'Host' : 'Audience'}
                    </span>
                  </li>
                </>
              ))
            ) : (
              <Spinner animation='border' />
            )}
          </ul>
        </div>
        {!recording && <button onClick={handleRecordStart}>Start</button>}
        {recording && <button onClick={handleRecordStop}>Stop</button>}
      </div>
      {room && currentUserId && onlineUsers && currentUser && (
        <RoomChat
          room={room}
          currentUserId={currentUserId}
          onlineUsers={onlineUsers}
          currentUser={currentUser.email}
        />
      )}
    </>
  )
}
