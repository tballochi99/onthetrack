'use client'

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Play, Pause, User } from 'lucide-react';
import Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAudio } from '../context/AudioContext';
import { Composition } from '../context/AudioContext';

interface CompositionCardProps {
  composition: Composition;
  allCompositions?: Composition[];
}

const CompositionCard: React.FC<CompositionCardProps> = ({ composition, allCompositions }) => {
  const [isLiked, setIsLiked] = useState(false);
  const router = useRouter();
  const { 
    currentTrack, 
    setCurrentTrack, 
    setIsPlayerVisible, 
    playlist,
    setPlaylist, 
    isPlaying, 
    setIsPlaying 
  } = useAudio();

  const isCurrentTrack = currentTrack?._id === composition._id;

  useEffect(() => {
    if (allCompositions && allCompositions.length > 0) {
      setPlaylist(allCompositions);
    }
  }, [allCompositions, setPlaylist]);

  const togglePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isCurrentTrack) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(composition);
      setIsPlaying(true);
      
      if (!playlist.some(track => track._id === composition._id)) {
        setPlaylist((prevPlaylist: Composition[]) => [...prevPlaylist, composition]);
      }
    }
    setIsPlayerVisible(true);
  }, [composition, setCurrentTrack, setIsPlayerVisible, setPlaylist, isCurrentTrack, isPlaying, setIsPlaying, playlist]);

  const handleCardClick = useCallback(() => {
    router.push(`/compositions/${composition._id}`);
  }, [router, composition._id]);

  const toggleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked((prev) => !prev);
  }, []);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <Card
      onClick={handleCardClick}
      className="cursor-pointer overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 hover:border-emerald-500 text-white"
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={composition.coverImage}
          alt={`${composition.title} cover`}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 ease-in-out transform hover:scale-110"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="secondary"
            size="icon"
            onClick={togglePlay}
            className="bg-white/80 text-gray-800 hover:bg-white hover:text-emerald-500 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-colors duration-300"
          >
            {isCurrentTrack && isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold truncate flex-1 text-white">{composition.title}</h3>
          {composition.genre && (
            <Badge variant="secondary" className="text-xs font-semibold rounded-md bg-gray-700 text-gray-100 hover:bg-emerald-500 transition-colors duration-300">
              {composition.genre}
            </Badge>
          )}
        </div>
        <div className="flex items-center text-xs text-gray-400 mb-2">
          <Link href={`/profile/${composition.user._id}`} className="flex items-center text-sm text-gray-400 hover:text-emerald-500 transition-colors duration-300">
            <User className="w-3 h-3 mr-1" />
            <span className="hover:underline">
              {composition.user.username}
            </span>
          </Link>
        </div>
        <div className="flex items-center justify-between bg-gray-800 rounded-lg p-2 shadow-md mt-2 border border-gray-700">
          <span className="text-lg font-bold text-white">${composition.price.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
};

export default CompositionCard;