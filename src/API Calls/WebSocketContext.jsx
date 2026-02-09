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

    // Ref to track current list for instant access in WS handlers (to filter duplicates/updates)
    const activeUserListsRef = useRef([]);
    useEffect(() => {
        activeUserListsRef.current = activeUserLists;
    }, [activeUserLists]);

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
            // console.log("WebSocket message:", event);
            try {
                data = JSON.parse(event.data);
                // console.log("WebSocket data:", data);
            } catch (err) {
                console.log("Invalid WS message", err);
                return;
            }
            // console.log("WebSocket data:", data?.type);
            // Ignore heartbeat pong
            if (data?.type === "pong") return;

            // --- New Real-time SOS Handlers ---

            // INITIAL_DATA or NEW_SOS: Replace/Append list
            if (data?.type === 'INITIAL_DATA' || data?.type === 'NEW_SOS') {
                const payload = data.data;
                console.log(`[WS] Received ${data?.type}, payload length:`, Array.isArray(payload) ? payload.length : 1);
                let processedList = [];

                if (Array.isArray(payload)) {
                    processedList = payload;
                    setActiveUserLists(processedList);
                    console.log('[WS] Set activeUserLists with array, count:', processedList.length);
                } else if (payload && typeof payload === 'object') {
                    // It's a single SOS object, append it to the current list
                    processedList = [payload];
                    setActiveUserLists(prev => {
                        // Prevent duplicates if appending
                        const exists = prev.find(item => item._id === payload._id);
                        if (exists) {
                            // If it exists, update it with new data (to reflect status changes)
                            return prev.map(item => item._id === payload._id ? payload : item);
                        }
                        const newList = [payload, ...prev];
                        console.log('[WS] Added new SOS to list, new count:', newList.length);
                        return newList;
                    });
                }

                // Trigger Sound for NEW_SOS (if we have valid data)
                if (data?.type === 'NEW_SOS' && (Array.isArray(payload) ? payload.length > 0 : !!payload)) {
                    let isTrulyNew = false;
                    const currentList = activeUserListsRef.current; // Use Ref for instant check

                    if (Array.isArray(payload)) {
                        // If any item in the batch is new
                        isTrulyNew = payload.some(newItem => !currentList.find(existing => existing._id === newItem._id));
                    } else {
                        // Single object
                        isTrulyNew = !currentList.find(existing => existing._id === payload._id);
                    }

                    if (isTrulyNew) {
                        setnewSOS((prev) => ({ count: prev.count + 1, type: "new_sos" }));
                    }
                }
                return;
            }



            // SOS_UPDATE: Full list update OR Single Update
            if (data?.type === 'SOS_UPDATE') {
                if (Array.isArray(data.data)) {
                    setActiveUserLists(data.data);
                } else if (data.data && typeof data.data === 'object') {
                    const updatedSOS = data.data;

                    // Check if the SOS is resolved (cancelled or help received)
                    // Logic adapted from Home.jsx display condition:
                    //For ARMED_SOS: check armedSosstatus
                    // For others: check help_received
                    const isResolved = updatedSOS.sosType === 'ARMED_SOS'
                        ? !!updatedSOS.armedSosstatus
                        : !!updatedSOS.help_received;

                    if (isResolved) {
                        // Remove from list if resolved
                        setActiveUserLists(prev => prev.filter(item => item._id !== updatedSOS._id));
                    } else {
                        // Handle single item update (Update or Add)
                        setActiveUserLists(prev => {
                            const exists = prev.find(item => item._id === updatedSOS._id);
                            if (exists) {
                                return prev.map(item => item._id === updatedSOS._id ? updatedSOS : item);
                            }
                            // If it's an update but we don't have it, we probably should add it (or ignore depending on logic).
                            // Adding it is safer for sync.
                            return [updatedSOS, ...prev];
                        });
                    }
                }
                return;
            }

            // SOS_RESOLVED: Remove specific ID
            if (data?.type === 'SOS_RESOLVED') {
                const resolvedId = data.resolvedId;
                if (resolvedId) {
                    setActiveUserLists(prev => prev.filter(item => item._id !== resolvedId));
                }
                return;
            }


            if (data?.sos_update === true) {
                setActiveUserLists(data.data)
            }
            // Request reached users update
            if (data?.request_reached_update) {
                const { sosId, count } = data.request_reached_update;

                // Check if this SOS exists in our list
                const existsInList = activeUserListsRef.current.find(item => item._id === sosId);

                if (existsInList) {
                    // SOS exists, just update the count
                    setRequestCounts(prev => ({
                        ...prev,
                        [sosId]: { ...prev[sosId], req_reach: count }
                    }));
                    setActiveUserLists(prev => prev.map(item =>
                        item._id === sosId ? { ...item, req_reach: count } : item
                    ));
                } else {
                    // This is a NEW SOS - trigger a refetch signal
                    // console.log('[WS] New SOS detected via request_reached_update:', sosId, 'Triggering refetch');

                    // Trigger alert sound and refetch signal
                    setnewSOS((prev) => ({ count: prev.count + 1, type: "new_sos", sosId: sosId }));

                    // Also update the count for when the data arrives
                    setRequestCounts(prev => ({
                        ...prev,
                        [sosId]: { ...prev[sosId], req_reach: count }
                    }));
                }
                return;
            }

            // Request accepted users update
            if (data?.request_accepted_update) {
                const { sosId, count } = data.request_accepted_update;

                // Check if this SOS exists in our list
                const existsInList = activeUserListsRef.current.find(item => item._id === sosId);

                if (existsInList) {
                    // SOS exists, just update the count
                    setRequestCounts(prev => ({
                        ...prev,
                        [sosId]: { ...prev[sosId], req_accept: count }
                    }));
                    setActiveUserLists(prev => prev.map(item =>
                        item._id === sosId ? { ...item, req_accept: count } : item
                    ));
                } else {
                    // This is a NEW SOS - trigger a refetch signal
                    // console.log('[WS] New SOS detected via request_accepted_update:', sosId, 'Triggering refetch');

                    // Trigger alert sound and refetch signal
                    setnewSOS((prev) => ({ count: prev.count + 1, type: "new_sos", sosId: sosId }));

                    // Also update the count for when the data arrives
                    setRequestCounts(prev => ({
                        ...prev,
                        [sosId]: { ...prev[sosId], req_accept: count }
                    }));
                }
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

            // Handle { sos_update: true, data: [...] } format
            if ((data?.sos_update === true || data?.sos_update === 'true') && Array.isArray(data?.data)) {
                // console.log('[WS] Received sos_update: true, count:', data.data.length);
                const updates = data.data;

                // 1. Calculate new Active List
                setActiveUserLists(prevList => {
                    let newList = [...prevList];

                    updates.forEach(updatedItem => {
                        // Check resolution
                        const isResolved = updatedItem.sosType === 'ARMED_SOS'
                            ? !!updatedItem.armedSosstatus
                            : !!updatedItem.help_received;

                        if (isResolved) {
                            // Remove
                            newList = newList.filter(item => item._id !== updatedItem._id);
                        } else {
                            // Update or Add
                            const index = newList.findIndex(item => item._id === updatedItem._id);
                            if (index !== -1) {
                                // Merge
                                newList[index] = {
                                    ...newList[index],
                                    ...updatedItem,
                                    req_accept: updatedItem.reqAcceptUserIds ? updatedItem.reqAcceptUserIds.length : newList[index].req_accept,
                                    req_reach: updatedItem.reqReachedUserIds ? updatedItem.reqReachedUserIds.length : newList[index].req_reach
                                };
                            }
                        }
                    });
                    return newList;
                });

                // 2. Calculate new Request Counts
                setRequestCounts(prevCounts => {
                    const newCounts = { ...prevCounts };

                    updates.forEach(updatedItem => {
                        const currentCountObj = newCounts[updatedItem._id] || {};
                        let hasChange = false;

                        // Check Reached
                        if (updatedItem.reqReachedUserIds && Array.isArray(updatedItem.reqReachedUserIds)) {
                            currentCountObj.req_reach = updatedItem.reqReachedUserIds.length;
                            hasChange = true;
                        }

                        // Check Accepted
                        if (updatedItem.reqAcceptUserIds && Array.isArray(updatedItem.reqAcceptUserIds)) {
                            currentCountObj.req_accept = updatedItem.reqAcceptUserIds.length;
                            hasChange = true;
                        }

                        if (hasChange) {
                            newCounts[updatedItem._id] = { ...currentCountObj };
                        }
                    });

                    return newCounts;
                });

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
            setActiveUserLists,
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
        </WebSocketContext.Provider >
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
