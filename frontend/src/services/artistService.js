import api from './api';

const artistService = {
    getArtists: async () => {
        const response = await api.get('/artists');
        return response.data;
    },

    checkArtist: async (name) => {
        const response = await api.get(`/artists/check/${encodeURIComponent(name)}`);
        return response.data;
    }
};

export default artistService;
