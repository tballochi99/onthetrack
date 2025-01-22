import React, { useEffect, useRef, useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, X, Volume2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface User {
    _id: string;
    username: string;
}

interface License {
    licenseId: string;
    price: number;
}

interface Composition {
    _id: string;
    title: string;
    file: string;
    coverImage: string;
    genre?: string;
    bpm?: number;
    key?: string;
    price: number;
    listens: string[];
    user: User;
    licenses?: License[];
    createdAt?: string;
    updatedAt?: string;
}

interface AudioContextType {
    currentTrack: Composition | null;
    setCurrentTrack: (track: Composition | null) => void;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    playlist: Composition[];
    setPlaylist: React.Dispatch<React.SetStateAction<Composition[]>>;
    isPlayerVisible: boolean;
    setIsPlayerVisible: (visible: boolean) => void;
    isShuffleOn: boolean;
    setIsShuffleOn: (shuffle: boolean) => void;
    repeatMode: 'off' | 'one' | 'all';
    setRepeatMode: (mode: 'off' | 'one' | 'all') => void;
}

const GlobalAudioPlayer = () => {
    const pathname = usePathname();
    const {
        currentTrack,
        setCurrentTrack,
        isPlaying,
        setIsPlaying,
        playlist,
        isPlayerVisible,
        setIsPlayerVisible,
        isShuffleOn,
        setIsShuffleOn,
        repeatMode,
        setRepeatMode
    } = useAudio() as AudioContextType;

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isAudioReady, setIsAudioReady] = useState(false);
    const audioRef = useRef(new Audio());
    const [hasListenedFor10Seconds, setHasListenedFor10Seconds] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const isVisiblePage = ['/', '/tracks', '/profile'].some(path => 
        pathname.startsWith(path)
    ) && !pathname.startsWith('/compositions');

    useEffect(() => {
        const audio = audioRef.current;
        
        if (pathname.startsWith('/compositions')) {
            audio.pause();
            setIsPlaying(false);
            setIsPlayerVisible(false);
        }
    }, [pathname, setIsPlaying, setIsPlayerVisible]);

    useEffect(() => {
        const audio = audioRef.current;
        audio.volume = volume;
        
        const handleCanPlay = () => {
            setIsAudioReady(true);
            if (isPlaying) {
                audio.play().catch(error => {
                    console.error('Play failed:', error);
                    setIsPlaying(false);
                });
            }
        };

        audio.addEventListener('canplay', handleCanPlay);
        return () => audio.removeEventListener('canplay', handleCanPlay);
    }, [isPlaying, setIsPlaying, volume]);

    useEffect(() => {
        if (!currentTrack?.file) return;
        
        const audio = audioRef.current;
        setIsAudioReady(false);
        audio.src = currentTrack.file;
        audio.load();
        setHasListenedFor10Seconds(false);
    }, [currentTrack]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!isAudioReady) return;

        if (isPlaying) {
            audio.play().catch(error => {
                console.error('Play failed:', error);
                setIsPlaying(false);
            });
        } else {
            audio.pause();
        }
    }, [isPlaying, isAudioReady, setIsPlaying]);

    useEffect(() => {
        fetch('/api/user/me')
            .then(res => res.ok ? res.json() : null)
            .then(data => setCurrentUser(data?.user))
            .catch(error => console.error('Error fetching user:', error));
    }, []);

    useEffect(() => {
        const audio = audioRef.current;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            if (audio.currentTime >= 10 && !hasListenedFor10Seconds && currentTrack) {
                const isOwner = currentUser?._id === currentTrack.user._id;
                if (!isOwner) {
                    fetch(`/api/compositions/${currentTrack._id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    }).then(() => setHasListenedFor10Seconds(true))
                    .catch(error => console.error('Error recording listen:', error));
                }
                setHasListenedFor10Seconds(true);
            }
        };

        const handleDurationChange = () => setDuration(audio.duration);
        const handleEnded = () => {
            if (repeatMode === 'one') {
                audio.currentTime = 0;
                audio.play().catch(console.error);
            } else {
                handleNext();
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [currentTrack, hasListenedFor10Seconds, currentUser, repeatMode]);

    const handleClosePlayer = () => {
        const audio = audioRef.current;
        audio.pause();
        setIsPlaying(false);
        setIsPlayerVisible(false);
    };

    const handlePlayPause = () => setIsPlaying(!isPlaying);

    const handleSeek = (newValue: number[]) => {
        const audio = audioRef.current;
        audio.currentTime = newValue[0];
        setCurrentTime(newValue[0]);
    };

    const handleVolumeChange = (newValue: number[]) => {
        const newVolume = newValue[0];
        setVolume(newVolume);
        audioRef.current.volume = newVolume;
    };

    const getNextTrack = () => {
        if (!playlist?.length) return null;
        const currentIndex = playlist.findIndex(track => track._id === currentTrack?._id);
        if (isShuffleOn) {
            const availableTracks = playlist.filter((_, i) => i !== currentIndex);
            return availableTracks[Math.floor(Math.random() * availableTracks.length)];
        }
        return playlist[(currentIndex + 1) % playlist.length];
    };

    const getPreviousTrack = () => {
        if (!playlist?.length) return null;
        const currentIndex = playlist.findIndex(track => track._id === currentTrack?._id);
        if (isShuffleOn) {
            const availableTracks = playlist.filter((_, i) => i !== currentIndex);
            return availableTracks[Math.floor(Math.random() * availableTracks.length)];
        }
        return playlist[(currentIndex - 1 + playlist.length) % playlist.length];
    };

    const handleNext = () => {
        const nextTrack = getNextTrack();
        if (nextTrack) {
            setCurrentTrack(nextTrack);
            setIsPlaying(true);
        }
    };

    const handlePrevious = () => {
        const prevTrack = getPreviousTrack();
        if (prevTrack) {
            setCurrentTrack(prevTrack);
            setIsPlaying(true);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!isPlayerVisible || !currentTrack || !isVisiblePage) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
            <div className="relative w-full max-w-4xl mx-auto bg-emerald-500/10 rounded-lg shadow-lg text-white p-4 backdrop-blur-md">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <img
                            src={currentTrack.coverImage}
                            alt={currentTrack.title}
                            className="w-16 h-16 rounded-md object-cover"
                        />
                        <div>
                            <h3 className="font-bold">{currentTrack.title}</h3>
                            <p className="text-sm text-gray-100">{currentTrack.user.username}</p>
                        </div>
                    </div>

                    <div className="flex-1 mx-4">
                        <Slider
                            min={0}
                            max={duration || 100}
                            value={[currentTime]}
                            onValueChange={handleSeek}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs mt-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsShuffleOn(!isShuffleOn)}
                            className={`hover:bg-emerald-500 transition-colors ${isShuffleOn ? 'text-emerald-400' : 'text-gray-100'}`}
                        >
                            <Shuffle className="h-5 w-5" />
                        </Button>

                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handlePrevious}
                            className="hover:bg-emerald-500 transition-colors"
                        >
                            <SkipBack className="h-5 w-5" />
                        </Button>

                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handlePlayPause}
                            className="hover:bg-emerald-500 transition-colors"
                        >
                            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                        </Button>

                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handleNext}
                            className="hover:bg-emerald-500 transition-colors"
                        >
                            <SkipForward className="h-5 w-5" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
                            className={`hover:bg-emerald-500 transition-colors ${repeatMode !== 'off' ? 'text-emerald-400' : 'text-gray-100'}`}
                        >
                            <Repeat className="h-5 w-5" />
                            {repeatMode === 'one' && <span className="absolute text-xs">1</span>}
                        </Button>

                        <div className="flex items-center space-x-2">
                            <Volume2 className="h-4 w-4" />
                            <Slider
                                min={0}
                                max={1}
                                step={0.1}
                                value={[volume]}
                                onValueChange={handleVolumeChange}
                                className="w-24"
                            />
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClosePlayer}
                        className="hover:bg-emerald-500 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default GlobalAudioPlayer;