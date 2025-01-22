import React from 'react';
import Link from 'next/link';

interface TagButtonProps {
  name: string;
  count: number;
}

const TagButton: React.FC<TagButtonProps> = ({ name, count }) => {
  return (
    <Link href={`/tracks?tag=${encodeURIComponent(name)}`} passHref>
      <div
        className={`
          px-3 py-2 w-fit rounded-md text-sm font-medium transition-all duration-300 ease-in-out
          bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-emerald-400
          cursor-pointer flex items-center border border-gray-700 hover:border-emerald-500
        `}
      >
        <span className="space">#{name}</span>
      </div>
    </Link>
  );
};

export default TagButton;