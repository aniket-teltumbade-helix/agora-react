import React, { useEffect, useState } from 'react'
import style from '../styles/rooms.module.css'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Spinner } from 'react-bootstrap'
import AgoraRTM from 'agora-rtm-sdk'
import axios from 'axios'

export default function RoomChat ({ room, onlineUsers, currentUserId }) {
  // const [room, setRoom] = useState('')
  // const [onlineUsers, setOnlineUsers] = useState()
  // const [currentUserId, setCurrentUserId] = useState()
  const [userRole, setUserRole] = useState('')
  const location = useLocation()
  const url = location.pathname.split('/')
  const { currentUser } = useAuth()
  const [localStream, setLocalStream] = useState('')

  const [rtmClient, setrtmClient] = useState()
  const [channel, setchannel] = useState()

  // let [audioURL, isRecording, startRecording, stopRecording] = useRecorder()
  // const rtm = new RtmClient()

  // const leaveRoom = () => {
  //   setPresenceOffline()
  //   if (localStream) {
  //     localStream.stop()
  //     localStream.close()
  //   }
  //   props.history.push('/')
  // }

  // const setUidOfUser = (roomId, newUser, agoraId) => {
  //   const reference = firebase
  //     .database()
  //     .ref(`/online/${roomId}/${newUser.uid}`)
  //   const online = {
  //     displayName: newUser.email,
  //     date: new Date().getTime(),
  //     key: newUser.uid,
  //     agoraId
  //   }
  //   reference.set(online).then(() => {})

  //   reference
  //     .onDisconnect()
  //     .remove()
  //     .then(() => console.log('On disconnect configured'))
  // }

  // useEffect(() => {
  //   if (room && currentUserId) setUidOfUser(room.id, currentUser, currentUserId)
  // }, [room, currentUserId])

  useEffect(() => {
    // return () => {
    //   cleanup
    // }
  }, [])
  
  const login = async () => {}

const sendMessageToChannel= async () => {
  channel.sendMessage({text: 'test channel message'}).then((data) => {
    console.log(data);
  })
}

  const startChannel = async () => {
    let clientRtm = await AgoraRTM.createInstance(process.env.REACT_APP_AGORA_APP_ID)
    setrtmClient(clientRtm)
    if (currentUserId) {
      let uid = currentUserId.toString()
      let token = await (
        await axios(`http://localhost:8080/rtmToken?account=${uid}`)
      ).data.key
      console.log({ token })
      clientRtm
        .login({
          uid,
          token
        })
        .then(async val1 => {
          console.log({ val1 })
          const channel = await clientRtm.createChannel('latest')
          channel.join()
          setchannel(channel)
        })
        .catch(err => {
          console.error(currentUserId, { err })
        })
      // console.log('hey!!!!!!!!!', rtmClient, channel)
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
  }, [currentUserId])
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
        <button onClick={()=>sendMessageToChannel()}>Send</button>
      </div>
    </div>
  )
}
