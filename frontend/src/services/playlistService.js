import api from './api';

const playlistService = {
    createPlaylist: async (data) => {
        const response = await api.post('/playlists', data);
        return response.data;
    },

    getUserPlaylists: async (userId) => {
        const response = await api.get(`/playlists/user/${userId}`);
        return response.data;
    },

    getPublicPlaylists: async (params) => {
        const response = await api.get('/playlists', { params });
        return response.data;
    },

    getPlaylistById: async (id, code) => {
        const url = code ? `/playlists/${id}?code=${code}` : `/playlists/${id}`;
        const response = await api.get(url);
        return response.data;
    },

    addSong: async (id, songId) => {
        const response = await api.post(`/playlists/${id}/songs`, { songId });
        return response.data;
    },

    removeSong: async (id, songId) => {
        const response = await api.delete(`/playlists/${id}/songs/${songId}`);
        return response.data;
    },

    deletePlaylist: async (id) => {
        const response = await api.delete(`/playlists/${id}`);
        return response.data;
    },
};

export default playlistService;
