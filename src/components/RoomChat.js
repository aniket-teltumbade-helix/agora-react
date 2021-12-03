import React, { useEffect, useRef, useState } from 'react'
import AgoraRTM from 'agora-rtm-sdk'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

export const useAgoraRtm = (uid, client, userName) => {
  const [messages, setMessages] = useState([])
  const room = window.location.pathname.split('-')[1]
  console.log({ uid, client, userName, room })
  const channel = useRef(client.createChannel(room)).current
  const initRtm = async () => {
    if (uid && userName) {
      // Beackend api to retrieve dynamic key
      axios(`http://localhost:8080/rtmToken?account=${uid}`).then(
        async result => {
          client
            .login({
              uid: uid.toString(),
              token: result.data.key
            })
            .then(async value => {
              console.log(value)
              await channel.join()
              await client.setLocalUserAttributes({
                name: userName
              })
            })
            .catch(err => {
              console.error(err)
            })
        }
      )
    }
  }
  useEffect(() => {
    initRtm()
    // eslint-disable-next-line consistent-return
  }, [])

  useEffect(() => {
    channel.on('ChannelMessage', (data, uid) => {
      handleMessageReceived(data, uid)
    })
  }, [])
  const handleMessageReceived = async (data, uid) => {
    const user = await client.getUserAttributes(uid)
    if (data.messageType === 'TEXT') {
      const newMessageData = { user, message: data.text }
      setCurrentMessage(newMessageData)
    }
  }

  const [currentMessage, setCurrentMessage] = useState()
  const sendChannelMessage = async text => {
    channel
      .sendMessage({ text })
      .then(() => {
        console.error(userName)
        setCurrentMessage({
          user: { name: 'Current User (Me)' },
          message: text
        })
      })
      .catch(error => {
        console.log(error, userName, uid)
      })
  }

  useEffect(() => {
    if (currentMessage) setMessages([...messages, currentMessage])
  }, [currentMessage])

  return { sendChannelMessage, messages }
}

const client = AgoraRTM.createInstance(process.env.REACT_APP_AGORA_APP_ID)

export default function RoomChat () {
  const [textArea, setTextArea] = useState('')
  const { currentUser } = useAuth()

  const { messages, sendChannelMessage } = useAgoraRtm(
    currentUser.uid,
    client,
    currentUser.email
  )
  const submitMessage = e => {
    if (e.charCode === 13) {
      e.preventDefault()
      if (textArea.trim().length === 0) return
      sendChannelMessage(e.currentTarget.value)
      setTextArea('')
    }
  }
  return (
    <div>
      <div>
        <textarea
          placeholder='Type your message here'
          className='form-control'
          onChange={e => setTextArea(e.target.value)}
          aria-label='With textarea'
          value={textArea}
          onKeyPress={submitMessage}
        />
      </div>
      <div className='d-flex flex-column py-5'>
        {messages.map((data, index) => {
          return (
            <div className='row' key={`chat${index + 1}`}>
              <h5 className='font-size-15'>{`${data.user.name} :`}</h5>
              <p className='text-break'>{` ${data.message}`}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
