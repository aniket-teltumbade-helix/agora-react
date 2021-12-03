import React, { useEffect, useState, useRef } from 'react'
import style from '../styles/rooms.module.css'
import AgoraRTC from 'agora-rtc-sdk'

export default function RoomScreenSharing ({ player }) {
  // const [client, setClient] = useState(null)
  // const [localStream, setLocalStream] = useState('')
  // const [localStreams, setLocalStreams] = useState([])
  // const [element, setElement] = useState()
  // let streamOptions = {
  //   audio: false,
  //   video: false,
  //   streamID: null,
  //   screen: true
  // }
  // const player = useRef()
  // // let [audioURL, isRecording, startRecording, stopRecording] = useRecorder()
  // const handleError = err => {
  //   console.error(err)
  // }
  // // const rtm = new RtmClient()

  // const createLocalStream = tempClient => {
  //   const locStream = AgoraRTC.createStream(streamOptions)
  //   console.log(locStream, 'new stream is this')
  //   setLocalStream(locStream)
  //   locStream.init(() => {
  //     tempClient.publish(locStream, handleError)
  //   }, handleError)
  // }

  // const addStream = elementId => {
  //   console.log(elementId)
  //   // Creates a new div for every stream
  //   const streamDiv = document.createElement('div')
  //   streamDiv.id = elementId
  //   const container = player.current

  //   container.appendChild(streamDiv)
  // }
  // const removeStream = elementId => {
  //   setElement()
  //   const remoteDiv = document.getElementById(elementId)
  //   if (remoteDiv) {
  //     remoteDiv.remove()
  //   }
  // }

  // const subscribeToStreamStart = tempClient => {
  //   tempClient.on('stream-added', evt => {
  //     if (!localStreams.includes(evt.stream.getId())) {
  //       tempClient.subscribe(evt.stream, null, handleError)
  //     }
  //   })
  //   // Play the remote stream when it is subsribed
  //   tempClient.on('stream-subscribed', evt => {
  //     console.log('stream subscribed')
  //     const stream = evt.stream
  //     const streamId = String(stream.getId())
  //     addStream(streamId)
  //     stream.play(streamId)
  //   })
  // }

  // const subscribeToStreamStop = tempClient => {
  //   // Remove the corresponding view when a remote user unpublishes.
  //   tempClient.on('stream-removed', evt => {
  //     const stream = evt.stream
  //     const streamId = String(stream.getId())
  //     stream.close()
  //     removeStream(streamId)
  //   })
  //   // Remove the corresponding view when a remote user leaves the channel.
  //   tempClient.on('peer-leave', evt => {
  //     const stream = evt.stream
  //     const streamId = String(stream.getId())
  //     stream.close()
  //     removeStream(streamId)
  //   })
  // }

  // const joinStream = tempRole => {
  //   let tempClient = AgoraRTC.createClient({
  //     mode: 'live',
  //     codec: 'vp8'
  //   })
  //   tempClient.init(process.env.REACT_APP_AGORA_APP_ID)
  //   subscribeToStreamStart(tempClient)
  //   subscribeToStreamStop(tempClient)
  //   setClient(tempClient)
  //   setElement(tempClient)
  //   streamOptions.streamID = window.location.pathname.split('-')[1]
  //   tempClient.on('client-role-changed', evt => {
  //     console.log('User role changed', evt)
  //   })

  //   tempClient.join(
  //     '006b99b87affd9948e19aa9e4a01e86ac66IAD5auADtH8bkC3Z/nCzw1K+HRt3oqzxFDVmD9dARAnus84YnbIAAAAAEAAveiW6yR6qYQEAAQDIHqph',
  //     'screenshare',
  //     null,
  //     null,
  //     uid => {
  //       setLocalStreams([...localStreams, uid])
  //       console.log({ localStreams })
  //       // Create a local stream
  //       console.log(tempRole, 'is this')
  //       // if (tempRole == "host") {
  //       tempClient.setClientRole('host')
  //       createLocalStream(tempClient)
  //     },
  //     handleError
  //   )
  // }

  // const leaveRoom = () => {
  //   console.log('leaving room', localStream)
  //   if (localStream) {
  //     localStream.stop()
  //     localStream.close()
  //   }
  // }

  // useEffect(() => {
  //   joinStream('host')
  //   return () => {
  //     leaveRoom()
  //   }
  // }, [])

  return (
    <>
      <div className={style.video} ref={player} />
    </>
  )
}
