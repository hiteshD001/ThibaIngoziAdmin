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
    const [newSOS, setnewSOS] = useState({ count: 0, type: undefined });
    const [requestCounts, setRequestCounts] = useState({}); // Store req_reach and req_accept counts by SOS ID
    const url = import.meta.env.VITE_WEB_SOCKET_URL;

    useEffect(() => {
        const socket = new WebSocket(url);
        socketRef.current = socket;

        socket.onopen = () => {
            setIsConnected(true);
        };

        socket.onclose = () => {
            setIsConnected(false);
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

            // Ignore heartbeat pong
            if (data?.type === "pong") return;

            // New SOS notification from backend
            if (data?.new_sos) {
                setnewSOS((prev) => ({ count: prev.count + 1, type: "new_sos" }));
                return;
            }

            // SOS update notification from backend (existing SOS updated)
            if (data?.sos_update) {
                setnewSOS((prev) => ({ count: prev.count + 1, type: "update_sos" }));
                return;
            }

            // Request reached users update
            if (data?.request_reached_update) {
                const { sosId, count } = data.request_reached_update;
                setRequestCounts(prev => ({
                    ...prev,
                    [sosId]: { ...prev[sosId], req_reach: count }
                }));
                return;
            }

            // Request accepted users update
            if (data?.request_accepted_update) {
                const { sosId, count } = data.request_accepted_update;
                setRequestCounts(prev => ({
                    ...prev,
                    [sosId]: { ...prev[sosId], req_accept: count }
                }));
                return;
            }

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
        };
    }, [url]);

    // When backend sends new_sos, fetch the current page again
    useEffect(() => {
        if (socketRef.current?.readyState !== WebSocket.OPEN) return;

        socketRef.current.send(JSON.stringify({
            type: "request_page",
            page: currentPage || 1,
        }));
    }, [newSOS, currentPage]);

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
