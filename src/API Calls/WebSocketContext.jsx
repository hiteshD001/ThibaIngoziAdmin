/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useRef, useState } from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ ...props }) => {
    const { url, children } = props;

    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [activeUserList, setActiveUserList] = useState([]);
    const pingIntervalRef = useRef(null);

    useEffect(() => {
        const connectWebSocket = () => {
            const socket = new WebSocket(url);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log("WebSocket connection opened");
                setIsConnected(true);

                pingIntervalRef.current = setInterval(() => {
                    if (socket.readyState === WebSocket.OPEN) {
                        console.log("Sending ping...");
                        socket.send(JSON.stringify({ type: 'ping' }));
                    }
                }, 30000); 
            };

            socket.onclose = (event) => {
                console.log("WebSocket connection closed", event);
                setIsConnected(false);
                clearInterval(pingIntervalRef.current);
            };

            socket.onerror = (error) => {
                console.error("WebSocket error", error);
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.length === 0) {
                    setActiveUserList([]);
                } else if (data.type === 'pong') {
                    console.log("Pong received");
                } else {
                    console.log("Success");
                    setActiveUserList((prev) => [...prev, ...data]);
                }
            };
        };

        // Attempt to establish WebSocket connection
        connectWebSocket();

        // Cleanup function when component unmounts or url changes
        return () => {
            if (socketRef.current) {
                console.log("Cleaning up WebSocket connection");
                socketRef.current.close();
                socketRef.current = null;
                clearInterval(pingIntervalRef.current); // Clean up ping interval
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