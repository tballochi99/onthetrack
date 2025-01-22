import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface GlobalAudioPlayerProps {
  isVisible: boolean;
  currentTrack: {
    title: string;
    artist: string;
    file: string;
  } | null;
}

const GlobalAudioPlayer: React.FC<GlobalAudioPlayerProps> = ({ isVisible, currentTrack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.file;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!isVisible || !currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <img src="/placeholder-album-art.jpg" alt="Album art" className="w-12 h-12 rounded-md" />
        <div>
          <p className="font-semibold">{currentTrack.title}</p>
          <p className="text-sm text-gray-400">{currentTrack.artist}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <SkipBack className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={togglePlay}>
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </Button>
        <Button variant="ghost" size="icon">
          <SkipForward className="w-6 h-6" />
        </Button>
      </div>
      <div className="flex items-center space-x-4">
        <Volume2 className="w-6 h-6" />
        <div className="w-24 bg-gray-700 rounded-full h-1">
          <div className="bg-white w-1/2 h-full rounded-full"></div>
        </div>
      </div>
      <audio ref={audioRef} />
    </div>
  );
};