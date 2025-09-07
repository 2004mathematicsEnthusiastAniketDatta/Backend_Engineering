"use client"
import React, { useState } from 'react';
import { useSocket } from '../context/SocketProvider';
import classes from './page.module.css';
export default function Page() {
  const { sendMessage, messages } = useSocket();
  const [message, setMessage] = useState('');
  
  return (
   <div>

    <div>
      <input onChange={(e) => setMessage(e.target.value)} className={classes['chat-input']} type="text" placeholder="Type your message here..." />
      <button onClick={() => sendMessage(message)} className={classes['send-button']}>Send</button>  
    </div>
    <div className={classes['messages-container']}>
      {messages.map((msg, index) => (
       <li key={index}>{msg.message}</li>
      ))}
    </div>
   </div>
  )
}