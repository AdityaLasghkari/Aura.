import api from './api';

const userService = {
    getCurators: async () => {
        const response = await api.get('/users/curators');
        return response.data;
    },

    getProfile: async (id) => {
        const response = await api.get(`/users/profile/${id}`);
        return response.data;
    },

    toggleFollow: async (id) => {
        const response = await api.post(`/users/follow/${id}`);
        return response.data;
    },
    getStats: async () => {
        const response = await api.get('/users/stats');
        return response.data;
    },
    updateProfile: async (userData) => {
        // Check if userData is FormData, if not it's probably a JSON update
        const isFormData = userData instanceof FormData;

        const response = await api.put('/users/profile', userData, {
            headers: {
                'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
            }
        });
        return response.data;
    }
};

export default userService;
