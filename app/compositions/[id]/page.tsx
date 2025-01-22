'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useCart } from '../../context/CartContext';
import { FaPlay, FaPause, FaShoppingCart, FaHeart, FaMusic, FaBolt, FaKey } from 'react-icons/fa';

interface User {
  username: string;
  _id: string;
}

interface License {
  _id: string;
  licenseId: string;
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
  file: string;
  coverImage: string;
  user: User;
  licenses: License[];
}

interface LicenseDetail extends License {
  name: string;
  fileType: string[];
}

const CompositionDetail = () => {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [composition, setComposition] = useState<Composition | null>(null);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasListenedFor10Seconds, setHasListenedFor10Seconds] = useState(false);
  const [similarCompositions, setSimilarCompositions] = useState<Composition[]>([]);
  const [selectedOption, setSelectedOption] = useState<'composition' | string>('composition');
  const [licenseDetails, setLicenseDetails] = useState<{[key: string]: LicenseDetail}>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        } else {
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);


  useEffect(() => {
    if (composition) {
      if (selectedOption === 'composition') {
        setSelectedLicense(null);
      } else {
        const license = composition.licenses.find(l => l._id === selectedOption);
        setSelectedLicense(license || null);
      }
    }
  }, [selectedOption, composition]);

  useEffect(() => {
    const fetchComposition = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/compositions/${id}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data.success) {
          setComposition(data.data);
          setSimilarCompositions(data.similarCompositions);
          if (data.data.licenses && data.data.licenses.length > 0) {
            setSelectedLicense(data.data.licenses[0]);
          }
        } else {
          throw new Error(data.error || 'Failed to fetch composition details');
        }
      } catch (error) {
        setError('Failed to load composition details. Please try again later.');
        console.error('Error fetching composition:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchComposition();
  }, [id]);

  useEffect(() => {
    const fetchLicenseDetails = async () => {
      if (!composition) return;
      const details: {[key: string]: LicenseDetail} = {};
      for (const license of composition.licenses) {
        try {
          const res = await fetch(`/api/licenses/${license.licenseId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              details[license.licenseId] = {
                ...license,
                name: data.license.name,
                fileType: data.license.fileType
              };
            }
          }
        } catch (error) {
          console.error('Error fetching license details:', error);
        }
      }
      setLicenseDetails(details);
    };

    fetchLicenseDetails();
  }, [composition]);

  const incrementListenCount = async () => {
    if (!hasListenedFor10Seconds && composition) {

      const isOwner = currentUser?._id === composition.user._id;

      if (!isOwner) {
        try {
          const res = await fetch(`/api/compositions/${composition._id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (res.ok) {
            setHasListenedFor10Seconds(true);
          }
        } catch (error) {
          console.error('Error incrementing listen count:', error);
        }
      } else {
        setHasListenedFor10Seconds(true);
      }
    }
  };
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.currentTime >= 10 && !hasListenedFor10Seconds) {
        incrementListenCount();
      }
    };

    const handleDurationChange = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
    };
  }, [composition, hasListenedFor10Seconds, currentUser]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAddToCart = async () => {
    if (composition) {
      try {
        let licenseToAdd;
        if (selectedOption === 'composition') {
          licenseToAdd = {
            _id: composition._id,
            licenseId: 'basic',
            price: composition.price,
          };
        } else {
          licenseToAdd = selectedLicense;
        }

        if (licenseToAdd) {
          await addToCart({
            ...composition,
            licenseId: licenseToAdd._id,
            licenseName: selectedOption === 'composition' ? 'Basic License' : getLicenseName(licenseToAdd.licenseId),
            licensePrice: licenseToAdd.price,
          });
        }
      } catch (error) {
        setError('An error occurred while adding to the cart.');
      }
    }
  };

  const navigateToUserProfile = () => {
    if (composition?.user._id) {
      router.push(`/profile/${composition.user._id}`);
    }
  };

  const licenseNames: { [key: string]: string } = {
    '66d6c9b5c70458e74b65bcab': "Premium License",
    '66d6c9bec70458e74b65bcad': "Trackout License",
    '66d6c9dcc70458e74b65bcaf': "Unlimited License",
    '66d6c9e9c70458e74b65bcb1': "Exclusive License"
  };
  const getFileTypeString = (license: License) => {
    const detail = licenseDetails[license.licenseId];
    if (detail && Array.isArray(detail.fileType) && detail.fileType.length > 0) {
      return `(${detail.fileType.join(", ")})`;
    }
    return "";
  };


  const getLicenseName = (licenseId: string): string => {
    return licenseNames[licenseId] || `License ${licenseId.slice(-4)}`;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  }

  if (!composition) {
    return <div className="flex items-center justify-center h-screen text-white">Composition not found.</div>;
  }

  return (
<div className="bg-gradient-to-b from-gray-900 to-black text-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/5">
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src={composition.coverImage || ''}
                alt={composition.title || 'Composition Cover'}
                layout="fill"
                objectFit="cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-4xl font-bold mb-2 text-white">{composition.title}</h1>
                <button
                  onClick={navigateToUserProfile}
                  className="text-xl text-emerald-500 hover:text-white transition duration-300"
                >
                  {composition.user.username}
                </button>
              </div>
            </div>
          </div>
  
          <div className="lg:w-3/5 space-y-8">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center bg-gray-800 rounded-full px-4 py-2">
                <FaMusic className="text-emerald-400 mr-2"/>
                <span className="font-medium">{composition.genre}</span>
              </div>
              <div className="flex items-center bg-gray-800 rounded-full px-4 py-2">
                <FaBolt className="text-emerald-400 mr-2"/>
                <span className="font-medium">{composition.bpm} BPM</span>
              </div>
              {composition.key && composition.key !== '' && (
                <div className="flex items-center bg-gray-800 rounded-full px-4 py-2">
                  <FaKey className="text-emerald-400 mr-2"/>
                  <span className="font-medium">{composition.key}</span>
                </div>
              )}
            </div>
  
            <div className="flex flex-wrap gap-2">
              {composition.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold mb-4 text-white">Select License</h2>
              <Select value={selectedOption} onValueChange={setSelectedOption}>
                <SelectTrigger
                    className="w-full bg-gray-700 text-white rounded-lg p-3 mb-4 focus:ring-2 focus:ring-emerald-500 border-none">
                  <SelectValue placeholder="Select a license"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="composition">
                    ${composition.price.toFixed(2)} - Basic License (MP3)
                  </SelectItem>
                  {composition.licenses.map((license) => (
                      <SelectItem key={license._id} value={license._id}>
                        ${license.price.toFixed(2)} - {getLicenseName(license.licenseId)} {getFileTypeString(license)}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-white">
                  ${selectedOption === 'composition' ? composition.price.toFixed(2) : (selectedLicense?.price.toFixed(2) || composition.price.toFixed(2))}
                </p>
                <Button
                    onClick={handleAddToCart}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full flex items-center gap-2 transition duration-300"
                >
                  <FaShoppingCart/>
                  Add to Cart
                </Button>
              </div>
            </div>

            <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-6 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button
                      onClick={handlePlayPause}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full transition duration-300"
                  >
                    {isPlaying ? <FaPause/> : <FaPlay/>}
                  </Button>
                  <div className="text-sm font-medium text-white">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>
                <Slider
                    value={[currentTime]}
                    max={duration}
                    step={0.1}
                    onValueChange={handleSeek}
                  className="w-full"
                />
              </div>
              <audio
                ref={audioRef}
                src={composition.file || ''}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          </div>
        </div>
  
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-white">Similar Tracks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {similarCompositions.map((comp) => (
              <div key={comp._id}
                   className="bg-gray-800 bg-opacity-50 rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 backdrop-blur-sm">
                <div className="relative aspect-square">
                  <Image
                    src={comp.coverImage || ''}
                    alt={comp.title}
                    layout="fill"
                    objectFit="cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-4 relative">
                  <h3 className="font-semibold text-lg truncate text-white">{comp.title}</h3>
                  <p className="text-gray-300 truncate">{comp.user.username}</p>
                  <p className="mt-2 font-bold ">${comp.price.toFixed(2)}</p>
                  <Button
                    onClick={() => router.push(`/compositions/${comp._id}`)}
                    className="w-full mt-3 bg-emerald-700 hover:bg-emerald-600 transition duration-300 text-white"
                  >
                    View Track
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompositionDetail;