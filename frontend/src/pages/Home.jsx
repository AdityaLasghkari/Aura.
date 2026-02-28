import { useState, useEffect } from 'react';
import { useMobileInView } from '../hooks/useMobileInView';
import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';
import SongCard from '../components/music/SongCard';
import ArtistSpotlight from '../components/music/ArtistSpotlight';
import songService from '../services/songService';
import { useMusic } from '../context/MusicContext';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';

const TrendingImage = ({ song }) => {
    const [imageError, setImageError] = useState(false);
    const { ref, isInView, isMobile } = useMobileInView(0.5);

    return song.coverUrl && !imageError ? (
        <img
            ref={ref}
            src={song.coverUrl}
            alt={song.title}
            className={`w-full h-full object-cover transition-all duration-700 
                ${isMobile && isInView ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`}
            onError={() => setImageError(true)}
        />
    ) : (
        <div className="w-full h-full flex items-center justify-center bg-black/5 text-[10px] font-serif opacity-40">
            {song.title?.charAt(0)}
        </div>
    );
};

const Home = () => {
    const navigate = useNavigate();
    const [trendingSongs, setTrendingSongs] = useState([]);

    const [recentSongs, setRecentSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { playSong } = useMusic();
    const { user, register } = useAuth();
    const { joinRoom } = useSync();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [trending, recent] = await Promise.all([
                    songService.getTrending(5),
                    songService.getRecent(8)
                ]);
                setTrendingSongs(trending.data.songs);
                setRecentSongs(recent.data.songs);
            } catch (error) {
                console.error('Error fetching songs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getAspectRatio = (index) => {
        const ratios = ['aspect-[4/5]', 'aspect-square', 'aspect-[3/4]', 'aspect-[4/5]', 'aspect-square'];
        return ratios[index % ratios.length];
    };

    const getOffsetClass = (index) => {
        return index % 3 === 1 ? 'mt-32' : index % 3 === 2 ? 'mt-16' : '';
    };

    return (
        <div className="space-y-20 pb-32">
            {/* Hero Section */}
            <section className="pt-32 pb-8 px-6 text-center max-w-5xl mx-auto">

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                    className="space-y-8"
                >
                    <div className="space-y-4">
                        <span className="label-text text-gray-400">SONIC DISCOVERY</span>
                        <h1 className="hero-title leading-[0.9]">ESSENTIAL<br />SENSATIONS</h1>
                    </div>

                    <p className="body-text max-w-2xl mx-auto text-lg md:text-xl text-gray-500 font-light leading-relaxed">
                        A minimalist sanctuary for the modern audiophile. Discover deep ambient textures, skeletal techno, and experimental soundscapes curated for intent.
                    </p>

                    <div className="flex justify-center space-x-12">
                        <div className="w-px h-24 bg-border"></div>
                    </div>
                </motion.div>

            </section>

            {/* Featured Grid (Asymmetric) */}
            <section className="px-6 md:px-12 lg:px-24">
                <div className="max-w-[1920px] mx-auto">
                    <div className="flex justify-between items-end mb-16 border-b border-border pb-8">
                        <h2 className="section-heading">LATEST<br />RELEASES</h2>
                        <p className="label-text pb-4">VOLUME 04 / 2026</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20">
                        {loading ? (
                            Array(8).fill(0).map((_, i) => (
                                <div key={i} className="animate-pulse space-y-4">
                                    <div className="aspect-[4/5] bg-muted w-full"></div>
                                    <div className="h-6 bg-muted w-3/4"></div>
                                    <div className="h-4 bg-muted w-1/2"></div>
                                </div>
                            ))
                        ) : (
                            recentSongs.map((song, index) => (
                                <SongCard
                                    key={song._id}
                                    song={song}
                                    queue={recentSongs}
                                    aspectRatio={getAspectRatio(index)}
                                    className={getOffsetClass(index)}
                                />
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Artist Spotlight */}
            <ArtistSpotlight />



            {/* Trending Section */}
            <section className="px-6 md:px-12 lg:px-24">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
                        <div className="lg:col-span-1 space-y-8">
                            <span className="label-text">CHARTING</span>
                            <h2 className="section-heading">TRENDING<br />NOW</h2>
                            <p className="body-text text-lg text-gray-400">The most resonant pieces within our community this week.</p>
                            <div className="pt-8">
                                <button className="text-[11px] tracking-[0.4em] uppercase border-b border-foreground pb-2 hover:opacity-50 transition-opacity">
                                    VIEW FULL CHART
                                </button>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-12">
                            {trendingSongs.map((song, index) => (
                                <div
                                    key={song._id}
                                    className="group flex items-center justify-between border-b border-border pb-8 hover:border-foreground transition-colors duration-500 cursor-pointer"
                                    onClick={() => playSong(song, trendingSongs)}


                                >
                                    <div className="flex items-center space-x-4 md:space-x-12 overflow-hidden">
                                        <span className="font-serif text-2xl md:text-4xl text-muted group-hover:text-foreground transition-colors duration-500 flex-shrink-0">
                                            {(index + 1).toString().padStart(2, '0')}
                                        </span>
                                        <div className="flex items-center space-x-4 md:space-x-6 overflow-hidden">
                                            <div className="w-12 h-12 md:w-16 md:h-16 bg-muted overflow-hidden relative group flex-shrink-0">
                                                <TrendingImage song={song} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-lg md:text-xl font-serif truncate">{song.title}</h4>
                                                <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-gray-400 mt-1 truncate">{song.artist}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="hidden sm:block text-[11px] tracking-widest text-gray-300 font-medium whitespace-nowrap">{song.genre}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - Only shown if not logged in */}
            {!user && (
                <section className="bg-black text-white py-48 px-6 text-center overflow-hidden relative border-y border-white/10">
                    {/* Visual Accents */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)]" />
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                        backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
                        backgroundSize: '100px 100px',
                        maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                    }} />

                    <div className="max-w-4xl mx-auto space-y-12 relative z-10 font-serif">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="hero-title leading-tight mb-8">JOIN THE<br />CURATION</h2>
                            <p className="body-text text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light font-sans">
                                Become part of a refined community of listeners and artists. Share your vision, build your library, and resonate with the world.
                            </p>
                        </motion.div>

                        <div className="pt-12">
                            <motion.button
                                onClick={register}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-16 py-5 bg-white text-black text-[11px] tracking-[0.5em] uppercase font-bold hover:bg-transparent hover:text-white border border-white transition-all duration-700 font-sans cursor-pointer"
                            >
                                CREATE YOUR ACCOUNT
                            </motion.button>
                        </div>
                    </div>
                </section>
            )}

        </div>
    );
};

export default Home;
