'use client'
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { io,Socket } from 'socket.io-client';

interface SocketProviderProps{
    children?: React.ReactNode;
}

interface ISocketContext{
    sendMessage: (message: string) => void;
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
    const sendMessage : ISocketContext["sendMessage"] = useCallback((msg)  => {
        // Implement your socket message sending logic here
        console.log("Sending message:", msg);
        if (socket) {
            socket.emit('event:message', { message: msg });
        }
    },[socket]);
    useEffect(() => {
        const _socket = io('http://localhost:8050'); // Adjust the URL as needed
        setSocket(_socket);
        return () => {
            _socket.disconnect();
            setSocket(undefined);
        };
    },[]);
    return (
        <SocketContext.Provider value={{ sendMessage }}>
            {children}
        </SocketContext.Provider>
    );
}
