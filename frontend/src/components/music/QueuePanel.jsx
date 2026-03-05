import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ListPlus, X, ChevronDown } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

const QueuePanel = ({ isOpen, onClose }) => {
    const { queue, currentIndex, playSong, currentSong } = useMusic();
    const [activeTab, setActiveTab] = useState('upnext');

    const formatTime = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const [lyrics, setLyrics] = useState(null);
    const [loadingLyrics, setLoadingLyrics] = useState(false);

    useEffect(() => {
        if (!currentSong) return;

        const fetchLyrics = async () => {
            setLoadingLyrics(true);
            setLyrics(null);
            try {
                // Strip out features like (feat. X) from title to improve search hits
                let searchTitle = currentSong.title.replace(/\([^)]*\)/g, '').trim();
                let searchArtist = currentSong.artist;

                const res = await fetch(`https://lrclib.net/api/search?track_name=${encodeURIComponent(searchTitle)}&artist_name=${encodeURIComponent(searchArtist)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0 && (data[0].syncedLyrics || data[0].plainLyrics)) {
                        setLyrics(data[0].syncedLyrics || data[0].plainLyrics);
                    } else {
                        setLyrics("LYRICS NOT AVAILABLE");
                    }
                } else {
                    setLyrics("LYRICS NOT AVAILABLE");
                }
            } catch (error) {
                setLyrics("LYRICS NOT AVAILABLE");
            } finally {
                setLoadingLyrics(false);
            }
        };

        fetchLyrics();
    }, [currentSong]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[80] bg-background flex flex-col overflow-hidden text-foreground"
                >
                    {/* Header Controls */}
                    <div className="flex justify-between items-center p-4">
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
                        >
                            <ChevronDown className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex justify-between px-8 border-b border-border mt-2">
                        {['UP NEXT', 'LYRICS', 'RELATED'].map((tab) => {
                            const tabId = tab.toLowerCase().replace(' ', '');
                            const isActive = activeTab === tabId;
                            return (
                                <button
                                    key={tabId}
                                    onClick={() => setActiveTab(tabId)}
                                    className={`pb-4 px-2 text-[12px] font-bold tracking-widest relative transition-colors ${isActive ? 'text-foreground' : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                >
                                    {tab}
                                    {isActive && (
                                        <motion.div
                                            layoutId="queueTabIndicator"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto no-scrollbar px-4 sm:px-8 py-6">
                        {activeTab === 'upnext' && (
                            <div className="space-y-6 max-w-3xl mx-auto">
                                {/* Context Header */}
                                <div className="flex justify-between items-end mb-6">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Playing from</p>
                                        <h3 className="text-sm sm:text-lg font-medium tracking-wide">CURRENT MIX</h3>
                                    </div>
                                    <button className="flex items-center space-x-2 bg-foreground text-background px-4 py-2 rounded-full hover:scale-105 transition-transform text-[12px] font-bold tracking-widest">
                                        <ListPlus size={16} />
                                        <span>SAVE</span>
                                    </button>
                                </div>

                                {/* Queue List */}
                                <div className="space-y-2">
                                    {queue.map((song, idx) => {
                                        const isPlaying = idx === currentIndex && song._id === currentSong?._id;

                                        return (
                                            <div
                                                key={`${song._id}-${idx}`}
                                                onClick={() => playSong(song, queue, true)}
                                                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer group transition-colors ${isPlaying ? 'bg-muted/50' : 'hover:bg-muted/30'
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-4 min-w-0 pr-4">
                                                    <div className="relative w-12 h-12 shrink-0 rounded-md overflow-hidden bg-muted">
                                                        <img
                                                            src={song.coverUrl}
                                                            alt={song.title}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                        {isPlaying && (
                                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                                <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className={`text-sm md:text-base font-medium truncate ${isPlaying ? 'text-foreground' : 'text-gray-200 group-hover:text-foreground transition-colors'}`}>
                                                            {song.title}
                                                        </h4>
                                                        <p className="text-[10px] md:text-xs text-gray-500 mt-1 uppercase tracking-wider truncate">
                                                            {song.artist}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-[11px] font-mono text-gray-500 shrink-0 tabular-nums hidden sm:block">
                                                    {formatTime(song.duration)}
                                                </span>
                                            </div>
                                        );
                                    })}

                                    {queue.length === 0 && (
                                        <div className="text-center text-gray-500 py-10 text-sm tracking-widest">
                                            QUEUE IS EMPTY
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'lyrics' && (
                            <div className="h-full w-full max-w-3xl mx-auto py-8">
                                {loadingLyrics ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500 text-[10px] tracking-[0.4em] uppercase space-y-4 py-20">
                                        <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin" />
                                        <span>SEARCHING ARCHIVES...</span>
                                    </div>
                                ) : lyrics && lyrics !== "LYRICS NOT AVAILABLE" ? (
                                    <div className="space-y-6 text-center md:text-left text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif leading-relaxed text-gray-400">
                                        {lyrics.split('\n').map((line, i) => {
                                            // Optional: strip out LRC timestamps if present
                                            const cleanLine = line.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim();
                                            return (
                                                <p key={i} className={cleanLine ? "hover:text-foreground transition-colors cursor-default" : "h-8"}>
                                                    {cleanLine}
                                                </p>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500 text-sm tracking-widest uppercase py-20">
                                        LYRICS NOT AVAILABLE
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'related' && (
                            <div className="flex items-center justify-center h-full text-gray-500 text-sm tracking-widest">
                                NO RELATED TRACKS
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default QueuePanel;
