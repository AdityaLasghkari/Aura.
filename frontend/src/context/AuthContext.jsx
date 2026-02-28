import { createContext, useContext, useState, useEffect } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import authService from '../services/authService';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const { login, register, logout: kindeLogout, isAuthenticated, isLoading: kindeIsLoading, user: kindeUser, getToken } = useKindeAuth();
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
        const setupKindeSession = async () => {
            if (kindeIsLoading) return;

            if (isAuthenticated) {
                try {
                    const token = await getToken();
                    localStorage.setItem('token', token);
                    // Ensure the token is attached to the api singleton
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    const baseUser = {
                        id: kindeUser.id,
                        name: kindeUser.given_name ? (kindeUser.given_name + ' ' + (kindeUser.family_name || '')) : kindeUser.email.split('@')[0],
                        email: kindeUser.email,
                        picture: kindeUser.picture
                    };

                    try {
                        const response = await authService.syncProfile(baseUser);
                        setUser(normalizeUser({ ...baseUser, ...response.data?.user }));
                    } catch (err) {
                        console.error('Failed to sync backend profile, falling back to Kinde user');
                        setUser(normalizeUser(baseUser));
                    }
                } catch (error) {
                    console.error('Failed to setup session', error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            } else {
                localStorage.removeItem('token');
                delete api.defaults.headers.common['Authorization'];
                setUser(null);
            }
            setLoading(false);
        };

        setupKindeSession();
    }, [isAuthenticated, kindeIsLoading, getToken, kindeUser]);

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        kindeLogout();
    };

    const updateUser = (userData) => {
        setUser(prev => prev ? normalizeUser({ ...prev, ...userData }) : null);
    };

    return (
        <AuthContext.Provider value={{ user, loading: loading || kindeIsLoading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
