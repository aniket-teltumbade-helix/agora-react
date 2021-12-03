import React from 'react'
import style from '../styles/rooms.module.css'
import { Spinner } from 'react-bootstrap'

export default function RoomAudio ({
  room,
  userRole,
  onlineUsers,
  sendMessageToPeer,
  recording,
  handleRecordStart,
  handleRecordStop
}) {
  return (
    <>
      {' '}
      <div className={style.roomsSection}>
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
    </>
  )
}
