import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

const PlaylistCard = ({ playlist, index }) => {
    const [imageError, setImageError] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
            className="playlist-card group cursor-pointer"
        >
            <Link to={`/playlist/${playlist._id}`} className="block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl mb-6 bg-muted shadow-2xl">
                    {playlist.coverUrl && !imageError ? (
                        <>
                            <img
                                src={playlist.coverUrl}
                                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
                                alt={playlist.name}
                                onError={() => setImageError(true)}
                            />
                            {/* Editorial Overlay (Vignette) */}
                            <div className="absolute inset-0 pointer-events-none z-10 
                                            bg-gradient-to-b from-transparent via-transparent to-black/40 
                                            opacity-60 group-hover:opacity-30 transition-opacity duration-700" />

                            {/* Subtle Grain / Texture Overlay */}
                            <div className="absolute inset-0 pointer-events-none z-20 
                                            opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/felt.png')]" />
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            {/* Fallback pattern */}
                            <div className="text-4xl font-serif opacity-20">{playlist.name.substring(0, 2).toUpperCase()}</div>
                        </div>
                    )}

                    {/* Interaction Layer */}
                    <div className="absolute inset-0 z-30 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                            <Play className="text-white fill-current ml-1" size={32} />
                        </div>
                    </div>
                </div>
                <h3 className="font-serif text-3xl font-bold mb-2 group-hover:text-brand transition-colors truncate">
                    {playlist.name}
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                    {playlist.songs?.length || 0} Tracks • {playlist.userId?.name || 'EDITORIAL'}
                </p>
            </Link>
        </motion.div>
    );
};

export default PlaylistCard;
