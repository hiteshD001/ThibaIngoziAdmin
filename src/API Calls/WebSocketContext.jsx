/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useRef, useState } from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ ...props }) => {
    const { children } = props;

    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [activeUserList, setActiveUserList] = useState([]);
    const pingIntervalRef = useRef(null);
    const url = import.meta.env.VITE_WEB_SOCKET_URL;

    useEffect(() => {
        const connectWebSocket = () => {
            const socket = new WebSocket(url);
            socketRef.current = socket;

            socket.onopen = () => {
                setIsConnected(true);

                pingIntervalRef.current = setInterval(() => {
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({ type: "ping" }));
                    }
                }, 30000);
            };

            socket.onclose = () => {
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
                } else if (data.type === "pong") {
                    console.log("Pong received");
                } else {
                    setActiveUserList(() => [...data]);
                }
            };
        };

        // Attempt to establish WebSocket connection
        connectWebSocket();

        // Cleanup function when component unmounts or url changes
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
                clearInterval(pingIntervalRef.current); // Clean up ping interval
            }
        };
    }, [url]);

    return (
        <WebSocketContext.Provider
            value={{ isConnected, activeUserList, socketRef }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};
