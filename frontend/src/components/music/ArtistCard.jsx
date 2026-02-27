import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, ArrowRight } from 'lucide-react';

// URLs that are just placeholders, not real artist photos
const PLACEHOLDER_PATTERNS = ['placehold.co', 'placeholder.com', 'via.placeholder', 'dummyimage.com'];
const isPlaceholder = (url) => !url || PLACEHOLDER_PATTERNS.some((p) => url.includes(p));

const ArtistCard = ({ artist, index }) => {
    const [imageError, setImageError] = useState(false);

    const photoUrl = artist.photoUrl || artist.avatar;
    const showDefault = isPlaceholder(photoUrl) || imageError;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: Math.min(index * 0.1, 0.5), ease: [0.23, 1, 0.32, 1] }}
            className={`artist-card group cursor-pointer ${index % 3 === 1 ? 'md:mt-16' : ''}`}
        >
            <Link to={`/curator/${artist._id}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted mb-6">
                    {!showDefault ? (
                        <img
                            src={photoUrl}
                            alt={artist.name}
                            className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                            loading="lazy"
                            decoding="async"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        /* Styled default when no real photo exists */
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-muted to-black/20 relative">
                            <div className="w-20 h-20 rounded-full border border-border/50 flex items-center justify-center mb-4 text-gray-500 group-hover:border-foreground/30 transition-colors duration-500">
                                <User size={36} strokeWidth={1} />
                            </div>
                            <p className="text-[9px] uppercase tracking-[0.4em] text-gray-600 font-medium px-4 text-center">
                                {artist.name}
                            </p>
                        </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                        <span className="text-white text-[10px] font-bold uppercase tracking-[0.3em] flex items-center space-x-2">
                            <span>VIEW ARCHIVE</span>
                            <ArrowRight size={14} className="-rotate-45" />
                        </span>
                    </div>
                </div>
                <h3 className="font-serif text-3xl mb-1 group-hover:text-foreground transition-colors">{artist.name}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {artist.role?.toUpperCase() || 'SONIC ARCHITECT'}
                </p>
            </Link>
        </motion.div>
    );
};

export default ArtistCard;
