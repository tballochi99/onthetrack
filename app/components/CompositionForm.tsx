'use client'

import React, { useState, ChangeEvent, FormEvent, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Play, Pause, X, Upload, Music, Image as ImageIcon, Tag, DollarSign, Plus, CheckCircle2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface License {
  _id: string
  name: string
  price: number
}

interface CompositionFormProps {
  onCompositionCreated?: () => void
  licenses: License[]
}

const predefinedGenres = [
  'Rap', 'RnB', 'Pop', 'Hip Hop', 'Cloud', 'PluggnB', 'UK Drill', 'NY Drill',
  'Phonk', 'Hyperpop', 'Sad', 'Emo', 'Jazz Rap', 'Lofi', 'Memphis', 'Sexy Drill',
  'Avant-Garde', 'Rage', 'Trap Metal', 'Experimental', 'Horrorcore', 
  'Vaportrap', 'Mumble', 'Boom Bap Revival', 'Alternative Trap', 'Glitch Hop', 
  'SuperTrap', 'West Coast Revival', 'Dirty South Revival', 'SoundCloud Rap', 
  'New Jazz', 'Mainstream'
]

const predefinedKeys = [
  'C Major', 'C# Major', 'D Major', 'D# Major', 'E Major', 'F Major',
  'F# Major', 'G Major', 'G# Major', 'A Major', 'A# Major', 'B Major',
  'C Minor', 'C# Minor', 'D Minor', 'D# Minor', 'E Minor', 'F Minor',
  'F# Minor', 'G Minor', 'G# Minor', 'A Minor', 'A# Minor', 'B Minor'
]

export default function CompositionForm({ onCompositionCreated, licenses }: CompositionFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    bpm: '',
    key: '',
    tags: [] as string[],
    price: '',
    file: null as File | null,
    coverImage: null as File | null,
    selectedLicenses: [] as string[],
    licensePrices: {} as { [key: string]: string },
  })
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [audioPreview, setAudioPreview] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [currentTag, setCurrentTag] = useState('')
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value,
    }))
  }

  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numericValue = value.replace(/\D/g, '')
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: numericValue,
    }))
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (files && files.length > 0) {
      setFormData(prevFormData => ({
        ...prevFormData,
        [name]: files[0],
      }))

      if (name === 'coverImage') {
        const reader = new FileReader()
        reader.onloadend = () => {
          setCoverImagePreview(reader.result as string)
        }
        reader.readAsDataURL(files[0])
      } else if (name === 'file') {
        const url = URL.createObjectURL(files[0])
        setAudioPreview(url)
      }
    }
  }

  const handleRemoveFile = (fileType: 'coverImage' | 'file') => {
    setFormData(prevFormData => ({
      ...prevFormData,
      [fileType]: null,
    }))
    if (fileType === 'coverImage') {
      setCoverImagePreview(null)
    } else {
      setAudioPreview(null)
    }
  }

  const handleLicenseChange = (licenseId: string, checked: boolean) => {
    setFormData(prevFormData => {
      let selectedLicenses;
      if (checked) {
        selectedLicenses = prevFormData.selectedLicenses.includes(licenseId)
            ? prevFormData.selectedLicenses
            : [...prevFormData.selectedLicenses, licenseId];
      } else {
        selectedLicenses = prevFormData.selectedLicenses.filter(id => id !== licenseId);
      }

      return {
        ...prevFormData,
        selectedLicenses,
        licensePrices: {
          ...prevFormData.licensePrices,
          [licenseId]: checked
              ? licenses.find(l => l._id === licenseId)?.price.toString() || ''
              : undefined
        }
      };
    });
  };

  const handleLicensePriceChange = (e: ChangeEvent<HTMLInputElement>, licenseId: string) => {
    const { value } = e.target
    const numericValue = value.replace(/\D/g, '')
    setFormData(prevFormData => ({
      ...prevFormData,
      licensePrices: {
        ...prevFormData.licensePrices,
        [licenseId]: numericValue,
      },
    }))
  }

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' && currentTag.trim() !== '' && formData.tags.length < 3) {
      e.preventDefault()
      setFormData(prevFormData => ({
        ...prevFormData,
        tags: [...prevFormData.tags, currentTag.trim()],
      }))
      setCurrentTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      tags: prevFormData.tags.filter(tag => tag !== tagToRemove),
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const submitFormData = new FormData();

    const uniqueLicenses = Array.from(new Set(formData.selectedLicenses));

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'file' || key === 'coverImage') {
          if (value instanceof File) {
            submitFormData.append(key, value);
          }
        } else if (key === 'tags') {
          (value as string[]).forEach((tag) => {
            submitFormData.append('tags', tag);
          });
        } else if (key === 'selectedLicenses') {
        } else if (key !== 'licensePrices') {
          submitFormData.append(key, value.toString());
        }
      }
    });

    uniqueLicenses.forEach((licenseId) => {
      submitFormData.append('selectedLicenses', licenseId);
      const licensePrice = formData.licensePrices[licenseId];
      if (licensePrice !== undefined && licensePrice !== '') {
        submitFormData.append(`licensePrice_${licenseId}`, licensePrice);
      }
    });

    try {
      const response = await fetch('/api/compositions', {
        method: 'POST',
        body: submitFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload composition');
      }

      const result = await response.json();

      if (onCompositionCreated) {
        onCompositionCreated();
      }

      setFormData({
        title: '',
        genre: '',
        bpm: '',
        key: '',
        tags: [],
        price: '',
        file: null,
        coverImage: null,
        selectedLicenses: [],
        licensePrices: {},
      });
      setCoverImagePreview(null);
      setAudioPreview(null);
      setSuccessMessage('Your track has been successfully uploaded!');

      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('Error uploading composition:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while uploading your composition. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.currentTime = 0
        audioRef.current.play()
        setTimeout(() => {
          if (audioRef.current) audioRef.current.pause()
        }, 10000)
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {successMessage && (
        <Alert className="bg-emerald-900 border-emerald-800 text-emerald-100">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            {successMessage}
          </AlertDescription>
        </Alert>
      )}
      {errorMessage && (
        <Alert className="bg-red-900 border-red-800 text-red-100">
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="title" className="text-gray-300">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="bg-gray-700 border-gray-600 text-white focus:ring-emerald-500"
            />
          </div>
          <div>
            <Label htmlFor="genre" className="text-gray-300">Genre <span className="text-red-500">*</span></Label>
            <Select value={formData.genre} onValueChange={(value) => handleChange({ target: { name: 'genre', value } } as ChangeEvent<HTMLSelectElement>)}>
              <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white focus:ring-emerald-500">
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600 text-white">
                {predefinedGenres.map((genre) => (
                  <SelectItem key={genre} value={genre} className="hover:bg-emerald-600 hover:text-white">{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bpm" className="text-gray-300">BPM <span className="text-red-500">*</span></Label>
              <Input
                id="bpm"
                name="bpm"
                type="text"
                value={formData.bpm}
                onChange={handleNumberChange}
                required
                className="bg-gray-700 border-gray-600 text-white focus:ring-emerald-500"
              />
            </div>
            <div>
              <Label htmlFor="key" className="text-gray-300">Key</Label>
              <Select value={formData.key} onValueChange={(value) => handleChange({ target: { name: 'key', value } } as ChangeEvent<HTMLSelectElement>)}>
                <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white focus:ring-emerald-500">
                  <SelectValue placeholder="Select a key" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600 text-white">
                  {predefinedKeys.map((key) => (
                    <SelectItem key={key} value={key} className="hover:bg-emerald-600 hover:text-white">{key}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="tags" className="text-gray-300">Tags (max 3)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-emerald-600 text-white">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2 focus:outline-none">
                    <X size={14} />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex items-center">
              <Input
                id="tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleTagInput}
                placeholder="Enter tag and press comma"
                className="bg-gray-700 border-gray-600 text-white focus:ring-emerald-500"
                disabled={formData.tags.length >= 3}
              />
              <Button
                type="button"
                onClick={() => {
                  if (currentTag.trim() !== '' && formData.tags.length < 3) {
                    setFormData(prev => ({
                      ...prev,
                      tags: [...prev.tags, currentTag.trim()],
                    }))
                    setCurrentTag('')
                  }
                }}
                disabled={formData.tags.length >= 3 || currentTag.trim() === ''}
                className="ml-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="price" className="text-gray-300">Basic License Price <span className="text-red-500">*</span></Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                id="price"
                name="price"
                type="text"
                value={formData.price}
                onChange={handleNumberChange}
                required
                className="bg-gray-700 border-gray-600 text-white focus:ring-emerald-500 pl-10"
              />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <Label htmlFor="file" className="text-gray-300">Audio File <span className="text-red-500">*</span></Label>
            <div className="mt-2">
              <Input
                id="file"
                name="file"
                type="file"
                onChange={handleFileChange}
                accept="audio/*"
                className="bg-gray-700 border-gray-600 text-white focus:ring-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
              />
            </div>
            {formData.file && (
              <div className="mt-2 flex items-center">
                <Music className="mr-2 h-4 w-4 text-emerald-500" />
                <span className="text-gray-300 text-sm mr-2">{formData.file.name}</span>
                <Button
                  type="button"
                  onClick={() => handleRemoveFile('file')}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </Button>
              </div>
            )}
            {audioPreview && (
              <div className="mt-4 flex items-center">
                <Button
                  type="button"
                  onClick={togglePlay}
                  variant="outline"
                  size="sm"
                  className="mr-2 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </Button>
                <span className="text-gray-300 text-sm">Preview (10 seconds)</span>
                <audio ref={audioRef} src={audioPreview} className="hidden" />
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="coverImage" className="text-gray-300">Cover Image <span className="text-red-500">*</span></Label>
            <div className="mt-2">
              <Input
                id="coverImage"
                name="coverImage"
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="bg-gray-700 border-gray-600 text-white focus:ring-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
              />
            </div>
            {formData.coverImage && (
              <div className="mt-2 flex items-center">
                <ImageIcon className="mr-2 h-4 w-4 text-emerald-500" />
                <span className="text-gray-300 text-sm mr-2">{formData.coverImage.name}</span>
                <Button
                  type="button"
                  onClick={() => handleRemoveFile('coverImage')}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </Button>
              </div>
            )}
            {coverImagePreview && (
              <div className="mt-4">
                <Image src={coverImagePreview} alt="Cover preview" width={200} height={200} className="rounded-lg object-cover" />
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="licenses" className="text-gray-300">Additional Licenses</Label>
            <div className="space-y-4 bg-gray-800 p-4 rounded-lg mt-2">
              {licenses
                .filter(license => !license.name.toLowerCase().includes('basic'))
                .map((license) => (
                  <div key={license._id} className="flex items-center space-x-4 bg-gray-700 p-3 rounded-md">
                    <Checkbox
                      id={`license-${license._id}`}
                      checked={formData.selectedLicenses.includes(license._id)}
                      onCheckedChange={(checked) => handleLicenseChange(license._id, checked as boolean)}
                    />
                    <Label htmlFor={`license-${license._id}`} className="text-gray-300 text-sm flex-grow font-medium">
                      {license.name}
                    </Label>
                    {formData.selectedLicenses.includes(license._id) && (
                      <div className="flex items-center">
                        <span className="text-gray-300 text-sm mr-2">Price:</span>
                        <Input
                          type="text"
                          value={formData.licensePrices[license._id] || ''}
                          onChange={(e) => handleLicensePriceChange(e, license._id)}
                          placeholder="Enter price"
                          className="w-24 bg-gray-800 text-white border-gray-600 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-colors duration-200 ${
          isSubmitting
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-emerald-600 hover:bg-emerald-700'
        }`}
      >
        {isSubmitting ? 'Uploading...' : 'Upload Composition'}
      </Button>
    </form>
  )
}