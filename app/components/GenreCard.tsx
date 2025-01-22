
import React from 'react';
import Link from 'next/link';
import { Music } from 'lucide-react';

interface GenreButtonProps {
  name: string;
  count: number;
}

const GenreButton: React.FC<GenreButtonProps> = ({ name }) => {
  return (
    <Link href={`/tracks?genre=${encodeURIComponent(name)}`} passHref>
      <div
        className={`
          w-full h-40 rounded-lg font-medium
          bg-gray-800 hover:bg-gray-700
          flex flex-col justify-center items-center cursor-pointer
          text-gray-300 hover:text-white
          transition-all duration-300 ease-in-out
          group relative overflow-hidden
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Music className="w-8 h-8 mb-3 opacity-50 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 text-emerald-100" />
        <span className="text-lg font-semibold tracking-wide z-10 transition-all duration-300 group-hover:tracking-wider group-hover:text-emerald-400">
          {name}
        </span>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </div>
    </Link>
  );
};

export default GenreButton;