import React, { useEffect, useCallback } from 'react';
import CompositionCard from './CompositionCard';
import { Composition } from '../../../types/composition';
import { useFeaturedCompositions } from '../../../src/hooks/useFeaturedCompositions';

const FeaturedCompositions: React.FC = () => {
  const { featuredCompositions, isLoading, error, fetchFeaturedCompositions } = useFeaturedCompositions();

  useEffect(() => {
    fetchFeaturedCompositions();
  }, [fetchFeaturedCompositions]);

  const renderContent = useCallback(() => {
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (featuredCompositions.length === 0) return <p>No featured compositions available at the moment.</p>;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {featuredCompositions.map((composition: Composition) => (
          <div key={composition._id}>
            <CompositionCard composition={composition} />
          </div>
        ))}
      </div>
    );
  }, [isLoading, error, featuredCompositions]);

  return (
    <div>
      {renderContent()}
    </div>
  );
};

export default React.memo(FeaturedCompositions);