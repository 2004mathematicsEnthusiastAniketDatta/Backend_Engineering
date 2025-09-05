"use client"
import React, { useState } from 'react';
import { useSocket } from '../context/SocketProvider';
import classes from './page.module.css';
export default function Page() {
  const { sendMessage } = useSocket();
  const [message, setMessage] = useState('');
  
  return (
   <div>
    <div>
      <h1>All messages will appear here</h1>
    </div>
    <div>
      <input onChange={(e) => setMessage(e.target.value)} className={classes['chat-input']} type="text" placeholder="Type your message here..." />
      <button onClick={() => sendMessage(message)} className={classes['send-button']}>Send</button>
    </div>
   </div>
  )
}