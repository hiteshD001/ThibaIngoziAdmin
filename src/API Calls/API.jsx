import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// --------------------------------------------------- CUSTOM HOOKS ---------------------------------------------------

// get list of user

export const useGetUserList = (key, role, company_id, page = 1, limit = 10, filter) => {
    const nav = useNavigate()
    const token = localStorage.getItem("accessToken");

    const queryFn = async () => {
        return await axios.get(`${import.meta.env.VITE_BASEURL}/users`, {
            params: { role, page, limit, filter, company_id },
            headers: {
                "Authorization": `Bearer ${token}`
            }
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
    const token = localStorage.getItem("accessToken");

    const queryFn = async () => {
        return await axios.get(`${import.meta.env.VITE_BASEURL}/province?country_id=${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
    };

    const res = useQuery({
        queryKey: ["Province List"],
        queryFn: queryFn,
        staleTime: 15 * 60 * 1000,
        enabled: Boolean(id),
        retry: false
    });

    return res;
};

// get list of Country

export const useGetCountryList = () => {
    const token = localStorage.getItem("accessToken");

    const queryFn = async () => {
        return await axios.get(`${import.meta.env.VITE_BASEURL}/country`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
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
    const token = localStorage.getItem("accessToken");

    const queryFn = async () => {
        return await axios.get(`${import.meta.env.VITE_BASEURL}/users/${userId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
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
    const token = localStorage.getItem("accessToken");

    const queryFn = async () => {
        return await axios.get(`${import.meta.env.VITE_BASEURL}/location/recent-sos-locations`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
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
    const token = localStorage.getItem("accessToken");

    const queryFn = async () => {
        const currentYear = new Date().getFullYear();
        const startDate = `${currentYear}-01-01`;
        const endDate = `${currentYear}-12-31`;

        return await axios.get(`${import.meta.env.VITE_BASEURL}/location/sos-month`, {
            params: { start_date: startDate, end_date: endDate },
            headers: {
                "Authorization": `Bearer ${token}`
            }
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
    const token = localStorage.getItem("accessToken");

    const queryFn = async () => {
        return await axios.get(`${import.meta.env.VITE_BASEURL}/location/hotspot`, {
            params: { type },
            headers: {
                "Authorization": `Bearer ${token}`
            }
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
    const token = localStorage.getItem("accessToken");

    const queryFn = async () => {
        return await axios.get(`${import.meta.env.VITE_BASEURL}/payment/getAllOrders`, {
            params: { page, limit },
            headers: {
                "Authorization": `Bearer ${token}`
            }
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
    const token = localStorage.getItem("accessToken");

    const mutationFn = async ({ id, quantity, status }) => {
        return await axios.put(`${import.meta.env.VITE_BASEURL}/payment/updateOrder/${id}`,
            {
                item_quantity: quantity,
                status
            },
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
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
        return await axios.post(
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
        const token = localStorage.getItem("accessToken");

        return await axios.delete(
            `${import.meta.env.VITE_BASEURL}/users/${id}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
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
        return await axios.post(`${import.meta.env.VITE_BASEURL}/users/login`, data);
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
        return await axios.post(`${import.meta.env.VITE_BASEURL}/users/register`, data);
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
        const token = localStorage.getItem("accessToken");

        return await axios.put(
            `${import.meta.env.VITE_BASEURL}/users/${id}`,
            data,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );
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
        console.log(data)
        const token = localStorage.getItem("accessToken");

        return await axios.post(`${import.meta.env.VITE_BASEURL}/users/register/bulk`, data,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );
    };

    const mutation = useMutation({
        mutationFn,
        onSuccess,
        onError
    });

    return mutation;
}

// const token = localStorage.getItem("accessToken");

// export const userlogin = async (data) => {
//     return await axios.post(`${import.meta.env.VITE_BASEURL}/users/login`, data);
// }

// export const register = async (data) => {
//     return await axios.post(`${import.meta.env.VITE_BASEURL}/users/register`, data);
// }

// export const updateUser = async ({ id, data }) => {
//     const token = localStorage.getItem("accessToken");

//     return await axios.put(`${import.meta.env.VITE_BASEURL}/users/${id}`, data,
//         {
//             headers: {
//                 "Authorization": `Bearer ${token}`
//             }
//         }
//     );
// }
//
// export const getUser = async ({ queryKey }) => {
//     const token = localStorage.getItem("accessToken");

//     const userid = queryKey[1]
//     return await axios.get(`${import.meta.env.VITE_BASEURL}/users/${userid}`,
//         {
//             headers: {
//                 "Authorization": `Bearer ${token}`
//             }
//         }
//     );
// }

// export const deleteUser = async (id) => {
//     const token = localStorage.getItem("accessToken");

//     console.log(id)
//     return await axios.delete(`${import.meta.env.VITE_BASEURL}/users/${id}`,
//         {
//             headers: {
//                 "Authorization": `Bearer ${token}`
//             }
//         }
//     );
// }

// export const userList = async ({ queryKey }) => {
//     const token = localStorage.getItem("accessToken");

//     const role = queryKey[1];
//     const company_id = queryKey[2];
//     const page = queryKey[3] || 0;
//     const limit = queryKey[4] || 10;
//     const filter = queryKey[5] || "";

//     try {
//         const response = await axios.get(`${import.meta.env.VITE_BASEURL}/users`, {
//             params: { role, page, limit, filter, company_id },
//             headers: {
//                 "Authorization": `Bearer ${token}`
//             }
//         });
//         return response;
//     } catch (error) {
//         console.error("Error fetching user list:", error);
//         // throw error;
//     }
// }

// export const getAllOrders = async ({ queryKey }) => {
//     const token = localStorage.getItem("accessToken");

//     const page = queryKey[1] || 0;
//     const limit = queryKey[2] || 100;

//     return await axios.get(`${import.meta.env.VITE_BASEURL}/payment/getAllOrders`,
//         {
//             params: { page, limit },
//             headers: {
//                 "Authorization": `Bearer ${token}`
//             }
//         }
//     );
// }



// export const getRecentSOS = async () => {
//     const token = localStorage.getItem("accessToken");

//     return await axios.get(`${import.meta.env.VITE_BASEURL}/location/recent-sos-locations`,
//         {
//             headers: {
//                 "Authorization": `Bearer ${token}`
//             }
//         }
//     );
// }

// export const getchartData = async () => {
//     const token = localStorage.getItem("accessToken");

//     const currentYear = new Date().getFullYear();

//     const startDate = `${currentYear}-01-01`;
//     const endDate = `${currentYear}-12-31`;

//     return await axios.get(`${import.meta.env.VITE_BASEURL}/location/sos-month?start_date=${startDate}&end_date=${endDate}`,
//         {
//             headers: {
//                 "Authorization": `Bearer ${token}`
//             }
//         }
//     );
// }


// export const getHotspot = async ({ queryKey }) => {
//     const token = localStorage.getItem("accessToken");

//     const type = queryKey[1]

//     return await axios.get(`${import.meta.env.VITE_BASEURL}/location/hotspot`,
//         {
//             params: { type },
//             headers: {
//                 "Authorization": `Bearer ${token}`
//             }
//         }
//     );
// }

// export const getVehicleInfo = async ({ queryKey }) => {
//     const token = localStorage.getItem("accessToken");

//     const id = queryKey[1]

//     return await axios.get(`${import.meta.env.VITE_BASEURL}/vehicle/${id}`,
//         {
//             headers: {
//                 "Authorization": `Bearer ${token}`
//             }
//         }
//     );
// }
// export const updateStatus = async ({ id, quantity, status }) => {
//     const token = localStorage.getItem("accessToken");

//     return await axios.put(`${import.meta.env.VITE_BASEURL}/payment/updateOrder/${id}`,
//         {
//             item_quantity: quantity,
//             status
//         },
//         {
//             headers: {
//                 "Authorization": `Bearer ${token}`
//             }
//         }
//     );
// }

// export const resetPassword = async ({ password, token }) => {
//     return await axios.post(`${import.meta.env.VITE_BASEURL}/users/reset-password/${token}`, { newPassword: password });
// }