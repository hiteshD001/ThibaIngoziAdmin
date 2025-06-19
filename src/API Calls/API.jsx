/* eslint-disable react-hooks/exhaustive-deps */
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "./APIClient";

// --------------------------------------------------- CUSTOM HOOKS ---------------------------------------------------

// get list of user

export const useGetUserList = (
    key,
    role,
    company_id,
    page = 1,
    limit = 10,
    filter,
    notification_type
) => {
    const nav = useNavigate();

    const queryFn = async () => {
        return await apiClient.get(`${import.meta.env.VITE_BASEURL}/users`, {
            params: {
                role,
                page,
                limit,
                filter,
                company_id,
                notification_type,
            },
        });
    };

    const res = useQuery({
        queryKey: [
            key,
            role,
            company_id,
            page,
            limit,
            filter,
            notification_type,
        ],
        queryFn: queryFn,
        staleTime: 15 * 60 * 1000,
        placeholderData: keepPreviousData,
        retry: false,
    });

    if (res.error && res.error.response?.status === 401) {
        localStorage.clear();
        nav("/");
    }
    return res;
};

// get security service list
export const useGetSecurityList = () => {
    const queryFn = async () => {
        return await apiClient.get(
            `${import.meta.env.VITE_BASEURL}/users/get/securityCompany`
        );
    };
    const res = useQuery({
        queryKey: ["SecurityType"],
        queryFn: queryFn,
        staleTime: 15 * 60 * 1000,
    });

    return res;
};
// get eHailing lisy
export const useGeteHailingList = () => {
    const queryFn = async () => {
        return await apiClient.get(
            `${import.meta.env.VITE_BASEURL}/eHailingCompany`
        );
    };
    const res = useQuery({
        queryKey: ["eHailing"],
        queryFn: queryFn,
        staleTime: 15 * 60 * 1000,
    });

    return res;
};

export const useGetArmedSosDetails = (id) => {
    const nav = useNavigate();

    const queryFn = async () => {
        return await apiClient.get(
            `${import.meta.env.VITE_BASEURL}/armed-sos/${id}`
        );
    };

    const res = useQuery({
        queryKey: [id], // Unique query key based on the ID
        queryFn: queryFn,
        staleTime: 15 * 60 * 1000, // 15 minutes stale time
        placeholderData: keepPreviousData, // Keep previous data while fetching new
        retry: false, // Don't retry on failure
    });

    // Handle unauthorized access
    if (res.error && res.error.response?.status === 401) {
        localStorage.clear();
        nav("/");
    }

    return res;
};

export const useGetArmedSoSByCompanyId = (companyId) => {
    const queryFn = async () => {
        return await apiClient.get(
            `${import.meta.env.VITE_BASEURL}/armed-sos/company/${companyId}`
        );
    };

    const res = useQuery({
        queryKey: [companyId],
        queryFn: queryFn,
        staleTime: 15 * 60 * 1000,
        retry: false,
    });
    if (res.error && res.error.response?.status === 401) {
        localStorage.clear();
        nav("/");
    }
    return res;
};

export const useGetArmedSoS = () => {
    const navigate = useNavigate(); // Fix: Use navigate for redirection

    const queryFn = async () =>
        apiClient.get(`${import.meta.env.VITE_BASEURL}/armed-sos`);

    const res = useQuery({
        queryKey: ["ArmedSOS List"],
        queryFn,
        staleTime: 15 * 60 * 1000,
        retry: false,
        onError: (error) => {
            // Fix: Handle error using onError
            if (error.response?.status === 401) {
                localStorage.clear();
                navigate("/");
            }
        },
    });

    return res;
};

// armed sos amount

export const useCreateSosAmount = (onSuccess, onError) => {
    const mutationFn = async (data) => {
        return await apiClient.post(
            `${import.meta.env.VITE_BASEURL}/armed-sos/sosAmount`,
            data
        );
    };

    const mutation = useMutation({
        mutationFn,
        onSuccess,
        onError,
    });

    return mutation;
};

export const useUpdateSosAmount = (onSucess, onError) => {

    const mutationFn = async ({ id, data }) => {
        return await apiClient.put(
            `${import.meta.env.VITE_BASEURL}/armed-sos/sosAmount/${id}`,
            data
        );
    };

    const res = useMutation({
        mutationFn: mutationFn,
        onSuccess: () => onSucess(),
        onError: (err) => onError(err),
    });

    return res;
};

export const useGetSoSAmountList = (
    key,
    page = 1,
    limit = 10,
    filter,
) => {
    const navigate = useNavigate();

    const queryFn = async () =>
        apiClient.get(`${import.meta.env.VITE_BASEURL}/armed-sos/get/sosAmounts`, {
            params: {
                page,
                limit,
                filter,
            },
        });

    const res = useQuery({
        queryKey: [
            key,
            page,
            limit,
            filter,
        ],
        queryFn,
        staleTime: 15 * 60 * 1000,
        retry: false,
        onError: (error) => {
            if (error.response?.status === 401) {
                localStorage.clear();
                navigate("/");
            }
        },
    });

    return res;
};

export const useGetSoSAmount = (id) => {
    const navigate = useNavigate();

    const queryFn = async () =>
        apiClient.get(`${import.meta.env.VITE_BASEURL}/armed-sos/sos/split-amount/${id}`);

    const res = useQuery({
        queryKey: ["ArmedSOSAmount List"],
        queryFn,
        staleTime: 15 * 60 * 1000,
        retry: false,
        onError: (error) => {
            if (error.response?.status === 401) {
                localStorage.clear();
                navigate("/");
            }
        },
    });

    return res;
};

export const useDeleteSosAmount = (onSuccess, onError) => {
    const mutationFn = async (id) => {
        return await apiClient.delete(`${import.meta.env.VITE_BASEURL}/armed-sos/delete/sosAmount/${id}`)
    }
    const mutation = useMutation({
        mutationFn,
        onSuccess,
        onError
    })
    return mutation
}

// trip
export const useGetTripList = (key, page = 1, limit = 10, filter) => {
    const nav = useNavigate();

    const queryFn = async () => {
        return await apiClient.get(`${import.meta.env.VITE_BASEURL}/userTrip`, {
            params: { page, limit, filter },
        });
    };

    const res = useQuery({
        queryKey: [key, page, limit, filter],
        queryFn: queryFn,
        staleTime: 15 * 60 * 1000,
        retry: false,
    });

    if (res.error && res.error.response?.status === 401) {
        localStorage.clear();
        nav("/");
    }
    return res;
};

export const useDeleteUserTrip = (onSuccess, onError) => {
    const mutationFn = async (id) => {
        return await apiClient.delete(
            `${import.meta.env.VITE_BASEURL}/userTrip/${id}`
        );
    };

    const mutation = useMutation({
        mutationFn,
        onSuccess,
        onError,
    });

    return mutation;
};

// get list of Province
export const useGetProvinceList = (id) => {
    const queryFn = async (queryId) => {
        return await apiClient.get(
            `${import.meta.env.VITE_BASEURL}/province?country_id=${queryId}`
        );
    };

    const res = useQuery({
        queryKey: ["Province List", id],
        queryFn: () => queryFn(id),
        staleTime: 15 * 60 * 1000,
        enabled: Boolean(id),
        retry: false,
    });

    return res;
};

// get list of Country

export const useGetCountryList = () => {
    const queryFn = async () => {
        return await apiClient.get(`${import.meta.env.VITE_BASEURL}/country`);
    };

    const res = useQuery({
        queryKey: ["Country List"],
        queryFn: queryFn,
        staleTime: 15 * 60 * 1000,
        retry: false,
    });

    return res;
};

// get list of Services

export const useGetServicesList = () => {
    const queryFn = async () => {
        return await apiClient.get(`${import.meta.env.VITE_BASEURL}/notificationType`);
    };

    const res = useQuery({
        queryKey: ["Services List"],
        queryFn: queryFn,
        staleTime: 15 * 60 * 1000,
        retry: false,
    });

    return res?.data?.data;
};

// get single user

export const useGetUser = (userId) => {
    const queryFn = async () => {
        return await apiClient.get(
            `${import.meta.env.VITE_BASEURL}/users/${userId}`
        );
    };

    const res = useQuery({
        queryKey: ["user", userId],
        queryFn: queryFn,
        staleTime: Infinity,
        enabled: userId !== undefined,
    });

    return res;
};

// recent driver list

export const useGetRecentSOS = () => {
    const queryFn = async () => {
        return await apiClient.get(
            `${import.meta.env.VITE_BASEURL}/location/recent-sos-locations`
        );
    };

    const res = useQuery({
        queryKey: ["recentSOS"],
        queryFn: queryFn,
        staleTime: 15 * 60 * 1000,
    });

    return res;
};

// active driver list

export const useGetActiveSOS = () => {
    const queryFn = async () => {
        return await apiClient.get(
            `${import.meta.env.VITE_BASEURL}/location/sos-location`
        );
    };

    const res = useQuery({
        queryKey: ["activeSOS"],
        queryFn: queryFn,
        staleTime: 15 * 60 * 1000,
    });

    return res?.data?.data;
};

// get chart data

export const useGetChartData = (notificationType) => {
    const [chartData, setChartData] = useState(new Array(12).fill(0));

    const queryFn = async () => {
        const currentYear = new Date().getFullYear();
        const startDate = `${currentYear}-01-01`;
        const endDate = `${currentYear}-12-31`;

        return await apiClient.get(
            `${import.meta.env.VITE_BASEURL}/location/sos-month`,
            {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    type: notificationType,
                },
            }
        );
    };

    const res = useQuery({
        queryKey: ["chartData", notificationType], // Re-fetch when notificationType changes
        queryFn: queryFn,
        staleTime: 15 * 60 * 1000,
    });

    useEffect(() => {
        if (res.data?.data) {
            const newData = new Array(12).fill(0);
            res.data.data.forEach((item) => {
                newData[item.month - 1] = item.count;
            });
            setChartData(newData);
        }
    }, [res.data]);

    return chartData;
};

// get hotspot

export const useGetHotspot = (type, company_id, notificationType) => {
    const params = {};
    if (type) {
        params.type = type;
    }
    if (notificationType) {
        params.notificationType = notificationType;
    }
    if (company_id) {
        params.company_id = company_id;
    }
    const queryFn = async () => {
        return await apiClient.get(
            `${import.meta.env.VITE_BASEURL}/location/hotspot`,
            {
                params,
            }
        );
    };

    const res = useQuery({
        queryKey: ["hotspot", type, notificationType], // Add notificationType to the query key
        queryFn: queryFn,
        staleTime: 15 * 60 * 1000,
        placeholderData: [],
    });

    return res;
};

export const useGetNotificationType = () => {
    const queryFn = async () => {
        return await apiClient.get(
            `${import.meta.env.VITE_BASEURL}/notificationType`
        );
    };
    const res = useQuery({
        queryKey: ["notificationType"],
        queryFn: queryFn,
        staleTime: 15 * 60 * 1000,
    });

    return res;
};

// get all orders

export const useGetAllOrders = (page = 0, limit = 100) => {
    // const token = localStorage.getItem("accessToken");

    const queryFn = async () => {
        return await apiClient.get(
            `${import.meta.env.VITE_BASEURL}/payment/getAllOrders`,
            {
                params: { page, limit },
            }
        );
    };

    const res = useQuery({
        queryKey: ["allOrders", page, limit],
        queryFn: queryFn,
        staleTime: 15 * 60 * 1000,
    });

    return res;
};

// update order

export const useUpdateStatus = (onSucess, onError) => {
    // const token = localStorage.getItem("accessToken");

    const mutationFn = async ({ id, quantity, status }) => {
        return await apiClient.put(
            `${import.meta.env.VITE_BASEURL}/payment/updateOrder/${id}`,
            {
                item_quantity: quantity,
                status,
            }
        );
    };

    const res = useMutation({
        mutationFn: mutationFn,
        onSuccess: () => onSucess(),
        onError: (err) => onError(err),
    });

    return res;
};

// reset password

export const useResetPassword = (onSuccess, onError) => {
    const mutationFn = async ({ password, token }) => {
        const response = await apiClient.post(
            `${import.meta.env.VITE_BASEURL}/users/reset-password/${token}`,
            { newPassword: password }
        );
        return response.data
    };

    const mutation = useMutation({
        mutationFn,
        onSuccess,
        onError,
    });

    return mutation;
};

// delete user

export const useDeleteUser = (onSuccess, onError) => {
    const mutationFn = async (id) => {
        return await apiClient.delete(
            `${import.meta.env.VITE_BASEURL}/users/${id}`
        );
    };

    const mutation = useMutation({
        mutationFn,
        onSuccess,
        onError,
    });

    return mutation;
};

// login user

export const useUserLogin = (onSuccess, onError) => {
    const mutationFn = async (data) => {
        return await apiClient.post(
            `${import.meta.env.VITE_BASEURL}/users/login`,
            data
        );
    };

    const mutation = useMutation({
        mutationFn,
        onSuccess,
        onError,
    });

    return mutation;
};

// register user

export const useRegister = (onSuccess, onError) => {
    const mutationFn = async (data) => {
        return await apiClient.post(
            `${import.meta.env.VITE_BASEURL}/users/register`,
            data
        );
    };

    const mutation = useMutation({
        mutationFn,
        onSuccess,
        onError,
    });

    return mutation;
};

// update user

export const useUpdateUser = (onSuccess, onError) => {
    const mutationFn = async ({ id, data }) => {
        return await apiClient.put(
            `${import.meta.env.VITE_BASEURL}/users/${id}`,
            data
        );
    };

    const mutation = useMutation({
        mutationFn,
        onSuccess,
        onError,
    });

    return mutation;
};

// update Location Status

export const useUpdateLocationStatus = (onSuccess, onError) => {
    const mutationFn = async ({ id, data }) => {
        return await apiClient.put(
            `${import.meta.env.VITE_BASEURL}/location/${id}`,
            data
        );
    };

    const mutation = useMutation({
        mutationFn,
        onSuccess,
        onError,
    });

    return mutation;
};

export const useGetLocationByLocationId = (locationId) => {
    const queryFn = async () => {
        try {
            if (locationId) {
                const response = await apiClient.get(
                    locationId`${import.meta.env.VITE_BASEURL
                        }/location/${locationId}?google_map_api=true`
                );
                return response.data;
            }
        } catch (error) {
            return error.response?.data || "Failed to fetch location";
        }
    };

    const res = useQuery({
        queryKey: ["location", locationId],
        queryFn: queryFn,
        staleTime: 0,
        refetchInterval: 5000,
        onError: (err) => console.error("API Error:", err.message),
    });

    return {
        locations: res.data,
        error: res.error,
        isLoading: res.isLoading,
    };
};

export const useFileUpload = (onSuccess, onError) => {
    const mutationFn = async (data) => {
        return await apiClient.post(
            `${import.meta.env.VITE_BASEURL}/users/register/bulk`,
            data
        );
    };

    const mutation = useMutation({
        mutationFn,
        onSuccess,
        onError,
    });

    return mutation;
};


// payout api

export const armedSosPayout = (onSuccess, onError) => {
    const mutationFn = async (data) => {
        return await apiClient.post(
            `${import.meta.env.VITE_BASEURL}/armed-sos/payout`,
            data
        );
    };

    const mutation = useMutation({
        mutationFn,
        onSuccess,
        onError,
    });

    return mutation;
}

export const payoutUserUpdate = (onSuccess, onError) => {
    const mutationFn = async (data) => {
        return await apiClient.post(
            `${import.meta.env.VITE_BASEURL}/armed-sos/payout/user`,
            data
        );
    };

    const mutation = useMutation({
        mutationFn,
        onSuccess,
        onError,
    });

    return mutation;
}
