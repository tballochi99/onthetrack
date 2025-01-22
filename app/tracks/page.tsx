'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CompositionCard from '@/app/components/CompositionCard'
import { Composition } from '@/app/components/CompositionCard'
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, X } from 'lucide-react'
import FilterBar from '@/app/components/FilterBar'

const TracksPage: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialFilters = {
    genre: searchParams.get('genre') || 'All',
    sort: 'Random',
    priceRange: { min: 0, max: Infinity, label: 'All Prices' }, 
    bpmRange: [0, 300] as [number, number],
    key: 'All',
    tags: searchParams.get('tag') 
      ? [{ name: searchParams.get('tag') as string, count: 0 }] 
      : []
  }

  const [compositions, setCompositions] = useState<Composition[]>([])
  const [filteredCompositions, setFilteredCompositions] = useState<Composition[]>([])
  const [filters, setFilters] = useState(initialFilters)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const allAvailableTags = useMemo(() => {
    const tagCounts: { [key: string]: number } = {}
    compositions.forEach((comp: Composition) => {
      comp.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })
    return Object.entries(tagCounts).map(([name, count]) => ({ name, count }))
  }, [compositions])

  useEffect(() => {
    const fetchCompositions = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/compositions')
        const data = await res.json()
        if (data.success) {
          setCompositions(data.data)
          setFilteredCompositions(shuffleArray(data.data))
        } else {
          throw new Error(data.error || 'Failed to fetch compositions')
        }
      } catch (error) {
        setError('Failed to load tracks. Please try again later.')
        console.error('Error fetching compositions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompositions()
  }, [])

  useEffect(() => {
    const search = searchParams.get('search')
    const genre = searchParams.get('genre')
    const tag = searchParams.get('tag')

    let newFilters = { ...initialFilters }

    if (search) {
      setFilteredCompositions(compositions.filter(comp => 
        comp.title.toLowerCase().includes(search.toLowerCase())
      ))
    }

    if (genre) {
      newFilters.genre = genre
    }

    if (tag) {
      newFilters.tags = [{ name: tag, count: 0 }]
    }

    setFilters(newFilters)
  }, [searchParams, compositions])

  useEffect(() => {
    let result = [...compositions]

    if (filters.genre !== 'All') {
      result = result.filter(comp => comp.genre === filters.genre)
    }

    if (filters.priceRange.label !== 'All Prices') {
      result = result.filter(comp => 
        comp.price >= filters.priceRange.min && comp.price <= filters.priceRange.max
      )
    }

    result = result.filter(comp => 
      comp.bpm >= filters.bpmRange[0] && comp.bpm <= filters.bpmRange[1]
    )

    if (filters.key !== 'All') {
      result = result.filter(comp => comp.key === filters.key)
    }

    if (filters.tags.length > 0) {
      result = result.filter(comp => 
        filters.tags.every(tag => comp.tags.includes(tag.name))
      )
    }

    switch (filters.sort) {
      case 'Most Popular':
        result.sort((a, b) => b.listens.length - a.listens.length)
        break
      case 'Newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'Price Low to High':
        result.sort((a, b) => a.price - b.price)
        break
      case 'Price High to Low':
        result.sort((a, b) => b.price - a.price)
        break
      case 'Random':
        result = shuffleArray(result)
        break
    }

    setFilteredCompositions(result)
  }, [filters, compositions])

  const shuffleArray = (array: Composition[]): Composition[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const resetFilters = () => {
    setFilters(initialFilters)
    router.replace('/tracks')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white">
        <p className="text-xl mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Explore Tracks</h1>
        <FilterBar 
          filters={filters} 
          setFilters={setFilters} 
          resetFilters={resetFilters} 
          allTags={allAvailableTags}
          priceRanges={[
            { min: 0, max: Infinity, label: 'All Prices' },
            { min: 0, max: 30, label: '$0 - $30' },
            { min: 30, max: 50, label: '$30 - $50' },
            { min: 50, max: 100, label: '$50 - $100' },
            { min: 100, max: Infinity, label: '$100+' }
          ]}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-8">
          {filteredCompositions.map((composition) => (
            <CompositionCard key={composition._id} composition={composition} />
          ))}
        </div>
        {filteredCompositions.length === 0 && (
          <p className="text-center text-gray-400 mt-8">No tracks found matching your filters.</p>
        )}
      </div>
    </div>
  )
}

export default TracksPage