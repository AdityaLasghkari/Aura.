import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, ChevronDown, Filter } from 'lucide-react';
import SongCard from '../components/music/SongCard';
import ArtistCard from '../components/music/ArtistCard';
import CuratorsList from '../components/music/CuratorsList';
import songService from '../services/songService';
import userService from '../services/userService';
import artistService from '../services/artistService';
import { useDebounce } from '../hooks/useDebounce';
import ArtistHoverRow from '../components/music/ArtistHoverRow';

const Browse = () => {
    const location = useLocation();
    const path = location.pathname.substring(1);
    const isArtistsPage = path === 'artists';

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [genre, setGenre] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedLetter, setSelectedLetter] = useState('ALL');

    const alphabet = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

    const getPageContext = () => {
        switch (path) {
            case 'artists':
                return { label: 'CURATED DIRECTORY', title: 'Artists<span class="text-gray-300">.</span>' };
            case 'playlists':
                return { label: 'SOUND COLLECTIONS', title: 'MOODS &<br />MANIFESTOS' };
            default:
                return { label: 'DISCOVER', title: 'EXPLORE THE<br />ARCHITECTURE' };
        }
    };

    const context = getPageContext();
    const debouncedSearch = useDebounce(searchTerm, 500);

    const genres = [
        'Ambient', 'Techno', 'Classical', 'Experimental', 'Jazz', 'Electronic', 'Minimalist'
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (isArtistsPage && !debouncedSearch && !genre) {
                    // Fetch curated artists for the Artists Directory
                    const res = await artistService.getArtists();
                    let filtered = res.data;
                    if (selectedLetter !== 'ALL') {
                        filtered = filtered.filter(a => a.name.toUpperCase().startsWith(selectedLetter));
                    }
                    setItems(filtered);
                    setTotalPages(1);
                } else {
                    // Fetch songs for playlists/search
                    const response = await songService.getSongs({
                        page,
                        genre,
                        search: debouncedSearch,
                        limit: 12
                    });
                    setItems(response.data.songs);
                    setTotalPages(response.data.totalPages);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [debouncedSearch, genre, page, isArtistsPage, selectedLetter]);

    return (
        <div className="pt-24 pb-32 min-h-screen bg-background overflow-hidden relative">
            {isArtistsPage && (
                <div className="absolute top-40 left-0 right-0 pointer-events-none select-none overflow-hidden whitespace-nowrap opacity-[0.03] dark:opacity-[0.07]">
                    <h1 className="font-serif italic text-[12rem] md:text-[20rem] leading-none tracking-tighter">
                        DIRECTORY DIRECTORY DIRECTORY
                    </h1>
                </div>
            )}

            <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
                {/* Header Section */}
                <div className="mb-24">
                    <div className="space-y-6 max-w-4xl">
                        <span className="text-[10px] tracking-[0.5em] text-gray-400 font-bold uppercase">{context.label}</span>
                        <h1
                            className={`font-serif leading-tight tracking-tight ${isArtistsPage ? 'text-5xl md:text-9xl lg:text-[10rem]' : 'section-heading'}`}
                            dangerouslySetInnerHTML={{ __html: context.title }}
                        />
                        {isArtistsPage && (
                            <p className="max-w-xl text-lg text-gray-400 leading-relaxed font-light">
                                A curated selection of the world's most influential sonic architects. Discover the faces behind the masterpieces.
                            </p>
                        )}
                    </div>
                </div>

                {/* Filter Bar (Stitch Style) */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20 border-b border-border pb-12">
                    <div className="flex flex-col space-y-8 flex-1">
                        {isArtistsPage && (
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
                        )}

                        {!isArtistsPage && (
                            <div className="flex items-center space-x-12">
                                <span className="text-[10px] tracking-[0.3em] font-bold text-gray-400 uppercase">FILTERS</span>
                                <div className="flex gap-8">
                                    {genres.slice(0, 4).map(g => (
                                        <button
                                            key={g}
                                            onClick={() => setGenre(g === genre ? '' : g)}
                                            className={`text-[11px] tracking-widest uppercase transition-colors ${genre === g ? 'text-foreground underline' : 'text-gray-300 hover:text-foreground'}`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-8 sm:space-y-0 sm:space-x-12 w-full lg:w-auto">
                        {/* Search */}
                        <div className="relative group w-full sm:min-w-[200px]">
                            <input
                                type="text"
                                placeholder="SEARCH..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-b border-border py-2 md:py-3 pl-8 text-[11px] tracking-widest uppercase focus:outline-none focus:border-foreground transition-all sm:focus:min-w-[300px] text-foreground"
                            />
                            <Search
                                size={14}
                                className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-foreground transition-colors cursor-pointer"
                                onClick={() => document.querySelector('input[placeholder="SEARCH..."]')?.focus()}
                            />
                        </div>

                        {/* Dropdowns */}
                        <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-start">
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
                <div className={isArtistsPage ? "flex flex-col" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-24"}>
                    {loading ? (
                        Array(12).fill(0).map((_, i) => (
                            <div key={i} className="animate-pulse space-y-4">
                                <div className="aspect-[3/4] bg-muted w-full rounded-xl" />
                                <div className="h-6 bg-muted w-3/4" />
                            </div>
                        ))
                    ) : items.length > 0 ? (
                        items.map((item, index) => (
                            isArtistsPage ? (
                                <ArtistHoverRow key={item._id} artist={item} index={index} />
                            ) : (
                                <SongCard
                                    key={item._id}
                                    song={item}
                                    queue={items}
                                    aspectRatio={index % 5 === 2 ? 'aspect-square' : 'aspect-[4/5]'}
                                />
                            )
                        ))
                    ) : (
                        <div className="col-span-full py-24 text-center">
                            <p className="font-serif text-3xl text-gray-200 uppercase tracking-widest">No results found in this sector.</p>
                            <button
                                onClick={() => { setSearchTerm(''); setGenre(''); setSelectedLetter('ALL'); }}
                                className="mt-8 text-[11px] tracking-widest uppercase border-b border-foreground pb-1 hover:opacity-50 transition-opacity text-foreground"
                            >
                                RESET VIEW
                            </button>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-32 flex justify-center items-center space-x-12 pt-12 border-t border-border">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="text-[11px] tracking-widest uppercase disabled:opacity-10 hover:opacity-50 transition-opacity"
                        >
                            PREVIOUS
                        </button>
                        <span className="font-serif text-2xl tracking-tighter">
                            {page.toString().padStart(2, '0')} / {totalPages.toString().padStart(2, '0')}
                        </span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="text-[11px] tracking-widest uppercase disabled:opacity-10 hover:opacity-50 transition-opacity"
                        >
                            NEXT
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default Browse;

