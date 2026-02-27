import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import { LogOut, Settings, Heart, Music, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState([
        { label: 'LIKED TRACKS', value: 0, icon: <Heart size={16} /> },
        { label: 'PLAYLISTS', value: 0, icon: <Music size={16} /> },
        { label: 'LISTENING HRS', value: 0, icon: <Clock size={16} /> },
    ]);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await userService.getStats();
                const { likedSongsCount, playlistsCount, totalListeningHours } = response.data;
                setStats([
                    { label: 'LIKED TRACKS', value: likedSongsCount, icon: <Heart size={16} /> },
                    { label: 'PLAYLISTS', value: playlistsCount, icon: <Music size={16} /> },
                    { label: 'LISTENING HRS', value: totalListeningHours, icon: <Clock size={16} /> },
                ]);
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoadingStats(false);
            }
        };

        if (user) fetchStats();
    }, [user]);


    if (!user) return null;

    return (
        <div className="pt-32 pb-32 px-6 md:px-12 lg:px-24 min-h-screen bg-background">
            <div className="max-w-7xl mx-auto">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center md:items-end justify-between border-b border-border pb-16 space-y-12 md:space-y-0">
                    <div className="flex flex-col md:flex-row items-center md:items-end space-y-8 md:space-y-0 md:space-x-12">
                        {/* Avatar */}
                        {/* Avatar */}
                        <div className="w-48 h-48 rounded-full bg-[#0d0d0d] flex items-center justify-center border border-white/5 shadow-2xl">
                            <span className="text-white text-6xl font-serif">
                                {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                            </span>
                        </div>

                        {/* User Info */}
                        <div className="text-center md:text-left space-y-4">
                            <span className="label-text text-gray-400 font-bold tracking-[0.3em]">MEMBERSHIP SINCE 2026</span>
                            <h1 className="hero-title text-4xl sm:text-6xl lg:text-8xl leading-none tracking-tight">{user.name}</h1>
                            <p className="text-[10px] tracking-[0.4em] text-gray-400 font-medium uppercase">{user.email}</p>
                        </div>
                    </div>

                    <div className="flex space-x-6">
                        <Link to="/settings" className="p-4 border border-border rounded-full hover:bg-foreground hover:text-background transition-all">
                            <Settings size={20} strokeWidth={1.5} />
                        </Link>
                        <button
                            onClick={logout}
                            className="px-10 py-4 bg-foreground text-background text-[10px] tracking-[0.4em] uppercase flex items-center space-x-4 border border-transparent hover:bg-background hover:text-foreground hover:border-foreground transition-all font-bold"
                        >
                            <LogOut size={14} />
                            <span>END SESSION</span>
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-24">
                    {stats.map((stat, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={stat.label}
                            className="p-8 md:p-12 bg-muted/30 border border-transparent hover:border-foreground transition-colors group"
                        >
                            <div className="flex justify-between items-start mb-6 md:mb-8">
                                <span className="text-gray-400 group-hover:text-foreground transition-colors">{stat.icon}</span>
                                <span className="text-[10px] tracking-widest text-gray-400 font-medium">{stat.label}</span>
                            </div>
                            <p className="font-serif text-4xl md:text-6xl">{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Content Sections */}
                <div className="mt-32 grid grid-cols-1 lg:grid-cols-2 gap-24">
                    <div className="space-y-12">
                        <div className="flex justify-between items-end border-b border-border pb-6">
                            <h3 className="section-heading text-lg">RECENTLY<br />RESONATED</h3>
                            <button className="text-[10px] tracking-widest uppercase text-gray-400 hover:text-foreground transition-colors">VIEW ENTIRE HISTORY</button>
                        </div>
                        <div className="space-y-6">
                            <p className="font-serif text-2xl text-gray-400 py-12 text-center border-2 border-dashed border-border uppercase">No recent activity detected.</p>
                        </div>
                    </div>

                    <div className="space-y-12">
                        <div className="flex justify-between items-end border-b border-border pb-6">
                            <h3 className="section-heading text-lg">COLLECTED<br />CURATIONS</h3>
                            <button className="text-[10px] tracking-widest uppercase text-gray-400 hover:text-foreground transition-colors">NEW PLAYLIST</button>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="aspect-square bg-muted flex items-center justify-center p-8 text-center group cursor-pointer border border-transparent hover:border-foreground transition-all">
                                <div>
                                    <p className="font-serif text-2xl mb-2">After Hours</p>
                                    <p className="text-[9px] tracking-widest text-gray-400 uppercase">12 TRACKS</p>
                                </div>
                            </div>
                            <div className="aspect-square bg-muted flex items-center justify-center p-8 text-center group cursor-pointer border border-transparent hover:border-foreground transition-all">
                                <div>
                                    <p className="font-serif text-2xl mb-2">Morning ritual</p>
                                    <p className="text-[9px] tracking-widest text-gray-400 uppercase">08 TRACKS</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
