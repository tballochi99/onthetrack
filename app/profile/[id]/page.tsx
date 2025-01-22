"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause, User, Music, Instagram, Twitter, Youtube, Mail, FileMusic, Headphones, Copy } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { Card } from "@/components/ui/cardimprove";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from 'react-hot-toast';

interface User {
    _id: string;
    username: string;
    profilePicture: string;
    bio: string;
    instagramUrl?: string;
    twitterUrl?: string;
    youtubeUrl?: string;
    collabEmail?: string;
}

interface Composition {
    _id: string;
    title: string;
    file: string;
    coverImage: string;
    genre: string;
    bpm: number;
    key: string;
    price: number;
    listens: string[];
    user: {
        _id: string;
        username: string;
    };
    tags?: string[];
    licenses?: Array<{
        licenseId: string;
        price: number;
    }>;
}

const UserProfile: React.FC = () => {
    const router = useRouter();
    const { id } = useParams();
    const [user, setUser] = useState<User | null>(null);
    const [compositions, setCompositions] = useState<Composition[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { 
        currentTrack, 
        setCurrentTrack, 
        setIsPlayerVisible, 
        setPlaylist, 
        isPlaying, 
        setIsPlaying 
    } = useAudio();

    useEffect(() => {
        const fetchUserAndCompositions = async () => {
            if (!id) return;
            setIsLoading(true);
            setError(null);
            try {
                const [userRes, compositionsRes] = await Promise.all([
                    fetch(`/api/user/${id}`),
                    fetch(`/api/user/${id}/compositions`)
                ]);

                const userData = await userRes.json();
                const compositionsData = await compositionsRes.json();

                if (!userRes.ok) throw new Error(userData.message || 'Failed to fetch user data');
                if (!compositionsRes.ok) throw new Error(compositionsData.message || 'Failed to fetch compositions');

                const formattedCompositions = compositionsData.data?.map(comp => ({
                    ...comp,
                    file: comp.file.startsWith('http') 
                        ? comp.file 
                        : `${window.location.origin}${comp.file}`
                })) || [];
                
                setUser(userData.user);
                setCompositions(formattedCompositions);
                setPlaylist(formattedCompositions);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load user profile. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserAndCompositions();
    }, [id, setPlaylist]);

    const handleCardClick = useCallback((composition: Composition) => {
        router.push(`/compositions/${composition._id}`);
    }, [router]);

    const togglePlay = useCallback((e: React.MouseEvent, composition: Composition) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isCurrentTrack = currentTrack?._id === composition._id;
        
        if (isCurrentTrack) {
            setIsPlaying(!isPlaying);
        } else {
            setIsPlayerVisible(true);
            setCurrentTrack(composition);
            setIsPlaying(true);
        }
    }, [currentTrack?._id, isPlaying, setCurrentTrack, setIsPlaying, setIsPlayerVisible]);

    const copyEmailToClipboard = useCallback(() => {
        if (user?.collabEmail) {
            navigator.clipboard.writeText(user.collabEmail)
                .then(() => toast.success('Email copied to clipboard!'))
                .catch(() => toast.error('Failed to copy email'));
        }
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900">
                <p className="text-red-400 text-xl font-semibold">{error}</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900">
                <p className="text-gray-300 text-xl font-semibold">User not found</p>
            </div>
        );
    }

    const totalListens = compositions.reduce((sum, composition) => sum + composition.listens.length, 0);

    return (
        <div className="bg-gray-900 text-gray-300 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16">
                    <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-10">
                        <div className="relative w-48 h-48 rounded-2xl overflow-hidden">
                            <img
                                src={user.profilePicture || "/default-avatar.png"}
                                alt={user.username}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-5xl font-bold mb-4 text-white">{user.username}</h1>
                            <p className="text-xl text-gray-400 mb-6">{user.bio || 'No bio available'}</p>
                            <div className="flex flex-wrap gap-4 mb-6">
                                {user.instagramUrl && (
                                    <a href={user.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-300 hover:text-white">
                                        <Instagram className="h-5 w-5 mr-2 text-emerald-400" />
                                        Instagram
                                    </a>
                                )}
                                {user.twitterUrl && (
                                    <a href={user.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-300 hover:text-white">
                                        <Twitter className="h-5 w-5 mr-2 text-emerald-400" />
                                        Twitter
                                    </a>
                                )}
                                {user.youtubeUrl && (
                                    <a href={user.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-300 hover:text-white">
                                        <Youtube className="h-5 w-5 mr-2 text-emerald-400" />
                                        YouTube
                                    </a>
                                )}
                                {user.collabEmail && (
                                    <button onClick={copyEmailToClipboard} className="flex items-center text-gray-300 hover:text-white">
                                        <Mail className="h-5 w-5 mr-2 text-emerald-400" />
                                        {user.collabEmail}
                                        <Copy className="h-4 w-4 ml-2 text-emerald-400" />
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-8">
                                <div className="flex items-center">
                                    <FileMusic className="h-6 w-6 mr-2 text-emerald-400" />
                                    <span className="text-lg font-semibold text-gray-300">{compositions.length} Compositions</span>
                                </div>
                                <div className="flex items-center">
                                    <Headphones className="h-6 w-6 mr-2 text-emerald-400" />
                                    <span className="text-lg font-semibold text-gray-300">{totalListens} Total Listens</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className="text-3xl font-bold mb-8 text-white">Compositions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {compositions?.map((composition) => (
                        <Card
                            key={composition._id}
                            onClick={() => handleCardClick(composition)}
                            className="cursor-pointer overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 hover:border-emerald-500 text-white"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={composition.coverImage}
                                    alt={composition.title}
                                    className="w-full h-full object-cover transition-transform duration-300 ease-in-out transform hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        onClick={(e) => togglePlay(e, composition)}
                                        className="bg-white/80 text-gray-800 hover:bg-white hover:text-emerald-500 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-colors duration-300"
                                    >
                                        {currentTrack?._id === composition._id && isPlaying ? (
                                            <Pause className="w-6 h-6" />
                                        ) : (
                                            <Play className="w-6 h-6" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold truncate flex-1">{composition.title}</h3>
                                    {composition.genre && (
                                        <Badge variant="secondary" className="text-xs font-semibold rounded-md bg-gray-700 text-gray-100 hover:bg-emerald-500 transition-colors duration-300">
                                            {composition.genre}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center text-xs text-gray-400 mb-2">
                                    <Link 
                                        href={`/profile/${composition.user._id}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center text-sm text-gray-400 hover:text-emerald-500 transition-colors duration-300"
                                    >
                                        <User className="w-3 h-3 mr-1" />
                                        <span className="hover:underline">
                                            {composition.user.username}
                                        </span>
                                    </Link>
                                </div>
                                <div className="flex items-center justify-between bg-gray-800 rounded-lg p-2 shadow-md mt-2 border border-gray-700">
                                    <span className="text-lg font-bold text-white">${composition.price.toFixed(2)}</span>
                                    <span className="text-sm text-gray-400">
                                        <Headphones className="inline-block mr-1 text-emerald-400" size={16} />
                                        {composition.listens.length} listens
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;