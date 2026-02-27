import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Music, ChevronDown, Filter } from 'lucide-react';
import playlistService from '../services/playlistService';
import PlaylistHoverRow from '../components/music/PlaylistHoverRow';

const PlaylistDirectory = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLetter, setSelectedLetter] = useState('ALL');
    const containerRef = useRef(null);

    const alphabet = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

    useEffect(() => {
        const fetchPlaylists = async () => {
            setLoading(true);
            try {
                const res = await playlistService.getPublicPlaylists({
                    search: searchTerm
                });
                let filtered = res.data.playlists;
                if (selectedLetter !== 'ALL') {
                    filtered = filtered.filter(p => p.name.toUpperCase().startsWith(selectedLetter));
                }
                setPlaylists(filtered);
            } catch (error) {
                console.error('Error fetching playlists:', error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchPlaylists, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedLetter]);

    return (
        <div
            ref={containerRef}
            className="pt-24 pb-32 min-h-screen bg-background relative overflow-hidden"
        >
            {/* Exactly Match the Artist Page Ghost Text Alignment */}
            <div className="absolute top-40 left-0 right-0 pointer-events-none select-none overflow-hidden whitespace-nowrap opacity-[0.03] dark:opacity-[0.07]">
                <h1 className="font-serif italic text-[12rem] md:text-[20rem] leading-none tracking-tighter">
                    DIRECTORY DIRECTORY DIRECTORY
                </h1>
            </div>

            <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">

                {/* Header Section - Exactly Match Artist Style */}
                <div className="mb-24">
                    <div className="space-y-6 max-w-4xl">
                        <span className="text-[10px] tracking-[0.5em] text-gray-400 font-bold uppercase">CURATED DIRECTORY</span>
                        <h1 className="font-serif leading-tight tracking-tight text-7xl md:text-9xl lg:text-[10rem] text-foreground transition-all duration-700">
                            Playlists<span className="text-gray-300">.</span>
                        </h1>
                        <p className="max-w-xl text-lg text-gray-400 leading-relaxed font-light">
                            Curated sounds for every chapter of your day. From the pulse of the city to the silence of the morning. Explore our editorial selections designed to soundtrack your life.
                        </p>
                    </div>
                </div>

                {/* Filter Bar - Exactly Match Artist/Browse Style */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20 border-b border-border pb-12">
                    <div className="flex flex-col space-y-8 flex-1">
                        <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar pb-2">
                            {alphabet.map(letter => (
                                <button
                                    key={letter}
                                    onClick={() => setSelectedLetter(letter)}
                                    className={`text-[11px] font-bold uppercase tracking-widest transition-all ${selectedLetter === letter
                                        ? 'text-foreground border-b-2 border-foreground pb-1'
                                        : 'text-gray-300 hover:text-foreground'
                                        }`}
                                >
                                    {letter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-12">
                        {/* Search */}
                        <div className="relative group min-w-[200px]">
                            <input
                                type="text"
                                placeholder="SEARCH..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-b border-border py-3 pl-8 text-[11px] tracking-widest uppercase focus:outline-none focus:border-foreground transition-all focus:min-w-[300px] text-foreground"
                            />
                            <Search
                                size={14}
                                className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-foreground transition-colors cursor-pointer"
                                onClick={() => document.querySelector('input[placeholder="SEARCH..."]')?.focus()}
                            />
                        </div>

                        {/* Dropdowns */}
                        <div className="flex items-center space-x-6">
                            <button className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-foreground transition-colors">
                                <span>GENRE</span>
                                <ChevronDown size={14} />
                            </button>
                            <button className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-foreground transition-colors">
                                <span>SORT</span>
                                <Filter size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                <div className="flex flex-col">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="animate-pulse border-b border-border py-12 flex items-center justify-between">
                                <div className="w-12 h-6 bg-muted" />
                                <div className="h-16 lg:h-24 bg-muted w-1/2" />
                                <div className="w-12 h-6 bg-muted" />
                            </div>
                        ))
                    ) : playlists.length > 0 ? (
                        playlists.map((playlist, index) => (
                            <PlaylistHoverRow key={playlist._id} playlist={playlist} index={index} />
                        ))
                    ) : (
                        <div className="py-40 text-center border border-dashed border-border rounded-3xl">
                            <div className="mb-8 flex justify-center">
                                <Music size={64} className="text-gray-200" strokeWidth={0.5} />
                            </div>
                            <h3 className="font-serif text-4xl text-gray-300 uppercase tracking-widest mb-4">No curations detected.</h3>
                            <p className="text-gray-400 uppercase tracking-[0.2em] text-[10px]">THE ARCHIVE IS CURRENTLY EMPTY IN THIS SECTOR.</p>
                            <button
                                onClick={() => { setSearchTerm(''); setSelectedLetter('ALL'); }}
                                className="mt-12 text-[11px] tracking-[0.4em] uppercase font-bold border-b border-foreground pb-2 hover:opacity-50 transition-opacity"
                            >
                                RESET DIRECTORY
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default PlaylistDirectory;
