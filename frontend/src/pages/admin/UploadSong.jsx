import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Music, Image as ImageIcon, Loader2, ArrowLeft, X, Check } from 'lucide-react';
import songService from '../../services/songService';
import artistService from '../../services/artistService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '../../hooks/useDebounce';
import DefaultCover from '../../components/music/DefaultCover';

const UploadSong = () => {
    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        album: '',
        genre: 'Ambient',
        duration: 0,
    });
    const [audioFile, setAudioFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [artistPhotoFile, setArtistPhotoFile] = useState(null);
    const [artistPhotoPreview, setArtistPhotoPreview] = useState(null);
    const [isNewArtist, setIsNewArtist] = useState(false);
    const [existingArtist, setExistingArtist] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(null); // 'audio', 'cover', 'artist'
    const navigate = useNavigate();

    const debouncedArtist = useDebounce(formData.artist, 500);

    const checkArtist = useCallback(async (name) => {
        if (!name || name.length < 2) return;
        try {
            const res = await artistService.checkArtist(name);
            if (res.exists) {
                setIsNewArtist(false);
                setExistingArtist(res.artist);
                toast.success(`RECOGNIZED: ${res.artist.name}`);
            } else {
                setIsNewArtist(true);
                setExistingArtist(null);
                toast.dismiss(); // Clear previous toasts
            }
        } catch (error) {
            console.error('Artist check failed');
        }
    }, []);

    useEffect(() => {
        checkArtist(debouncedArtist);
    }, [debouncedArtist, checkArtist]);

    const genres = [
        'Ambient', 'Techno', 'Classical', 'Experimental', 'Jazz', 'Vocal', 'Electronic', 'Minimalist', 'Dark Ambient', 'Drum & Bass'
    ];

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const processAudio = (file) => {
        if (file && file.type.startsWith('audio/')) {
            setAudioFile(file);
            const audio = new Audio();
            audio.src = URL.createObjectURL(file);
            audio.onloadedmetadata = () => {
                setFormData(prev => ({ ...prev, duration: Math.floor(audio.duration) }));
            };
            toast.success('AUDIO READY');
        } else {
            toast.error('INVALID AUDIO FILE');
        }
    };

    const processCover = (file) => {
        if (file && file.type.startsWith('image/')) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
            toast.success('COVER READY');
        } else {
            toast.error('INVALID IMAGE FILE');
        }
    };

    const processArtistPhoto = (file) => {
        if (file && file.type.startsWith('image/')) {
            setArtistPhotoFile(file);
            setArtistPhotoPreview(URL.createObjectURL(file));
            toast.success('ARTIST LOGO READY');
        } else {
            toast.error('INVALID IMAGE FILE');
        }
    };

    const onDrop = (e, type) => {
        e.preventDefault();
        setIsDragging(null);
        const file = e.dataTransfer.files[0];
        if (type === 'audio') processAudio(file);
        else if (type === 'cover') processCover(file);
        else if (type === 'artist') processArtistPhoto(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!audioFile) {
            toast.error('AUDIO FILE IS REQUIRED');
            return;
        }

        setLoading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        data.append('audio', audioFile);
        if (coverFile) data.append('cover', coverFile);
        if (isNewArtist && artistPhotoFile) {
            data.append('artistPhoto', artistPhotoFile);
        }

        try {
            await songService.uploadSong(data);
            toast.success('COMMITTED TO THE ARCHIVE');
            navigate('/admin/dashboard');
        } catch (error) {
            toast.error('ARCHIVAL FAILED');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-24 pb-32 px-6 max-w-5xl mx-auto">
            <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-[10px] tracking-[0.3em] text-gray-400 hover:text-black mb-16 transition-colors uppercase font-medium"
            >
                <ArrowLeft size={12} />
                <span>Return to Dashboard</span>
            </motion.button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
                {/* Header Section */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="space-y-4">
                        <span className="label-text text-black">ARCHIVE CONTRIBUTION</span>
                        <h1 className="hero-title text-5xl lg:text-7xl leading-[0.9]">ADD<br />NEW<br />SONIC.</h1>
                    </div>
                    <p className="body-text text-gray-400 max-w-xs leading-relaxed">
                        Contribute high-fidelity textures to the Aura ecosystem. Ensure all metadata reflects the architectural intent of the piece.
                    </p>

                    {/* Preview Card (Aura Aesthetic) */}
                    <div className="pt-12 hidden lg:block">
                        <div className="border border-gray-100 p-6 space-y-4 group">
                            <p className="text-[9px] text-gray-300 uppercase tracking-widest">Aura Preview</p>
                            <div className="aspect-[4/5] relative overflow-hidden ring-1 ring-gray-100">
                                {coverPreview ? (
                                    <img src={coverPreview} className="w-full h-full object-cover" />
                                ) : (
                                    <DefaultCover
                                        title={formData.title}
                                        artist={formData.artist}
                                        genre={formData.genre}
                                    />
                                )}
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-serif text-xl truncate">{formData.title || 'ARCHIVE_ITEM'}</h4>
                                <p className="text-[10px] uppercase tracking-widest text-gray-400">{formData.artist || 'UNKNOWN ARTIST'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <InputField
                                label="Release Title"
                                name="title"
                                placeholder="E.G. KINETIC ENERGY"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                            />
                            <InputField
                                label="Artist / Collective"
                                name="artist"
                                placeholder="E.G. ELARA VOX"
                                value={formData.artist}
                                onChange={handleInputChange}
                                required
                            />

                            <AnimatePresence>
                                {isNewArtist && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4 overflow-hidden"
                                    >
                                        <div className="p-4 bg-muted/30 border border-border rounded-lg space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] tracking-widest text-foreground font-bold uppercase">New Architect Detected</span>
                                                <span className="text-[8px] text-gray-400 bg-background px-2 py-0.5 rounded border border-border uppercase">Required Profile</span>
                                            </div>

                                            <div
                                                onDragOver={(e) => { e.preventDefault(); setIsDragging('artist'); }}
                                                onDragLeave={() => setIsDragging(null)}
                                                onDrop={(e) => onDrop(e, 'artist')}
                                                className={`relative aspect-square w-32 mx-auto border border-dashed flex flex-col items-center justify-center transition-all overflow-hidden cursor-pointer ${isDragging === 'artist' ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground'
                                                    }`}
                                            >
                                                <input type="file" accept="image/*" onChange={(e) => processArtistPhoto(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                                                {artistPhotoPreview ? (
                                                    <img src={artistPhotoPreview} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-center p-4">
                                                        <Upload size={16} className="mx-auto mb-2 text-gray-300" />
                                                        <p className="text-[8px] tracking-widest text-gray-400 uppercase">Upload Artist Face</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                {!isNewArtist && existingArtist && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center space-x-4 p-4 border border-border"
                                    >
                                        <img src={existingArtist.photoUrl} className="w-10 h-10 object-cover" />
                                        <div className="flex-1">
                                            <p className="text-[10px] uppercase tracking-widest font-bold">Verified Architect</p>
                                            <p className="text-[8px] text-gray-400 uppercase">Profile already in archive</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] tracking-widest text-gray-400 uppercase font-medium">Sonic Genre</label>
                                    <select
                                        name="genre"
                                        value={formData.genre}
                                        onChange={handleInputChange}
                                        className="w-full bg-transparent border-b border-gray-100 py-4 focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer text-[13px]"
                                    >
                                        {genres.map(g => <option key={g} value={g}>{g.toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <InputField
                                    label="Archive Vol."
                                    name="album"
                                    placeholder="ALBUM"
                                    value={formData.album}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        {/* File Upload Area */}
                        <div className="space-y-8">
                            {/* Audio Dropzone */}
                            <div className="space-y-3">
                                <label className="text-[10px] tracking-widest text-gray-400 uppercase font-medium">Audio Spectrum</label>
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging('audio'); }}
                                    onDragLeave={() => setIsDragging(null)}
                                    onDrop={(e) => onDrop(e, 'audio')}
                                    className={`relative border border-dashed p-10 flex flex-col items-center justify-center space-y-4 transition-all duration-500 group ${isDragging === 'audio' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'
                                        } ${audioFile ? 'bg-black text-white' : ''}`}
                                >
                                    <input type="file" accept="audio/*" onChange={(e) => processAudio(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    {audioFile ? (
                                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                                            <Check className="mb-2" size={24} />
                                            <span className="text-[10px] tracking-widest font-bold uppercase truncate max-w-[200px]">{audioFile.name}</span>
                                            <span className="text-[9px] opacity-40 mt-1 uppercase">Ready for archive</span>
                                        </motion.div>
                                    ) : (
                                        <>
                                            <Music size={24} strokeWidth={1} className="text-gray-300 group-hover:text-black transition-colors" />
                                            <span className="text-[10px] tracking-[0.2em] text-gray-400 text-center uppercase">Drag audio or click to browse</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Cover Dropzone */}
                            <div className="space-y-3">
                                <label className="text-[10px] tracking-widest text-gray-400 uppercase font-medium">Visual Cover</label>
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging('cover'); }}
                                    onDragLeave={() => setIsDragging(null)}
                                    onDrop={(e) => onDrop(e, 'cover')}
                                    className={`relative border border-dashed aspect-video flex flex-col items-center justify-center transition-all duration-500 overflow-hidden ${isDragging === 'cover' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'
                                        }`}
                                >
                                    <input type="file" accept="image/*" onChange={(e) => processCover(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                                    {coverPreview ? (
                                        <div className="relative w-full h-full group">
                                            <img src={coverPreview} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-[10px] tracking-[0.3em] text-white font-bold uppercase">Change Image</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center space-y-4">
                                            <ImageIcon size={24} strokeWidth={1} className="text-gray-300" />
                                            <span className="text-[10px] tracking-[0.2em] text-gray-400 uppercase">Archive Artwork</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-12">
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            disabled={loading || !audioFile}
                            className="w-full py-6 bg-black text-white text-[11px] tracking-[0.5em] uppercase border border-transparent hover:bg-white hover:text-black hover:border-black transition-all flex items-center justify-center space-x-8 shadow-2xl shadow-black/20 disabled:opacity-20 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    <span>Syncing with Archive...</span>
                                </>
                            ) : (
                                <>
                                    <Upload size={16} className="group-hover:-translate-y-1 transition-transform" />
                                    <span>Commit to Aura Archive</span>
                                </>
                            )}
                        </motion.button>
                        <p className="mt-6 text-center text-[9px] text-gray-300 tracking-[0.3em] uppercase">Permanent Immutable Entry</p>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField = ({ label, ...props }) => (
    <div className="space-y-2 group">
        <label className="text-[10px] tracking-widest text-gray-400 uppercase font-medium">{label}</label>
        <input
            {...props}
            className="w-full bg-transparent border-b border-gray-100 py-4 focus:outline-none focus:border-black transition-colors font-serif text-2xl placeholder:text-gray-100 placeholder:font-serif"
        />
    </div>
);

export default UploadSong;
