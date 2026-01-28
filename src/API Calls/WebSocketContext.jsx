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
    const [newSOS, setNewSOS] = useState({ count: 0, type: undefined });
    const [requestCounts, setRequestCounts] = useState({});
    const url = import.meta.env.VITE_WEB_SOCKET_URL;

    // Add a flag to track if this is the initial connection
    const isInitialConnection = useRef(true);

    useEffect(() => {
        const socket = new WebSocket(url);
        socketRef.current = socket;

        socket.onopen = () => {
            setIsConnected(true);
            console.log("WebSocket connected");
            
            // Request initial data on connection
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    type: "request_page",
                    page: currentPage || 1,
                }));
            }
        };

        socket.onclose = () => {
            setIsConnected(false);
            console.log("WebSocket disconnected");
            isInitialConnection.current = true; // Reset for reconnection
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        socket.onmessage = (event) => {
            let data;

            try {
                data = JSON.parse(event.data);
                console.log("WebSocket message received:", data); 
            } catch (err) {
                console.error("Invalid WS message", err, event.data);
                return;
            }

            // Ignore heartbeat pong
            if (data?.type === "pong") {
                console.log("Heartbeat pong received");
                return;
            }

            // NEW SOS notification - This is the most important part
            if (data?.new_sos === true) {
                console.log("New SOS notification received");
                setNewSOS(prev => ({ 
                    count: prev.count + 1, 
                    type: "new_sos" 
                }));
                
                // Don't return here if there's also data payload
                // Continue processing to handle any data that came with the notification
            }

            // SOS update notification
            if (data?.sos_update === true) {
                console.log("SOS update notification received");
                setNewSOS(prev => ({ 
                    count: prev.count + 1, 
                    type: "update_sos" 
                }));
                // Don't return early if there's data payload
            }

            // Request reached users update
            if (data?.request_reached_update) {
                console.log("Request reached update:", data.request_reached_update);
                const { sosId, count } = data.request_reached_update;
                setRequestCounts(prev => ({
                    ...prev,
                    [sosId]: { ...prev[sosId], req_reach: count }
                }));
                // Continue processing if there's more data
            }

            // Request accepted users update
            if (data?.request_accepted_update) {
                console.log("Request accepted update:", data.request_accepted_update);
                const { sosId, count } = data.request_accepted_update;
                setRequestCounts(prev => ({
                    ...prev,
                    [sosId]: { ...prev[sosId], req_accept: count }
                }));
                // Continue processing if there's more data
            }

            // Handle paginated data structure (new format)
            if (data?.data && Array.isArray(data?.data) && data?.pagination) {
                console.log("Paginated data received:", data.data.length, "items");
                setActiveUserLists(data.data);
                if (data.pagination) setPagination(data.pagination);
                
                // Reset initial connection flag after first data
                if (isInitialConnection.current) {
                    isInitialConnection.current = false;
                }
                return;
            }

            // Handle data that might come with notifications
            if (data?.data && Array.isArray(data?.data)) {
                console.log("Data array received with notification:", data.data.length, "items");
                setActiveUserLists(data.data);
                
                // If this came with new_sos, we've already incremented the count above
                if (data.new_sos && isInitialConnection.current) {
                    isInitialConnection.current = false;
                }
                return;
            }

            // Backend structured payload
            if (data?.type === "ACTIVE_SOS" && Array.isArray(data?.payload)) {
                console.log("ACTIVE_SOS payload received:", data.payload.length, "items");
                setActiveUserLists(data.payload);
                return;
            }

            // Backend sends just array (legacy)
            if (Array.isArray(data)) {
                console.log("Legacy array data received:", data.length, "items");
                setActiveUserLists(data);
                return;
            }

            // Log any unhandled message formats
            console.log("Unhandled WebSocket message format:", data);
        };

        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, [url]);

    // When backend sends new_sos, fetch the current page again
    useEffect(() => {
        if (socketRef.current?.readyState !== WebSocket.OPEN) {
            console.log("WebSocket not ready, skipping refetch");
            return;
        }

        console.log("Refetching page due to newSOS:", newSOS);
        socketRef.current.send(JSON.stringify({
            type: "request_page",
            page: currentPage || 1,
        }));
    }, [newSOS, currentPage]);

    // Function to request specific page
    const requestPage = (page) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            console.log("Requesting page:", page);
            setCurrentPage(page);
            socketRef.current.send(JSON.stringify({
                type: "request_page",
                page: page
            }));
        } else {
            console.error("WebSocket not connected");
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
            newSOS,
            requestCounts,
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