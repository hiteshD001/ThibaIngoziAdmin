/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useRef, useState } from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [activeUserLists, setActiveUserLists] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        pageSize: 20
    });
    const [currentPage, setCurrentPage] = useState(1);
    const pingIntervalRef = useRef(null);
    const url = import.meta.env.VITE_WEB_SOCKET_URL;

    useEffect(() => {
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
            console.error("WebSocket error:", error);
        };

        socket.onmessage = (event) => {
            let data;

            try {
                data = JSON.parse(event.data);
            } catch (err) {
                console.log("Invalid WS message", err);
                return;
            }

            if (data?.type === "pong") return;

            // Handle paginated data structure (new format)
            if (data?.data && Array.isArray(data?.data) && data?.pagination) {
                setActiveUserLists(data.data);
                setPagination(data.pagination);
                return;
            }

            // Backend structured payload
            if (data?.type === "ACTIVE_SOS" && Array.isArray(data?.payload)) {
                setActiveUserLists(data.payload); // replace
                return;
            }

            // Backend sends just array (legacy)
            if (Array.isArray(data)) {
                setActiveUserLists(data);
                return;
            }
        };

        return () => {
            socket.close();
            clearInterval(pingIntervalRef.current);
        };
    }, [url]);

    // Function to request specific page
    const requestPage = (page) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            setCurrentPage(page);
            socketRef.current.send(JSON.stringify({ 
                type: "request_page", 
                page: page 
            }));
        }
    };

    // Function to go to next page
    const nextPage = () => {
        if (currentPage < pagination.totalPages) {
            requestPage(currentPage + 1);
        }
    };

    // Function to go to previous page
    const prevPage = () => {
        if (currentPage > 1) {
            requestPage(currentPage - 1);
        }
    };

    return (
        <WebSocketContext.Provider value={{ 
            isConnected, 
            activeUserLists, 
            pagination,
            currentPage,
            requestPage,
            nextPage,
            prevPage,
            socketRef 
        }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
