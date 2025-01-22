import React, { useEffect, useState } from 'react';
import GenreButton from './GenreCard';

interface Genre {
  name: string;
  count: number;
}

const TopGenres: React.FC = () => {
  const [topGenres, setTopGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopGenres = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/top-genres');
        if (!response.ok) {
          throw new Error('Failed to fetch top genres');
        }
        const data = await response.json();
        setTopGenres(data);
      } catch (error) {
        console.error('Error fetching top genres:', error);
        setError('Failed to load top genres. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopGenres();
  }, []);

  if (isLoading) return <div>Loading top genres...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {topGenres.map((genre) => (
        <GenreButton
          key={genre.name}
          name={genre.name}
          count={genre.count}
        />
      ))}
    </div>
  );
};

export default TopGenres;