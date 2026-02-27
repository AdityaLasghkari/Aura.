import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const normalizeUser = (userData) => {
        if (!userData) return null;
        return {
            ...userData,
            _id: userData.id || userData._id,
            id: userData.id || userData._id
        };
    };

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await authService.getMe();
                    setUser(normalizeUser(response.data.user));
                } catch (error) {
                    console.error('Failed to fetch user', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        fetchUser();
    }, []);

    const login = async (credentials) => {
        const response = await authService.login(credentials);
        const { user: userData, token } = response.data;
        localStorage.setItem('token', token);
        setUser(normalizeUser(userData));
        return userData;
    };

    const register = async (userData) => {
        const response = await authService.register(userData);
        const { user: newUserData, token } = response.data;
        localStorage.setItem('token', token);
        setUser(normalizeUser(newUserData));
        return newUserData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(prev => prev ? normalizeUser({ ...prev, ...userData }) : null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
