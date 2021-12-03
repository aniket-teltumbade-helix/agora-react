import React, { useState, useEffect, useRef } from 'react'
import RoomAudio from './RoomAudio'
import RoomChat from './RoomChat'
import RoomScreenSharing from './RoomScrenSharing'
import firebase from '../firebase'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AgoraRTC from 'agora-rtc-sdk'
import { recordAcquire, recordQuery, recordStart, recordStop } from '../helper'

export default function RoomDetail (props) {
  const [room, setRoom] = useState('')
  const [client, setClient] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState()
  const [currentUserId, setCurrentUserId] = useState()
  const [userRole, setUserRole] = useState('')
  const location = useLocation()
  const url = location.pathname.split('/')
  const { currentUser } = useAuth()
  const [localStream, setLocalStream] = useState()
  const [localStreams, setLocalStreams] = useState([])

  const player = useRef()

  let streamOptions = {
    audio: true,
    video: false,
    streamID: null,
    screen: false
  }
  let tempClient = AgoraRTC.createClient({
    mode: 'live',
    codec: 'vp8'
  })
  const [recording, setrecording] = useState(false)

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
      tempClient.unpublish(locStream, handleError)
      tempClient.publish(locStream, handleError)
    }, handleError)
  }

  const createLocalScreenStream = tempClient => {
    const locStream = AgoraRTC.createStream({
      video: false,
      audio: true,
      screen: true,
      screenAudio: true
    })
    console.log(locStream, 'new stream is this')
    setLocalStream(locStream)
    locStream.init(() => {
      tempClient.publish(locStream, handleError)
    }, handleError)
  }

  const addStream = elementId => {
    console.log(elementId)
    // Creates a new div for every stream
    const streamDiv = player.current
    streamDiv.id = elementId
    const container = document.querySelector()

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
    tempClient.init(process.env.REACT_APP_AGORA_APP_ID)
    subscribeToStreamStart(tempClient)
    subscribeToStreamStop(tempClient)
    setClient(tempClient)
    streamOptions.streamID = room.id
    tempClient.on('client-role-changed', (evt, role) => {
      console.log('User role changed', evt)
    })

    tempClient.join(
      '006b99b87affd9948e19aa9e4a01e86ac66IAAlU8uX4pT5kvA+v6xaDX11UnJlAe16yUc8RDhMYz18jpU2fRgAAAAAEABhVhpznUGqYQEAAQCdQaph',
      'audio',
      null,
      null,
      uid => {
        setCurrentUserId(uid)
        setLocalStreams([...localStreams, uid])
        console.log({ localStreams })
        // Create a local stream
        console.log(tempRole, 'is this')
        tempClient.setClientRole('host')
        createLocalStream(tempClient)
      },
      handleError
    )
  }
  const joinScreenStream = tempRole => {
    tempClient.init(process.env.REACT_APP_AGORA_APP_ID)
    subscribeToStreamStart(tempClient)
    subscribeToStreamStop(tempClient)
    setClient(tempClient)
    streamOptions.streamID = room.id
    tempClient.on('client-role-changed', (evt, role) => {
      console.log('User role changed', evt)
    })

    tempClient.join(
      '006b99b87affd9948e19aa9e4a01e86ac66IAAlU8uX4pT5kvA+v6xaDX11UnJlAe16yUc8RDhMYz18jpU2fRgAAAAAEABhVhpznUGqYQEAAQCdQaph',
      'audio',
      null,
      null,
      uid => {
        setCurrentUserId(uid)
        setLocalStreams([...localStreams, uid])
        console.log({ localStreams })
        // Create a local stream
        console.log(tempRole, 'is this')
        tempClient.setClientRole('host')
        createLocalScreenStream(tempClient)
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

  const sendMessageToPeer = peerId => {}
  const [sid, setsid] = useState([])

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
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        maxWidth: '100vw',
        minHeight: '100vh'
      }}
    >
      <RoomAudio
        room={room}
        userRole={userRole}
        onlineUsers={onlineUsers}
        sendMessageToPeer={sendMessageToPeer}
        recording={recording}
        handleRecordStart={handleRecordStart}
        handleRecordStop={handleRecordStop}
      />
      <button onClick={() => joinScreenStream('host')}>Start</button>
      <RoomChat player={player} />
      <RoomScreenSharing />
    </div>
  )
}
