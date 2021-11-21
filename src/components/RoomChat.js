import React, { useEffect, useState } from 'react'
import style from '../styles/rooms.module.css'
import firebase from '../firebase'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Spinner } from 'react-bootstrap'
import AgoraRTM from 'agora-rtm-sdk'
import { v4 } from 'uuid'
import random from 'random'

export default function RoomChat (props) {
  const [room, setRoom] = useState('')
  const [onlineUsers, setOnlineUsers] = useState()
  const [currentUserId, setCurrentUserId] = useState()
  const [userRole, setUserRole] = useState('')
  const location = useLocation()
  const url = location.pathname.split('/')
  const { currentUser } = useAuth()
  const [localStream, setLocalStream] = useState('')

  const [rtmClient, setrtmClient] = useState()

  // let [audioURL, isRecording, startRecording, stopRecording] = useRecorder()
  // const rtm = new RtmClient()

  const leaveRoom = () => {
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
    if (room && currentUserId) setUidOfUser(room.id, currentUser, currentUserId)
  }, [room, currentUserId])

  const createInstance = async () => {
    let data = await AgoraRTM.createInstance(process.env.REACT_APP_AGORA_APP_ID)
    setrtmClient(data)
  }

  useEffect(() => {
    const roomRef = firebase.database().ref('rooms')
    roomRef.on('value', snapshot => {
      const rooms = snapshot.val()
      for (let id in rooms) {
        if (id == url[2]) {
          setRoom({ ...rooms[id], id })
          setUserRole(currentUser.email == rooms[id].host ? 'host' : 'audience')
          console.log('setUserRole', currentUser)
          createInstance()
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

  const setPresenceOffline = () => {
    setRoom(room => {
      firebase
        .database()
        .ref(`/online/${room.id}/${currentUser.uid}`)
        .remove()
      return room
    })
  }
  const login = async () => {}
  const startChannel = async () => {
    if (rtmClient) {
      rtmClient
        .login({
          uid: v4(3),
          token:
            '006b99b87affd9948e19aa9e4a01e86ac66IABJ4vzN/JY+3vB+mEOGGX/csq3g018K7rTTdLEyqMaXo+8OQl4AAAAAEAAtPj4LF8ObYQEAAQAXw5th'
        })
        .then(val1 => {
          console.log({ val1 })
        })
        .catch(err => {
          console.error({ err })
        })
      const channel = await rtmClient.createChannel('latest1')
      channel.join()
      console.log('hey!!!!!!!!!', rtmClient, channel)
    }
    // const channel = rtmClient.createChannel('newdev')
    // const value = await channel.join()
    // console.log({ channel: value })
  }
  useEffect(() => {
    startChannel()
    // return () => {
    //   cleanup
    // }
  }, [rtmClient])
  const sendMessageToPeer = () => {}

  // useEffect(() => {

  // }, [currentUserId])
  console.log({
    // room,
    onlineUsers,
    // currentUserId,
    // userRole,
    // localStream,
    rtmClient
  })
  return (
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
    </div>
  )
}
