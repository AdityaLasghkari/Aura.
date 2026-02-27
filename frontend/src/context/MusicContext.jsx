import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Howl, Howler } from 'howler';
import { useAuth } from './AuthContext';
import songService from '../services/songService';


const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(70);
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState('off');
    const [likedSongsIds, setLikedSongsIds] = useState([]);

    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            setLikedSongsIds(user.likedSongs?.map(id => id.toString()) || []);
        } else {
            setLikedSongsIds([]);
        }
    }, [user]);

    const isLiked = (songId) => likedSongsIds.includes(songId?.toString());

    const toggleLike = async (songId) => {
        if (!user) return;
        try {
            await songService.toggleLike(songId);
            setLikedSongsIds(prev =>
                prev.includes(songId.toString())
                    ? prev.filter(id => id !== songId.toString())
                    : [...prev, songId.toString()]
            );
        } catch (error) {
            console.error('LIKE_TOGGLE_ERROR:', error);
        }
    };


    const soundRef = useRef(null);
    const intervalRef = useRef(null);
    const analyserRef = useRef(null);

    // Lazily initialize analyser to ensure it uses the EXACT same context as Howler
    const getAnalyser = () => {
        if (!analyserRef.current && Howler.ctx) {
            try {
                // Ensure we use the global Howler context
                const analyser = Howler.ctx.createAnalyser();
                analyser.fftSize = 256;
                analyserRef.current = analyser;

                // Connect Howler's master output to our analyser
                if (Howler.masterGain) {
                    Howler.masterGain.connect(analyser);
                }
            } catch (e) {
                console.warn('VISUALIZER_ATTACH_FAILED:', e);
            }
        }
        return analyserRef.current;
    };

    const playSong = useCallback((song, songQueue = []) => {
        // RESUME AudioContext
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
            Howler.ctx.resume();
        }

        // CROSSFADE: Fade out existing if it's playing
        if (soundRef.current) {
            const oldSound = soundRef.current;
            oldSound.fade(oldSound.volume(), 0, 800);
            setTimeout(() => {
                oldSound.stop();
                oldSound.unload();
            }, 800);
        }

        if (songQueue.length > 0) {
            setQueue(songQueue);
            const index = songQueue.findIndex(s => s._id === song._id);
            setCurrentIndex(index !== -1 ? index : 0);
        }

        setCurrentSong(song);

        // Use html5: true for streaming (instant play)
        // Note: For visualizer to work with html5: true, CORS must be perfect
        const sound = new Howl({
            src: [song.audioUrl],
            html5: true,
            preload: true,
            format: ['mp3', 'wav', 'mpeg'],
            crossOrigin: 'anonymous',
            volume: 0,
            onplay: () => {
                setIsPlaying(true);
                setIsLoading(false);
                startTimer();

                // Advanced: Connect HTML5 audio to Web Audio Context for Visualizer
                /* 
                const analyser = getAnalyser();
                if (analyser && sound._sounds[0] && sound._sounds[0]._node) {
                    try {
                        const node = sound._sounds[0]._node;
                        if (!node._source) {
                            node._source = Howler.ctx.createMediaElementSource(node);
                            node._source.connect(analyser);
                            analyser.connect(Howler.ctx.destination);
                        }
                    } catch (e) {
                        console.warn('VISUALIZER_STREAM_CONNECT_FAILED:', e);
                    }
                }
                */
            },
            onload: () => {
                setIsLoading(false);
            },
            onloaderror: (id, err) => {
                console.error('AUDIO_LOAD_ERROR:', err);
                setIsLoading(false);
            },
            onplayerror: (id, err) => {
                console.error('AUDIO_PLAY_ERROR:', err);
                setIsLoading(false);
                sound.once('unlock', () => sound.play());
            },
            onpause: () => {
                setIsPlaying(false);
                stopTimer();
            },
            onend: () => {
                handleSongEnd();
            }
        });

        setIsLoading(true);
        soundRef.current = sound;
        sound.play();
        sound.fade(0, volume / 100, 400); // Faster fade in

        // PRELOAD NEXT SONG:
        if (songQueue.length > 0) {
            const nextIdx = (currentIndex + 1) % songQueue.length;
            const nextSong = songQueue[nextIdx];
            if (nextSong) {
                const preloader = new Image();
                preloader.src = nextSong.coverUrl; // Preload cover
                // Note: Howler handles its own internal preloading if we were to create a hidden Howl
            }
        }
    }, [volume, currentIndex]);

    const togglePlay = useCallback(() => {
        if (!soundRef.current) return;
        if (isPlaying) {
            soundRef.current.pause();
        } else {
            if (Howler.ctx && Howler.ctx.state === 'suspended') {
                Howler.ctx.resume();
            }
            soundRef.current.play();
        }
    }, [isPlaying]);

    const setPlaying = useCallback((shouldPlay) => {
        if (!soundRef.current) return;
        if (shouldPlay && !isPlaying) {
            if (Howler.ctx && Howler.ctx.state === 'suspended') Howler.ctx.resume();
            soundRef.current.play();
        } else if (!shouldPlay && isPlaying) {
            soundRef.current.pause();
        }
    }, [isPlaying]);

    const stopTimer = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const startTimer = () => {
        stopTimer();
        intervalRef.current = setInterval(() => {
            if (soundRef.current && soundRef.current.playing()) {
                const current = soundRef.current.seek();
                const duration = soundRef.current.duration();
                if (duration > 0) {
                    setProgress((current / duration) * 100);
                }
            }
        }, 1000);
    };

    const seek = useCallback((value, isPercent = true) => {
        if (soundRef.current) {
            const duration = soundRef.current.duration();
            const targetTime = isPercent ? (value / 100) * duration : value;
            soundRef.current.seek(targetTime);
            if (isPercent) {
                setProgress(value);
            } else {
                setProgress((targetTime / duration) * 100);
            }
        }
    }, []);

    const changeVolume = (value) => {
        setVolume(value);
        if (soundRef.current) {
            soundRef.current.volume(value / 100);
        }
    };

    const nextSong = () => {
        if (queue.length === 0) return;
        let nextIdx;
        if (isShuffle) {
            nextIdx = Math.floor(Math.random() * queue.length);
        } else {
            nextIdx = (currentIndex + 1) % queue.length;
        }
        playSong(queue[nextIdx]);
        setCurrentIndex(nextIdx);
    };

    const previousSong = () => {
        if (queue.length === 0) return;
        const prevIdx = (currentIndex - 1 + queue.length) % queue.length;
        playSong(queue[prevIdx]);
        setCurrentIndex(prevIdx);
    };

    const handleSongEnd = () => {
        if (repeatMode === 'one') {
            soundRef.current.play();
        } else if (repeatMode === 'all' || currentIndex < queue.length - 1 || isShuffle) {
            nextSong();
        } else {
            setIsPlaying(false);
            setProgress(0);
        }
    };

    const toggleShuffle = () => setIsShuffle(!isShuffle);
    const toggleRepeat = () => {
        const modes = ['off', 'one', 'all'];
        const nextMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
        setRepeatMode(nextMode);
    };

    return (
        <MusicContext.Provider
            value={{
                currentSong,
                isPlaying,
                isLoading,
                progress,
                volume,
                queue,
                isShuffle,
                repeatMode,
                playSong,
                togglePlay,
                setPlaying,
                seek,
                changeVolume,
                nextSong,
                previousSong,
                toggleShuffle,
                toggleRepeat,
                isLiked,
                toggleLike,
                currentTime: soundRef.current?.seek() || 0,
                duration: soundRef.current?.duration() || 0,
                analyser: analyserRef.current // Note: This will update when getAnalyser runs
            }}

        >
            {children}
        </MusicContext.Provider>
    );
};

export const useMusic = () => useContext(MusicContext);
