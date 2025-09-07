'use client'
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { io,Socket } from 'socket.io-client';

interface SocketProviderProps{
    children?: React.ReactNode;
}

interface ISocketContext{
    sendMessage: (message: string) => void;
    messages: { message: string }[];
}
const SocketContext = React.createContext<ISocketContext | null>(null);
export const useSocket = () => {
    const state = useContext(SocketContext);
    if (!state) {
        throw new Error("State is undefined");
    }
    return state;
}
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket>();
    const [messages, setMessages] = useState<{ message: string }[]>([]);
    const sendMessage : ISocketContext["sendMessage"] = useCallback((msg)  => {
        // Implement your socket message sending logic here
        console.log("Sending message:", msg);
        if (socket) {
            socket.emit('event:message', { message: msg });
        }
    },[socket]);

    const onMessageRec=useCallback((msg: string) => {
        console.log("Message received from server:", msg);
    const { message } = JSON.parse(msg) as { message: string };
    setMessages((prev) => [...prev, { message }]);
    },[]);

    useEffect(() => {
        const _socket = io('http://localhost:8050'); // Adjust the URL as needed
        setSocket(_socket);
        _socket.on('event:message', onMessageRec);
        return () => {
            _socket.disconnect();
            _socket.off('event:message', onMessageRec);
            setSocket(undefined);
        };
    },[]);
    return (
        <SocketContext.Provider value={{ sendMessage, messages }}>
            {children}
        </SocketContext.Provider>
    );
}
