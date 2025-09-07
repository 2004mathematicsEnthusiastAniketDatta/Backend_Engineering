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

const onMessageRec = useCallback((msg: string) => {
    console.log("Message received from server:", msg);
    
    try {
        // Check if the message is already a plain string (not JSON)
        if (typeof msg === 'string' && !msg.startsWith('{') && !msg.startsWith('[')) {
            // If it's a plain string, use it directly
            setMessages((prev) => [...prev, { message: msg }]);
            return;
        }
        
        // Try to parse as JSON
        const parsed = JSON.parse(msg);
        
        // Handle different possible JSON structures
        if (typeof parsed === 'string') {
            // If parsed result is a string
            setMessages((prev) => [...prev, { message: parsed }]);
        } else if (parsed.message) {
            // If it has a message property
            setMessages((prev) => [...prev, { message: parsed.message }]);
        } else if (parsed.data) {
            // If it has a data property
            setMessages((prev) => [...prev, { message: parsed.data }]);
        } else {
            // If it's some other JSON structure, stringify it
            setMessages((prev) => [...prev, { message: JSON.stringify(parsed) }]);
        }
        
    } catch (error) {
        console.error("Failed to parse message:", error);
        console.log("Raw message:", msg);
        
        // If JSON parsing fails, treat as plain text
        setMessages((prev) => [...prev, { message: msg }]);
    }
}, []);

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
