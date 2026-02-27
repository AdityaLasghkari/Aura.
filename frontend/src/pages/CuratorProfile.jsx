import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Music, Play, Plus, Heart, Share2, ArrowLeft, MoreHorizontal, Check } from 'lucide-react';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';
import SongListRow from '../components/music/SongListRow';
import toast from 'react-hot-toast';

const CuratorProfile = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const { playSong } = useMusic();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState('archive'); // 'archive', 'playlists'

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await userService.getProfile(id);
                setProfileData(res.data);
                if (currentUser) {
                    setIsFollowing(res.data.user.followers.includes(currentUser.id));
                }
            } catch (error) {
                toast.error('FAILED TO LOAD PROFILE');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id, currentUser]);

    const handleFollow = async () => {
        if (!currentUser) {
            toast.error('PLEASE LOGIN TO FOLLOW');
            return;
        }
        try {
            const res = await userService.toggleFollow(id);
            setIsFollowing(res.isFollowing);
            toast.success(res.message.toUpperCase());
            // Update follower count locally
            setProfileData(prev => ({
                ...prev,
                followersCount: res.isFollowing ? prev.followersCount + 1 : prev.followersCount - 1
            }));
        } catch (error) {
            toast.error('FOLLOW ACTION FAILED');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-[10px] tracking-[0.5em] text-gray-400"
            >
                LOADING_CURATOR
            </motion.div>
        </div>
    );

    if (!profileData) return <div className="pt-32 text-center hero-title">404_VOID</div>;

    const { user, songs, playlists, followersCount, followingCount } = profileData;

    return (
        <div className="min-h-screen pt-32 pb-32 bg-background text-foreground">
            {/* Minimalist Header */}
            <div className="px-6 md:px-12 lg:px-24 mb-24">
                <div className="max-w-[1920px] mx-auto flex flex-col items-center text-center space-y-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl w-full bg-muted/30 relative overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000 shadow-2xl"
                    >
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                className="w-full h-auto max-h-[75vh] object-contain mx-auto"
                                alt={user.name}
                            />
                        ) : (
                            <div className="w-full aspect-square flex items-center justify-center text-gray-300">
                                <User size={64} strokeWidth={1} />
                            </div>
                        )}
                    </motion.div>

                    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
                        <span className="label-text text-foreground tracking-[0.6em] block">{user.role.toUpperCase()}</span>
                        <h1 className="serif-display text-outline text-5xl md:text-9xl lg:text-[14rem] leading-[0.8] tracking-tighter uppercase break-words px-4">
                            {user.name}
                        </h1>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24 pt-8 w-full justify-center">
                        <div className="flex flex-wrap justify-center gap-12 lg:gap-24">
                            <div className="space-y-1 text-center">
                                <p className="text-[10px] tracking-widest text-gray-400 uppercase">Archive Size</p>
                                <p className="font-serif text-3xl">{songs.length}</p>
                            </div>
                            <div className="space-y-1 text-center">
                                <p className="text-[10px] tracking-widest text-gray-400 uppercase">Followers</p>
                                <p className="font-serif text-3xl">{followersCount}</p>
                            </div>
                            <div className="space-y-1 text-center">
                                <p className="text-[10px] tracking-widest text-gray-400 uppercase">Following</p>
                                <p className="font-serif text-3xl">{followingCount}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleFollow}
                                className={`px-12 py-4 text-[11px] tracking-[0.3em] uppercase transition-all duration-500 flex items-center space-x-3 ${isFollowing
                                    ? 'bg-transparent border border-foreground text-foreground hover:bg-foreground hover:text-background'
                                    : 'bg-foreground text-background border border-transparent hover:bg-background hover:text-foreground hover:border-foreground'
                                    }`}
                            >
                                {isFollowing ? (
                                    <>
                                        <Check size={14} />
                                        <span>Following</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus size={14} />
                                        <span>Follow</span>
                                    </>
                                )}
                            </motion.button>
                            <button className="w-12 h-12 flex items-center justify-center border border-border hover:border-foreground transition-colors">
                                <Share2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 md:px-12 lg:px-24 mb-16 sticky top-20 bg-background/90 backdrop-blur-xl z-30 py-6 border-b border-border">
                <div className="max-w-[1920px] mx-auto flex space-x-12">
                    <button
                        onClick={() => setActiveTab('archive')}
                        className={`text-[11px] tracking-[0.4em] uppercase transition-all ${activeTab === 'archive' ? 'text-foreground font-bold border-b-2 border-foreground pb-2' : 'text-gray-400 hover:text-foreground'}`}
                    >
                        Archive ({songs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('playlists')}
                        className={`text-[11px] tracking-[0.4em] uppercase transition-all ${activeTab === 'playlists' ? 'text-foreground font-bold border-b-2 border-foreground pb-2' : 'text-gray-400 hover:text-foreground'}`}
                    >
                        Playlists ({playlists.length})
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-6 md:px-12 lg:px-24">
                <div className="max-w-[1920px] mx-auto">
                    <AnimatePresence mode="wait">
                        {activeTab === 'archive' ? (
                            <motion.div
                                key="archive"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-12"
                            >
                                {songs.map((song, idx) => (
                                    <SongListRow
                                        key={song._id}
                                        song={song}
                                        queue={songs}
                                        index={idx}
                                        playSong={playSong}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="playlists"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
                            >
                                {playlists.map((playlist) => (
                                    <Link key={playlist._id} to={`/playlist/${playlist._id}`} className="group space-y-4">
                                        <div className="aspect-video bg-muted overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-1000">
                                            {playlist.coverUrl ? (
                                                <img src={playlist.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Music size={48} strokeWidth={1} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-serif text-2xl truncate">{playlist.title}</h3>
                                            <p className="text-[10px] uppercase tracking-widest text-gray-400">{playlist.songs.length} Tracks</p>
                                        </div>
                                    </Link>
                                ))}
                                {playlists.length === 0 && (
                                    <div className="col-span-full py-24 text-center border border-dashed border-border">
                                        <p className="text-gray-400 text-[10px] tracking-[0.5em] uppercase">No Public Playlists</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default CuratorProfile;
