'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Composition } from '../../../types/composition';
import { Play, Pause, Edit2, Music, Filter, X, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import Card from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useAudio } from '../context/AudioContext';  

const Accordion = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => {
  return <div className={`space-y-2 ${className}`}>{children}</div>;
};

const AccordionItem = ({ children, value }: { children: React.ReactNode, value: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { isOpen, setIsOpen });
        }
        return child;
      })}
    </div>
  );
};

const AccordionTrigger = ({ children, className = '', isOpen, setIsOpen }: { children: React.ReactNode, className?: string, isOpen?: boolean, setIsOpen?: (isOpen: boolean) => void }) => {
  return (
    <button
      className={`flex justify-between items-center w-full p-4 text-left ${className}`}
      onClick={() => setIsOpen && setIsOpen(!isOpen)}
    >
      {children}
      <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
    </button>
  );
};

const AccordionContent = ({ children, className = '', isOpen }: { children: React.ReactNode, className?: string, isOpen?: boolean }) => {
  if (!isOpen) return null;
  return <div className={`p-4 ${className}`}>{children}</div>;
};

interface UserCompositionsListProps {
  compositions: Composition[];
  onCompositionUpdated: () => void;
}

const UserCompositionsList: React.FC<UserCompositionsListProps> = ({
  compositions,
  onCompositionUpdated
}) => {
  const router = useRouter();
  const { currentTrack, setCurrentTrack, isPlaying, setIsPlaying, setPlaylist, setIsPlayerVisible } = useAudio();
  const [sortBy, setSortBy] = useState<'genre' | 'tag' | 'bpm' | null>(null);
  const [filterGenre, setFilterGenre] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [bpmRange, setBpmRange] = useState<[number, number]>([0, 300]);

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/compositions/edit/${id}`);
  };

  const handlePlay = (composition: Composition, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentTrack?._id === composition._id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(composition);
      setIsPlaying(true);
      setPlaylist(filteredAndSortedCompositions);
    }
    setIsPlayerVisible(true);
  };

  const availableGenres = useMemo(() => {
    return Array.from(new Set(compositions.map(comp => comp.genre))).sort();
  }, [compositions]);

  const availableTags = useMemo(() => {
    return Array.from(new Set(compositions.flatMap(comp => comp.tags))).sort();
  }, [compositions]);

  const filteredAndSortedCompositions = useMemo(() => {
    return compositions
      .filter(comp =>
        (filterGenre === null || comp.genre === filterGenre) &&
        (filterTag === null || comp.tags.includes(filterTag)) &&
        comp.bpm >= bpmRange[0] && comp.bpm <= bpmRange[1]
      )
      .sort((a, b) => {
        if (sortBy === 'genre') return a.genre.localeCompare(b.genre);
        if (sortBy === 'tag') return a.tags[0].localeCompare(b.tags[0]);
        if (sortBy === 'bpm') return a.bpm - b.bpm;
        return 0;
      });
  }, [compositions, sortBy, filterGenre, filterTag, bpmRange]);

  const resetFilters = () => {
    setSortBy(null);
    setFilterGenre(null);
    setFilterTag(null);
    setBpmRange([0, 300]);
  };

  const handleBpmRangeChange = (newRange: number[]) => {
    setBpmRange([newRange[0], newRange[1]]);
  };

  return (
    <div className="text-white p-4">
      <Accordion className="mb-6">
        <AccordionItem value="filters">
          <AccordionTrigger className="bg-gray-800 hover:bg-gray-700 text-white rounded-t-lg">
            <div className="flex items-center">
              <Filter className="w-5 h-5 mr-2 text-emerald-400" />
              Filters and Sorting
            </div>
          </AccordionTrigger>
          <AccordionContent className="bg-gray-800 rounded-b-lg shadow-lg space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sort-by" className="text-sm font-medium ">Sort by</Label>
                <Select 
                  value={sortBy || "none"} 
                  onValueChange={(value) => setSortBy(value === "none" ? null : value as 'genre' | 'tag' | 'bpm')}
                >
                  <SelectTrigger id="sort-by" className="bg-gray-700 text-white border-gray-600 focus:ring-emerald-500">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 text-white border-gray-600">
                    <SelectItem value="none" className="hover:bg-emerald-600 hover:text-white">No sorting</SelectItem>
                    <SelectItem value="genre" className="hover:bg-emerald-600 hover:text-white">Genre</SelectItem>
                    <SelectItem value="tag" className="hover:bg-emerald-600 hover:text-white">Tag</SelectItem>
                    <SelectItem value="bpm" className="hover:bg-emerald-600 hover:text-white">BPM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-genre" className="text-sm font-medium ">Filter by genre</Label>
                <Select 
                  value={filterGenre || "all"} 
                  onValueChange={(value) => setFilterGenre(value === "all" ? null : value)}
                >
                  <SelectTrigger id="filter-genre" className="bg-gray-700 text-white border-gray-600 focus:ring-emerald-500">
                    <SelectValue placeholder="Filter by genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 text-white border-gray-600">
                    <SelectItem value="all" className="hover:bg-emerald-600 hover:text-white">All Genres</SelectItem>
                    {availableGenres.map(genre => (
                      <SelectItem key={genre} value={genre} className="hover:bg-emerald-600 hover:text-white">{genre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-tag" className="text-sm font-medium ">Filter by tag</Label>
                <Select 
                  value={filterTag || "all"} 
                  onValueChange={(value) => setFilterTag(value === "all" ? null : value)}
                >
                  <SelectTrigger id="filter-tag" className="bg-gray-700 text-white border-gray-600 focus:ring-emerald-500">
                    <SelectValue placeholder="Filter by tag" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 text-white border-gray-600">
                    <SelectItem value="all" className="hover:bg-emerald-600 hover:text-white">All Tags</SelectItem>
                    {availableTags.map(tag => (
                      <SelectItem key={tag} value={tag} className="hover:bg-emerald-600 hover:text-white">{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              <Label className="text-sm font-medium ">BPM Range: {bpmRange[0]} - {bpmRange[1]}</Label>
              <Slider
                min={0}
                max={300}
                step={1}
                value={bpmRange}
                onValueChange={handleBpmRangeChange}
                className="w-full"
              />
            </div>
            <Button onClick={resetFilters} variant="destructive" size="sm" className="w-full bg-red-600 hover:bg-red-700">
              <X className="w-4 h-4 mr-2" />
              Reset Filters
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
  
      {filteredAndSortedCompositions.length === 0 ? (
        <p className="text-center text-gray-400 text-lg">No compositions match your criteria.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAndSortedCompositions.map((composition) => (
            <Card
              key={composition._id}
              className="cursor-pointer overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 bg-gradient-to-br from-gray-900 to-gray-800 border-none text-white"
              onClick={(e) => handleEdit(composition._id, e)}
            >
              <div className="p-0">
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={composition.coverImage}
                    alt={`${composition.title} cover`}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 ease-in-out transform hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={(e) => handlePlay(composition, e)}
                      className="bg-emerald-500 text-white hover:bg-emerald-600 rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
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
                    <div>
                      <h3 className="text-lg font-bold truncate">{composition.title}</h3>
                    </div>
                    <Badge variant="secondary" className="text-xs font-semibold rounded-md bg-emerald-600 text-white">
                      {composition.genre}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                    <span className="flex items-center"><Music className="w-3 h-3 mr-1 " />{composition.bpm} BPM</span>
                    <span>{composition.key}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserCompositionsList;