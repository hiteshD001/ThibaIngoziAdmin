/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useRef, useState } from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ ...props }) => {
    const { url, children } = props

    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [activeUserList, setActiveUserList] = useState([]);

    useEffect(() => {
        if (!socketRef.current) {
            const socket = new WebSocket(url);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log("WebSocket connection opened");
                setIsConnected(true);
            };

            socket.onclose = (event) => {
                console.log("WebSocket connection closed", event);
                setIsConnected(false);
            };

            socket.onerror = (error) => {
                console.error("WebSocket error", error);
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.length === 0) {
                    setActiveUserList([]);
                } else {
                    console.log("sucess")
                    setActiveUserList((prev) => [...prev, ...data]);
                }
            };
        }

        return () => {
            if (socketRef.current) {
                console.log("Cleaning up WebSocket connection");
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [url]);

    return (
        <WebSocketContext.Provider value={{ isConnected, activeUserList, socketRef }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};