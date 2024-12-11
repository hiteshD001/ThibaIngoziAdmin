/* eslint-disable react-hooks/exhaustive-deps */
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "./APIClient";

// --------------------------------------------------- CUSTOM HOOKS ---------------------------------------------------

// get list of user

export const useGetUserList = (key, role, company_id, page = 1, limit = 10, filter) => {
    const nav = useNavigate()

    const queryFn = async () => {
        return await apiClient.get(`${import.meta.env.VITE_BASEURL}/users`, {
            params: { role, page, limit, filter, company_id }
        });
    };

    const res = useQuery({
        queryKey: [key, role, company_id, page, limit, filter],
        queryFn: queryFn,
        staleTime: 15 * 60 * 1000,
        placeholderData: keepPreviousData,
        retry: false
    });

    if (res.error && res.error.response?.status === 401) {
        localStorage.clear();
        nav("/")
    }
    return res;
};

// get list of Province
export const useGetProvinceList = (id) => {

    const queryFn = async (queryId) => {
        return await apiClient.get(`${import.meta.env.VITE_BASEURL}/province?country_id=${queryId}`);
    };

    const res = useQuery({
        queryKey: ["Province List", id],
        queryFn: () => queryFn(id),
        staleTime: 15 * 60 * 1000,
        enabled: Boolean(id),
        retry: false
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
        retry: false
    });

    return res;
};

// get single user

export const useGetUser = (userId) => {

    const queryFn = async () => {
        return await apiClient.get(`${import.meta.env.VITE_BASEURL}/users/${userId}`);
    };

    const res = useQuery({
        queryKey: ['user', userId],
        queryFn: queryFn,
        staleTime: Infinity,
        enabled: userId !== undefined
    });

    return res;
};

// recent driver list

export const useGetRecentSOS = () => {
    const queryFn = async () => {
        return await apiClient.get(`${import.meta.env.VITE_BASEURL}/location/recent-sos-locations`);
    };

    const res = useQuery({
        queryKey: ['recentSOS'],
        queryFn: queryFn,
        staleTime: 15 * 60 * 1000,
    });

    return res;
};

// get chart data

export const useGetChartData = () => {
    const [chartData, setchartData] = useState(new Array(12).fill(0));

    const queryFn = async () => {
        const currentYear = new Date().getFullYear();
        const startDate = `${currentYear}-01-01`;
        const endDate = `${currentYear}-12-31`;

        return await apiClient.get(`${import.meta.env.VITE_BASEURL}/location/sos-month`, {
            params: { start_date: startDate, end_date: endDate },
        });
    };

    const res = useQuery({
        queryKey: ['chartData'],
        queryFn: queryFn,
        staleTime: 15 * 60 * 1000,
    });

    useEffect(() => {
        const newdata = [...chartData];
        res.data?.data.forEach((item) => {
            newdata[item.month - 1] = item.count;
        });

        setchartData(newdata);
    }, [res.data]);

    // return res;
    return chartData;
};

// get hotspot

export const useGetHotspot = (type) => {
    // const token = localStorage.getItem("accessToken");

    const queryFn = async () => {
        return await apiClient.get(`${import.meta.env.VITE_BASEURL}/location/hotspot`, {
            params: { type },
        });
    };

    const res = useQuery({
        queryKey: ['hotspot', type],
        queryFn: queryFn,
        staleTime: 15 * 60 * 1000,
        placeholderData: []
    });

    return res;
};

// get all orders

export const useGetAllOrders = (page = 0, limit = 100) => {
    // const token = localStorage.getItem("accessToken");

    const queryFn = async () => {
        return await apiClient.get(`${import.meta.env.VITE_BASEURL}/payment/getAllOrders`, {
            params: { page, limit },
        });
    };

    const res = useQuery({
        queryKey: ['allOrders', page, limit],
        queryFn: queryFn,
        staleTime: 15 * 60 * 1000,
    });

    return res;
};

// update order

export const useUpdateStatus = (onSucess, onError) => {
    // const token = localStorage.getItem("accessToken");

    const mutationFn = async ({ id, quantity, status }) => {
        return await apiClient.put(`${import.meta.env.VITE_BASEURL}/payment/updateOrder/${id}`,
            {
                item_quantity: quantity,
                status
            },
        );
    };

    const res = useMutation({
        mutationFn: mutationFn,
        onSuccess: () => onSucess(),
        onError: (err) => onError(err),
    })

    return res
}

// reset password

export const useResetPassword = (onSuccess, onError) => {
    const mutationFn = async ({ password, token }) => {
        return await apiClient.post(
            `${import.meta.env.VITE_BASEURL}/users/reset-password/${token}`,
            { newPassword: password }
        );
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
        return await apiClient.post(`${import.meta.env.VITE_BASEURL}/users/login`, data);
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
        return await apiClient.post(`${import.meta.env.VITE_BASEURL}/users/register`, data);
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
        return await apiClient.put(`${import.meta.env.VITE_BASEURL}/users/${id}`, data);
    };

    const mutation = useMutation({
        mutationFn,
        onSuccess,
        onError,
    });

    return mutation;
};

export const useFileUpload = (onSuccess, onError) => {
    const mutationFn = async (data) => {
        return await apiClient.post(`${import.meta.env.VITE_BASEURL}/users/register/bulk`, data);
    };

    const mutation = useMutation({
        mutationFn,
        onSuccess,
        onError
    });

    return mutation;
}