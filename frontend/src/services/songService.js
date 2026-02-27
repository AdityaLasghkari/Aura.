import api from './api';

const songService = {
    getSongs: async (params) => {
        const response = await api.get('/songs', { params });
        return response.data;
    },

    getSongById: async (id) => {
        const response = await api.get(`/songs/${id}`);
        return response.data;
    },

    getTrending: async (limit) => {
        const response = await api.get('/songs/trending', { params: { limit } });
        return response.data;
    },

    getRecent: async (limit) => {
        const response = await api.get('/songs/recent', { params: { limit } });
        return response.data;
    },

    getLiked: async () => {
        const response = await api.get('/songs/liked');
        return response.data;
    },

    uploadSong: async (formData) => {
        const response = await api.post('/songs', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    toggleLike: async (id) => {
        const response = await api.post(`/songs/${id}/like`);
        return response.data;
    },

    incrementPlays: async (id) => {
        const response = await api.post(`/songs/${id}/play`);
        return response.data;
    },

    deleteSong: async (id) => {
        const response = await api.delete(`/songs/${id}`);
        return response.data;
    },
};

export default songService;
