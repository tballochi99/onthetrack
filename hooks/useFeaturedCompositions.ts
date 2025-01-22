import { useState, useEffect, useCallback } from 'react';
import { Composition } from '../../types/composition';

export const useFeaturedCompositions = () => {
  const [featuredCompositions, setFeaturedCompositions] = useState<Composition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedCompositions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/compositions/top');
      if (!response.ok) {
        throw new Error('Failed to fetch featured compositions');
      }
      const data: Composition[] = await response.json();
      setFeaturedCompositions(data);
    } catch (err) {
      console.error('Error fetching compositions:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
  }, [featuredCompositions]);

  return { featuredCompositions, isLoading, error, fetchFeaturedCompositions };
};