import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, Maximize2, Repeat, Shuffle, Heart } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';


const MusicPlayer = () => {
    const {
        currentSong,
        isPlaying,
        togglePlay,
        progress,
        seek,
        nextSong,
        previousSong,
        volume,
        changeVolume,
        isShuffle,
        toggleShuffle,
        repeatMode,
        toggleRepeat,
        isLiked,
        toggleLike

    } = useMusic();

    const location = useLocation();
    const navigate = useNavigate();

    if (!currentSong) return null;

    // Hide if we are on the full vinyl player page
    if (location.pathname === '/player') return null;

    const handlePlayerClick = (e) => {
        // Only navigate if clicking the background or non-interactive areas
        if (e.target === e.currentTarget || e.target.closest('.player-info-zone')) {
            navigate('/player');
        }
    };

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            onClick={handlePlayerClick}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-2xl border-t border-border px-4 md:px-8 h-20 md:h-24 flex items-center cursor-pointer group/player"
        >

            <div className="max-w-[1920px] mx-auto w-full flex items-center justify-between md:grid md:grid-cols-3 gap-2 md:gap-4 relative">

                {/* Mobile absolute progress bar */}
                <div className="absolute -top-[1px] md:hidden left-0 right-0 h-[2px] bg-white/5 cursor-pointer group"
                    onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        seek((x / rect.width) * 100);
                    }}>
                    <div
                        className="absolute top-0 left-0 h-full bg-foreground transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Song Info */}
                <div className="flex items-center space-x-3 md:space-x-6 flex-1 min-w-0 pr-2 md:pr-0">
                    <div className="flex items-center space-x-3 md:space-x-5 group player-info-zone cursor-pointer shrink-0 min-w-0">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-muted overflow-hidden relative shadow-sm shrink-0">
                            <img
                                src={currentSong.coverUrl}
                                alt={currentSong.title}
                                className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 ${isPlaying ? 'grayscale-0' : 'grayscale'}`}
                            />
                            {isPlaying && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                    <div className="flex space-x-0.5 h-3 items-end">
                                        <div className="w-[1px] md:w-0.5 bg-white animate-bounce" />
                                        <div className="w-[1px] md:w-0.5 bg-white animate-[bounce_0.8s_infinite] delay-100" />
                                        <div className="w-[1px] md:w-0.5 bg-white animate-[bounce_0.7s_infinite] delay-200" />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 pr-2 md:pr-4 truncate">
                            <h4 className="font-serif text-sm md:text-lg leading-tight truncate group-hover:text-foreground transition-colors">{currentSong.title}</h4>
                            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-0.5 font-medium truncate font-sans">{currentSong.artist}</p>
                        </div>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(currentSong._id);
                        }}
                        className={`hidden md:block transition-colors relative z-10 shrink-0 ${isLiked(currentSong._id) ? 'text-foreground' : 'text-gray-300 hover:text-foreground'}`}
                    >
                        <Heart
                            size={16}
                            strokeWidth={1.5}
                            className={isLiked(currentSong._id) ? 'fill-foreground' : ''}
                        />
                    </button>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center justify-center space-y-2 md:space-y-3 shrink-0">
                    <div className="flex items-center space-x-6 md:space-x-8">
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleShuffle(); }}
                            className={`hidden md:block transition-colors ${isShuffle ? 'text-foreground' : 'text-gray-300 hover:text-foreground'}`}
                        >
                            <Shuffle size={16} />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); previousSong(); }}
                            className="hidden sm:block text-gray-300 hover:text-foreground transition-colors p-1"
                        >
                            <SkipBack className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" strokeWidth={1} />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-95 z-10 shrink-0"
                        >
                            {isPlaying ? (
                                <Pause className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" strokeWidth={1} />
                            ) : (
                                <Play className="w-4 h-4 md:w-5 md:h-5 ml-1" fill="currentColor" strokeWidth={1} />
                            )}
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); nextSong(); }}
                            className="text-gray-300 hover:text-foreground transition-colors p-1"
                        >
                            <SkipForward className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" strokeWidth={1} />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); toggleRepeat(); }}
                            className={`hidden md:block transition-colors relative p-1 ${repeatMode !== 'off' ? 'text-foreground' : 'text-gray-300 hover:text-foreground'}`}
                        >
                            <Repeat size={16} />
                            {repeatMode === 'one' && <span className="absolute -top-1.5 -right-1.5 text-[8px] font-bold">1</span>}
                        </button>
                    </div>

                    {/* Desktop Progress Bar */}
                    <div className="hidden md:flex w-full max-w-lg items-center space-x-4">
                        <span className="text-[9px] text-gray-400 font-mono tabular-nums w-8 text-right">
                            {formatTime((progress / 100) * (currentSong.duration || 0))}
                        </span>
                        <div className="flex-1 h-[2px] bg-border relative cursor-pointer group"
                            onClick={(e) => {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                seek((x / rect.width) * 100);
                            }}>
                            <div
                                className="absolute top-0 left-0 h-full bg-foreground transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ left: `${progress}%` }}
                            />
                        </div>
                        <span className="text-[9px] text-gray-400 font-mono tabular-nums w-8">
                            {formatTime(currentSong.duration || 0)}
                        </span>
                    </div>
                </div>

                {/* Additional Actions */}
                <div className="hidden md:flex items-center justify-end space-x-8 min-w-0 pr-2">
                    <div className="flex items-center space-x-4 group w-32 shrink-0">
                        <Volume2 size={16} className="text-gray-300 group-hover:text-foreground transition-colors" />
                        <div className="flex-1 h-[1px] bg-border relative cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                changeVolume((x / rect.width) * 100);
                            }}>

                            <div
                                className="absolute top-0 left-0 h-full bg-foreground"
                                style={{ width: `${volume}%` }}
                            />
                        </div>
                    </div>

                    <Link
                        to="/player"
                        className="text-gray-300 hover:text-foreground transition-colors shrink-0 p-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Maximize2 size={16} />
                    </Link>

                </div>
            </div>
        </motion.div>
    );
};

const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default MusicPlayer;
