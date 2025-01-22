"use client"

import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';

interface User {
    _id: string;
    username: string;
}

interface License {
    licenseId: string;
    price: number;
}

export interface Composition {
    _id: string;
    title: string;
    genre?: string;
    bpm: number;
    key?: string;
    tags?: string[];
    price: number;
    file: string;
    coverImage: string;
    user: User;
    licenses: License[];
    listens: Date[];
    createdAt: string;
    updatedAt: string;
}

interface AudioContextType {
    currentTrack: Composition | null;
    setCurrentTrack: (track: Composition | null) => void;
    isPlayerVisible: boolean;
    setIsPlayerVisible: (isVisible: boolean) => void;
    playlist: Composition[];
    setPlaylist: React.Dispatch<React.SetStateAction<Composition[]>>;
    isPlaying: boolean;
    setIsPlaying: (isPlaying: boolean) => void;
    isShuffleOn: boolean;
    setIsShuffleOn: (isShuffleOn: boolean) => void;
    repeatMode: 'off' | 'one' | 'all';
    setRepeatMode: (mode: 'off' | 'one' | 'all') => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentTrack, setCurrentTrackState] = useState<Composition | null>(null);
    const [isPlayerVisible, setIsPlayerVisible] = useState(false);
    const [playlist, setPlaylist] = useState<Composition[]>([]);
    const [isPlaying, setIsPlayingState] = useState(false);
    const [isShuffleOn, setIsShuffleOn] = useState(false);
    const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');

    const setCurrentTrack = useCallback((track: Composition | null) => {
        setCurrentTrackState(track);
        setIsPlayerVisible(true);
        setIsPlayingState(true);
    }, []);

    const setIsPlaying = useCallback((value: boolean) => {
        if (currentTrack) {
            setIsPlayingState(value);
        }
    }, [currentTrack]);

    useEffect(() => {
        console.log('Audio state changed:', {
            track: currentTrack?.title,
            playing: isPlaying,
            visible: isPlayerVisible
        });
    }, [currentTrack, isPlaying, isPlayerVisible]);

    const value = useMemo(() => ({
        currentTrack,
        setCurrentTrack,
        isPlayerVisible,
        setIsPlayerVisible,
        playlist,
        setPlaylist,
        isPlaying,
        setIsPlaying,
        isShuffleOn,
        setIsShuffleOn,
        repeatMode,
        setRepeatMode
    }), [
        currentTrack, setCurrentTrack,
        isPlayerVisible, setIsPlayerVisible,
        playlist, setPlaylist,
        isPlaying, setIsPlaying,
        isShuffleOn, setIsShuffleOn,
        repeatMode, setRepeatMode
    ]);

    return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};

export default AudioContext;