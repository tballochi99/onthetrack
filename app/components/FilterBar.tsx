import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X } from 'lucide-react'
import { Input } from "@/components/ui/input"
import TagButton from './TagButton'

const genres = ['All', 'Rap', 'RnB', 'Pop', 'Hip Hop', 'Cloud', 'PluggnB', 'UK Drill', 'NY Drill',
  'Phonk', 'Hyperpop', 'Sad', 'Emo', 'Jazz Rap', 'Lofi', 'Memphis', 'Sexy Drill',
  'Avant-Garde', 'Rage', 'Trap Metal', 'Experimental', 'Horrorcore', 
  'Vaportrap', 'Mumble', 'Boom Bap Revival', 'Alternative Trap', 'Glitch Hop', 
  'SuperTrap', 'West Coast Revival', 'Dirty South Revival', 'SoundCloud Rap', 
  'New Jazz', 'Mainstream']

const keys = ['All', 'C Major', 'C# Major', 'D Major', 'D# Major', 'E Major', 'F Major', 'F# Major', 'G Major', 'G# Major', 'A Major', 'A# Major', 'B Major', 'C Minor', 'C# Minor', 'D Minor', 'D# Minor', 'E Minor', 'F Minor', 'F# Minor', 'G Minor', 'G# Minor', 'A Minor', 'A# Minor', 'B Minor']

const sortOptions = ['Random', 'Most Popular', 'Newest', 'Price Low to High', 'Price High to Low']

interface FilterBarProps {
  filters: {
    genre: string
    sort: string
    priceRange: { min: number; max: number; label: string }
    bpmRange: [number, number]
    key: string
    tags: { name: string; count: number }[]
  }
  setFilters: React.Dispatch<React.SetStateAction<{
    genre: string
    sort: string
    priceRange: { min: number; max: number; label: string }
    bpmRange: [number, number]
    key: string
    tags: { name: string; count: number }[]
  }>>
  resetFilters: () => void
  allTags: { name: string; count: number }[]
  priceRanges: { min: number; max: number; label: string }[]
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, resetFilters, allTags, priceRanges }) => {
  const [tagInput, setTagInput] = useState('')
  const [tagSuggestions, setTagSuggestions] = useState<{ name: string; count: number }[]>([])

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTagInput(value)
    if (value.length > 0) {
      const suggestions = allTags
        .filter(tag => tag.name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5)
      setTagSuggestions(suggestions)
    } else {
      setTagSuggestions([])
    }
  }

  const handleAddTag = (tagName: string, count: number) => {
    if (tagName && !filters.tags.some(tag => tag.name === tagName)) {
      setFilters(prev => ({ ...prev, tags: [...prev.tags, { name: tagName, count }] }))
      setTagInput('')
      setTagSuggestions([])
    }
  }

  const handleRemoveTag = (tagName: string) => {
    setFilters(prev => ({ ...prev, tags: prev.tags.filter(t => t.name !== tagName) }))
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <Select
          value={filters.genre}
          onValueChange={(value) => setFilters(prev => ({ ...prev, genre: value }))}
        >
          <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Select Genre" />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600 text-white">
            {genres.map((genre) => (
              <SelectItem key={genre} value={genre}>{genre}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.sort}
          onValueChange={(value) => setFilters(prev => ({ ...prev, sort: value }))}
        >
          <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600 text-white">
            {sortOptions.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.priceRange.label}
          onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: priceRanges.find(range => range.label === value) || priceRanges[0] }))}
        >
          <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600 text-white">
            {priceRanges.map((range) => (
              <SelectItem key={range.label} value={range.label}>{range.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.key}
          onValueChange={(value) => setFilters(prev => ({ ...prev, key: value }))}
        >
          <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Select Key" />
          </SelectTrigger>
          <SelectContent className="bg-gray-700 border-gray-600 text-white">
            {keys.map((key) => (
              <SelectItem key={key} value={key}>{key}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="secondary" onClick={resetFilters} className="w-full">
          <X className="mr-2 h-4 w-4" /> Reset Filters
        </Button>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium leading-none text-gray-300">BPM Range: {filters.bpmRange[0]} - {filters.bpmRange[1]}</Label>
          <Slider
            min={0}
            max={300}
            step={5}
            value={filters.bpmRange}
            onValueChange={(value) => setFilters(prev => ({ ...prev, bpmRange: value as [number, number] }))}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium leading-none text-gray-300">Tags</Label>
          <div className="flex flex-wrap gap-2">
            {filters.tags.map(tag => (
              <div key={tag.name} className="relative">
                <TagButton name={tag.name} count={tag.count} />
                <button
                  onClick={() => handleRemoveTag(tag.name)}
                  className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="relative">
            <Input
              type="text"
              placeholder="Add a tag"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && tagSuggestions.length > 0) {
                  handleAddTag(tagSuggestions[0].name, tagSuggestions[0].count)
                }
              }}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
            {tagSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg">
                {tagSuggestions.map((tag) => (
                  <div
                    key={tag.name}
                    className="px-4 py-2 hover:bg-gray-600 cursor-pointer text-white"
                    onClick={() => handleAddTag(tag.name, tag.count)}
                  >
                    {tag.name} ({tag.count})
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterBar