import httpAxios from "./httpAxios";

const getUserProfileById = async (userId) => {
    const res = await httpAxios.get(`/api/public/users/${userId}`);
    return res.data;
};


const getUserAddresses = async (userId) => {
    console.warn("Fetching user addresses requires a public backend endpoint.");
    return [];
};

const updateUserProfile = async (userId, userData) => {
    const res = await httpAxios.put(`/api/admin/users/${userId}`, userData);
    return res.data;
};

const addAddress = async (userId, addressData) => {
    const res = await httpAxios.post(`/api/admin/users/${userId}/addresses`, addressData);
    return res.data;
};

const updateAddress = async (userId, addressId, addressData) => {
    const res = await httpAxios.put(`/api/admin/users/${userId}/addresses/${addressId}`, addressData);
    return res.data;
};

const deleteAddress = async (userId, addressId) => {
    const res = await httpAxios.delete(`/api/admin/users/${userId}/addresses/${addressId}`);
    return res.data;
};

// ... các hàm khác

const userService = { getUserProfileById, getUserAddresses, updateUserProfile, addAddress, updateAddress, deleteAddress };

export default userService;