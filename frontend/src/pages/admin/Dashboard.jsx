import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Users, Music, Play, TrendingUp, Plus, Trash2,
    Search, Filter, ChevronLeft, ChevronRight, X,
    Clock, Disc, Headphones
} from 'lucide-react';
import songService from '../../services/songService';
import toast from 'react-hot-toast';
import CoverImage from '../../components/music/CoverImage';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '—';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const GENRES = ['All', 'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Electronic', 'Jazz', 'Classical', 'Lo-fi', 'Indie', 'Metal', 'Country', 'Soul', 'Ambient'];
const PAGE_SIZE = 15;

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────
const StatCard = ({ icon, label, value }) => (
    <div className="p-10 bg-muted/30 border border-border group hover:border-foreground transition-all duration-500 rounded-2xl relative overflow-hidden backdrop-blur-sm">
        <div className="text-gray-400 group-hover:text-foreground transition-colors duration-500 mb-4">{icon}</div>
        <div className="space-y-1 relative z-10">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="font-serif text-4xl text-foreground">{value}</p>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 scale-[3]">
            {icon}
        </div>
    </div>
);

const SongRow = ({ song, index, onDelete }) => {
    return (
        <div
            className="grid items-center gap-4 px-4 py-3 rounded-xl group hover:bg-muted/60 transition-all duration-200 border border-transparent hover:border-border"
            style={{ gridTemplateColumns: '2rem 3rem 1fr 1fr 7rem 5rem 4rem 2.5rem' }}
        >
            {/* # */}
            <span className="text-[11px] text-gray-500 font-mono text-center select-none">
                {String(index).padStart(2, '0')}
            </span>

            {/* Cover */}
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                <CoverImage
                    src={song.coverUrl}
                    alt={song.title}
                    title={song.title}
                    artist={song.artist}
                    genre={song.genre}
                    imgClassName="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
            </div>

            {/* Title */}
            <div className="min-w-0">
                <p className="font-serif text-base text-foreground truncate leading-tight">{song.title}</p>
            </div>

            {/* Artist */}
            <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-widest text-gray-400 truncate">{song.artist}</p>
            </div>

            {/* Genre */}
            <div>
                <span className="inline-block text-[9px] uppercase tracking-[0.2em] text-gray-500 border border-border px-2 py-0.5 rounded-full truncate max-w-full">
                    {song.genre || '—'}
                </span>
            </div>

            {/* Plays */}
            <div className="flex items-center gap-1.5">
                <Headphones size={11} className="text-gray-500 flex-shrink-0" />
                <span className="text-[11px] font-mono text-gray-400">{(song.plays || 0).toLocaleString()}</span>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-1.5">
                <Clock size={11} className="text-gray-500 flex-shrink-0" />
                <span className="text-[11px] font-mono text-gray-400">{formatDuration(song.duration)}</span>
            </div>

            {/* Delete */}
            <div className="flex justify-end">
                <button
                    onClick={() => onDelete(song._id, song.title)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-lg opacity-0 group-hover:opacity-100"
                    title="Delete song"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────
const Dashboard = () => {
    const [stats, setStats] = useState({ totalSongs: 0, totalPlays: 0, totalUsers: 142 });
    const [recentSongs, setRecentSongs] = useState([]);

    // All Songs state
    const [allSongs, setAllSongs] = useState([]);
    const [filteredSongs, setFilteredSongs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeGenre, setActiveGenre] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [loadingAll, setLoadingAll] = useState(true);

    // ── Fetch all songs once ──────────────────
    const fetchAllSongs = useCallback(async () => {
        setLoadingAll(true);
        try {
            const response = await songService.getSongs({ limit: 500 });
            const songs = response.data.songs;
            setAllSongs(songs);
            setRecentSongs(songs.slice(0, 5));
            setStats({
                totalSongs: songs.length,
                totalPlays: songs.reduce((acc, s) => acc + (s.plays || 0), 0),
                totalUsers: 142,
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to load songs');
        } finally {
            setLoadingAll(false);
        }
    }, []);

    useEffect(() => { fetchAllSongs(); }, [fetchAllSongs]);

    // ── Filter / Search ───────────────────────
    useEffect(() => {
        let result = allSongs;
        if (activeGenre !== 'All') {
            result = result.filter(s => s.genre?.toLowerCase() === activeGenre.toLowerCase());
        }
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            result = result.filter(s =>
                s.title?.toLowerCase().includes(q) ||
                s.artist?.toLowerCase().includes(q) ||
                s.album?.toLowerCase().includes(q)
            );
        }
        setFilteredSongs(result);
        setCurrentPage(1);
    }, [allSongs, searchQuery, activeGenre]);

    // ── Pagination ────────────────────────────
    const totalPages = Math.max(1, Math.ceil(filteredSongs.length / PAGE_SIZE));
    const paginatedSongs = filteredSongs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // ── Delete ────────────────────────────────
    const handleDelete = async (id, title) => {
        if (window.confirm(`ARE YOU SURE YOU WANT TO DELETE "${title.toUpperCase()}"?`)) {
            try {
                await songService.deleteSong(id);
                toast.success('DELETED FROM ARCHIVE');
                fetchAllSongs();
            } catch {
                toast.error('FAILED TO DELETE');
            }
        }
    };

    return (
        <div className="pt-24 pb-32 px-6 md:px-12 lg:px-24">
            <div className="max-w-[1920px] mx-auto space-y-20">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row justify-between items-end space-y-8 md:space-y-0 border-b border-border pb-12">
                    <div className="space-y-4">
                        <span className="label-text text-gray-400">ADMINISTRATION</span>
                        <h1 className="section-heading text-foreground">WORKSPACE<br />OVERVIEW.</h1>
                    </div>
                    <Link
                        to="/admin/upload"
                        className="px-10 py-4 bg-foreground text-background text-[10px] tracking-[0.4em] uppercase flex items-center space-x-4 border border-transparent hover:opacity-80 transition-all"
                    >
                        <Plus size={14} />
                        <span>ADD NEW RELEASE</span>
                    </Link>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    <StatCard icon={<Music size={20} />} label="TOTAL ARCHIVE" value={stats.totalSongs} />
                    <StatCard icon={<Play size={20} />} label="TOTAL SESSIONS" value={stats.totalPlays.toLocaleString()} />
                    <StatCard icon={<Users size={20} />} label="CURATORS" value={stats.totalUsers} />
                    <StatCard icon={<TrendingUp size={20} />} label="GROWTH" value="+12%" />
                </div>

                {/* ── Recent Uploads + Logs ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
                    <div className="lg:col-span-2 space-y-10">
                        <h3 className="card-title uppercase tracking-widest text-sm text-gray-400">Recent Uploads</h3>
                        <div className="space-y-4">
                            {recentSongs.map(song => (
                                <div
                                    key={song._id}
                                    className="flex items-center justify-between border-b border-border pb-5 group hover:border-foreground transition-colors"
                                >
                                    <div className="flex items-center space-x-6">
                                        <div className="w-12 h-12 bg-muted overflow-hidden rounded-lg border border-border">
                                            <CoverImage
                                                src={song.coverUrl}
                                                alt={song.title}
                                                title={song.title}
                                                artist={song.artist}
                                                genre={song.genre}
                                                imgClassName="w-full h-full object-cover grayscale"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-serif text-lg text-foreground">{song.title}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{song.artist}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-10">
                                        <div className="flex flex-col items-end text-[10px] tracking-widest uppercase text-gray-400">
                                            <span>{song.genre}</span>
                                            <span>{song.plays || 0} PLAYS</span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(song._id, song.title)}
                                            className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-full opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-12">
                        <h3 className="card-title uppercase tracking-widest text-sm text-gray-400">System Logs</h3>
                        <div className="bg-muted p-8 space-y-6 font-mono text-[10px] text-gray-500 rounded-2xl">
                            <p className="border-l-2 border-foreground/50 pl-4 uppercase">[SYSTEM] DATABASE SYNC COMPLETE</p>
                            <p className="border-l-2 border-gray-200 pl-4 uppercase">[AUTH] NEW USER REGISTERED: #242</p>
                            <p className="border-l-2 border-gray-200 pl-4 uppercase">[MEDIA] CACHE PURGED SUCCESSFULLY</p>
                            <p className="border-l-2 border-gray-200 pl-4 uppercase">[SYSTEM] UPTIME: 142 DAYS</p>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════
                    ALL SONGS TABLE
                ════════════════════════════════════════ */}
                <div className="space-y-10">

                    {/* Section header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                        <div className="space-y-2">
                            <span className="label-text text-gray-400">COMPLETE ARCHIVE</span>
                            <h2 className="font-serif text-3xl text-foreground">
                                All Songs
                                <span className="ml-4 text-base font-sans font-light text-gray-400">
                                    ({filteredSongs.length} track{filteredSongs.length !== 1 ? 's' : ''})
                                </span>
                            </h2>
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-80">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            <input
                                id="admin-song-search"
                                type="text"
                                placeholder="Search by title, artist, album…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder-gray-500 focus:outline-none focus:border-foreground/50 transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-foreground transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Genre filter pills */}
                    <div className="flex flex-wrap gap-2">
                        <Filter size={13} className="text-gray-500 self-center mr-1 flex-shrink-0" />
                        {GENRES.map(g => (
                            <button
                                key={g}
                                onClick={() => setActiveGenre(g)}
                                className={`px-3 py-1 text-[9px] uppercase tracking-[0.2em] rounded-full border transition-all duration-200 ${activeGenre === g
                                    ? 'bg-foreground text-background border-foreground'
                                    : 'bg-transparent text-gray-400 border-border hover:border-foreground/40'
                                    }`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>

                    {/* Table header */}
                    <div
                        className="grid gap-4 px-4 py-2 text-[9px] uppercase tracking-[0.2em] text-gray-500 border-b border-border"
                        style={{ gridTemplateColumns: '2rem 3rem 1fr 1fr 7rem 5rem 4rem 2.5rem' }}
                    >
                        <span className="text-center">#</span>
                        <span></span>
                        <span>Title</span>
                        <span>Artist</span>
                        <span>Genre</span>
                        <span>Plays</span>
                        <span>Duration</span>
                        <span></span>
                    </div>

                    {/* Song rows */}
                    <div className="space-y-1">
                        {loadingAll ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin" />
                                <p className="text-[11px] uppercase tracking-widest text-gray-500">Loading archive…</p>
                            </div>
                        ) : paginatedSongs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <Music size={32} className="text-gray-600" />
                                <p className="text-[11px] uppercase tracking-widest text-gray-500">No songs found</p>
                            </div>
                        ) : (
                            paginatedSongs.map((song, i) => (
                                <SongRow
                                    key={song._id}
                                    song={song}
                                    index={(currentPage - 1) * PAGE_SIZE + i + 1}
                                    onDelete={handleDelete}
                                />
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                            <p className="text-[11px] uppercase tracking-widest text-gray-500">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-border text-gray-400 hover:border-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                {/* Page pills */}
                                <div className="flex gap-1">
                                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                        let page;
                                        if (totalPages <= 7) {
                                            page = i + 1;
                                        } else if (currentPage <= 4) {
                                            page = i < 5 ? i + 1 : i === 5 ? '…' : totalPages;
                                        } else if (currentPage >= totalPages - 3) {
                                            page = i === 0 ? 1 : i === 1 ? '…' : totalPages - (6 - i);
                                        } else {
                                            if (i === 0) page = 1;
                                            else if (i === 1) page = '…';
                                            else if (i === 5) page = '…';
                                            else if (i === 6) page = totalPages;
                                            else page = currentPage + (i - 3);
                                        }
                                        return (
                                            <button
                                                key={i}
                                                disabled={page === '…'}
                                                onClick={() => typeof page === 'number' && setCurrentPage(page)}
                                                className={`w-8 h-8 text-[11px] rounded-lg border transition-all ${page === currentPage
                                                    ? 'bg-foreground text-background border-foreground'
                                                    : page === '…'
                                                        ? 'border-transparent text-gray-500 cursor-default'
                                                        : 'border-border text-gray-400 hover:border-foreground/40'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-border text-gray-400 hover:border-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
