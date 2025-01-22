"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Play, Pause, X, Upload, Music, Image as ImageIcon, Tag, DollarSign, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/cardimprove";
import { Badge } from "@/components/ui/badge";

interface License {
  _id: string;
  name: string;
  price: number;
}

interface Composition {
  _id: string;
  title: string;
  genre: string;
  bpm: number;
  key: string;
  tags: string[];
  price: number;
  file: string | File;
  coverImage: string | File;
  licenses: { licenseId: string; price: number }[];
}

const predefinedGenres = [
  'Rap', 'RnB', 'Pop', 'Hip Hop', 'Cloud', 'PluggnB', 'UK Drill', 'NY Drill',
  'Phonk', 'Hyperpop', 'Sad', 'Emo', 'Jazz Rap', 'Lofi', 'Memphis', 'Sexy Drill',
  'Avant-Garde', 'Rage', 'Trap Metal', 'Experimental', 'Horrorcore', 
  'Vaportrap', 'Mumble', 'Boom Bap Revival', 'Alternative Trap', 'Glitch Hop', 
  'SuperTrap', 'West Coast Revival', 'Dirty South Revival', 'SoundCloud Rap', 
  'New Jazz', 'Mainstream'
];

const predefinedKeys = [
  'C Major', 'C# Major', 'D Major', 'D# Major', 'E Major', 'F Major',
  'F# Major', 'G Major', 'G# Major', 'A Major', 'A# Major', 'B Major',
  'C Minor', 'C# Minor', 'D Minor', 'D# Minor', 'E Minor', 'F Minor',
  'F# Minor', 'G Minor', 'G# Minor', 'A Minor', 'A# Minor', 'B Minor'
];

export default function EditCompositionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [composition, setComposition] = useState<Composition | null>(null);
  const [formData, setFormData] = useState<Partial<Composition>>({});
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTag, setCurrentTag] = useState('');
  const [availableLicenses, setAvailableLicenses] = useState<License[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchComposition = async () => {
      if (!id) return;
      try {
        const response = await fetch(`/api/compositions/user/${id}`);
        if (response.ok) {
          const data = await response.json();
          setComposition(data);
          setFormData(data);
          setCoverImagePreview(data.coverImage);
          setAudioPreview(data.file);
        }
      } catch (error) {
        console.error('Error fetching composition:', error);
        setErrorMessage('Failed to load composition data');
      }
    };

    const fetchLicenses = async () => {
      try {
        const response = await fetch('/api/licenses');
        if (response.ok) {
          const data = await response.json();
          setAvailableLicenses(data);
        }
      } catch (error) {
        console.error('Error fetching licenses:', error);
      }
    };

    fetchComposition();
    fetchLicenses();
  }, [id]);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, [name]: numericValue }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0 && name === 'coverImage') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleRemoveFile = (fileType: 'coverImage') => {
    setFormData(prev => ({ ...prev, [fileType]: null }));
    setCoverImagePreview(typeof composition?.coverImage === 'string' ? composition.coverImage : null);
  };

  const handleLicenseChange = (licenseId: string, price: string) => {
    setFormData(prev => {
      const updatedLicenses = prev.licenses ? [...prev.licenses] : [];
      const existingIndex = updatedLicenses.findIndex(l => l.licenseId === licenseId);
      
      if (existingIndex !== -1) {
        updatedLicenses[existingIndex] = { ...updatedLicenses[existingIndex], price: Number(price) };
      } else {
        updatedLicenses.push({ licenseId, price: Number(price) });
      }

      return { ...prev, licenses: updatedLicenses };
    });
  };

  const handleAddTag = () => {
    if (currentTag.trim() !== '' && formData.tags && formData.tags.length < 3) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), currentTag.trim()],
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags ? prev.tags.filter(tag => tag !== tagToRemove) : [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const submitFormData = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'coverImage') {
          if (value instanceof File) {
            submitFormData.append(key, value);
          }
        } else if (key === 'tags') {
          (value as string[]).forEach(tag => submitFormData.append('tags', tag));
        } else if (key === 'licenses') {
          submitFormData.append('licenses', JSON.stringify(value));
        } else {
          submitFormData.append(key, value.toString());
        }
      }
    });

    try {
      const response = await fetch(`/api/compositions/user/${id}`, {
        method: 'PUT',
        body: submitFormData,
      });

      if (!response.ok) {
        throw new Error('Failed to update composition');
      }

      const result = await response.json();
      router.push('/profile');
    } catch (error) {
      console.error('Error updating composition:', error);
      setErrorMessage('An error occurred while updating your composition. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setTimeout(() => {
          if (audioRef.current) audioRef.current.pause();
        }, 10000);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this composition?')) return;

    try {
      const response = await fetch(`/api/compositions/user/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete composition');
      }

      router.push('/profile');
    } catch (error) {
      console.error('Error deleting composition:', error);
      setErrorMessage('An error occurred while deleting your composition. Please try again.');
    }
  };

  if (!composition) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="bg-[#111827] text-[#FFFFFF] min-h-screen p-8">
      <Card className="max-w-4xl mx-auto bg-[#1F2937] border-[#374151]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#D1D5DB]">Edit Composition</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-[#D1D5DB]">Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    required
                    className="bg-[#374151] border-[#4B5563] text-[#FFFFFF] focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <Label htmlFor="genre" className="text-[#D1D5DB]">Genre <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.genre || ''}
                    onValueChange={(value) => handleChange('genre', value)}
                  >
                    <SelectTrigger className="w-full bg-[#374151] border-[#4B5563] text-[#FFFFFF] focus:ring-emerald-600">
                      <SelectValue placeholder="Select a genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedGenres.map((genre) => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bpm" className="text-[#D1D5DB]">BPM <span className="text-red-500">*</span></Label>
                    <Input
                      id="bpm"
                      name="bpm"
                      type="number"
                      value={formData.bpm || ''}
                      onChange={handleNumberChange}
                      required
                      className="bg-[#374151] border-[#4B5563] text-[#FFFFFF] focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="key" className="text-[#D1D5DB]">Key</Label>
                    <Select
                      value={formData.key || ''}
                      onValueChange={(value) => handleChange('key', value)}
                    >
                      <SelectTrigger className="w-full bg-[#374151] border-[#4B5563] text-[#FFFFFF] focus:ring-emerald-600">
                        <SelectValue placeholder="Select a key" />
                      </SelectTrigger>
                      <SelectContent>
                        {predefinedKeys.map((key) => (
                          <SelectItem key={key} value={key}>{key}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="tags" className="text-[#D1D5DB]">Tags (max 3)</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags && formData.tags.map((tag, index) => (
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
                      placeholder="Enter a tag"
                      className="bg-[#374151] border-[#4B5563] text-[#FFFFFF] focus:ring-emerald-600"
                      disabled={formData.tags && formData.tags.length >= 3}
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      disabled={formData.tags && formData.tags.length >= 3}
                      className="ml-2"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="price" className="text-[#D1D5DB]">Basic License Price <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF]" size={16} />
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price || ''}
                      onChange={handleNumberChange}
                      required
                      className="bg-[#374151] border-[#4B5563] text-[#FFFFFF] focus:ring-emerald-600 pl-10"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="coverImage" className="text-[#D1D5DB]">Cover Image <span className="text-red-500">*</span></Label>
                  <div className="mt-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            onClick={() => document.getElementById('coverImage')?.click()}
                            className="w-full bg-[#374151] hover:bg-[#4B5563] text-[#FFFFFF]"
                          >
                            <ImageIcon className="mr-2 h-4 w-4" /> Upload Image
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Click to upload a cover image</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Input
                      id="coverImage"
                      name="coverImage"
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  {formData.coverImage && (
                    <div className="mt-2 flex items-center">
                      <ImageIcon className="mr-2 h-4 w-4 text-emerald-600" />
                      <span className="text-[#D1D5DB] text-sm mr-2">
                        {formData.coverImage instanceof File ? formData.coverImage.name : 'Current cover image'}
                      </span>
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
                  <Label htmlFor="licenses" className="text-[#D1D5DB]">Additional Licenses</Label>
                  <div className="space-y-4 bg-[#1F2937] p-4 rounded-lg mt-2">
                    {availableLicenses
                      .filter(license => !license.name.toLowerCase().includes('basic'))
                      .map((license) => (
                        <div key={license._id} className="flex items-center space-x-4 bg-[#374151] p-3 rounded-md">
                          <Switch
                            checked={formData.licenses?.some(l => l.licenseId === license._id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleLicenseChange(license._id, license.price.toString());
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  licenses: prev.licenses?.filter(l => l.licenseId !== license._id) || []
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={`license-${license._id}`} className="text-[#D1D5DB] text-sm flex-grow font-medium">
                            {license.name}
                          </Label>
                          <div className="flex items-center">
                            <span className="text-[#D1D5DB] text-sm mr-2">Price:</span>
                            <Input
                              type="number"
                              value={formData.licenses?.find(l => l.licenseId === license._id)?.price || ''}
                              onChange={(e) => handleLicenseChange(license._id, e.target.value)}
                              placeholder="Enter price"
                              className="w-24 bg-[#1F2937] text-[#FFFFFF] border-[#4B5563] rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
                              disabled={!formData.licenses?.some(l => l.licenseId === license._id)}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{errorMessage}</span>
              </div>
            )}
            <div className="flex justify-between">
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`py-3 px-4 rounded-lg text-[#FFFFFF] font-semibold transition-colors duration-200 ${
                  isSubmitting
                    ? 'bg-[#4B5563] cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isSubmitting ? 'Updating...' : 'Update Composition'}
              </Button>
              <Button
                type="button"
                onClick={() => router.push('/profile')}
                variant="outline"
                className="py-3 px-4 bg-[#374151] text-[#D1D5DB] rounded-lg hover:bg-[#4B5563] transition-colors duration-200"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                variant="destructive"
                className="py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Delete Composition
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}