"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react';
import UserCompositionsList from '../components/UserCompositionsList';
import { Composition } from '../../../types/composition';
import Link from 'next/link';
import { Music, LogOut, PlusCircle, Edit, Upload, Users, Instagram, Twitter, Youtube, BarChart2, Headphones, FileMusic, Settings, Clock } from 'lucide-react';
import Image from 'next/image';

interface CustomSession {
  user: {
    id: string;
    email?: string;
    username?: string;
    role?: 'free' | 'pro';
    subscriptionStatus?: 'none' | 'active' | 'cancelled';
  }
}

interface UserProfile {
  username: string;
  email: string;
  bio: string;
  profilePicture: string;
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  collabEmail: string;
  role: 'free' | 'pro';
  subscriptionStatus: 'none' | 'active' | 'cancelled';
}

export default function Component() {
  const { data: session, status } = useSession() as {
    data: CustomSession | null;
    status: "loading" | "authenticated" | "unauthenticated";
  };

  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [bio, setBio] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [instagramUrl, setInstagramUrl] = useState<string>('');
  const [twitterUrl, setTwitterUrl] = useState<string>('');
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [collabEmail, setCollabEmail] = useState<string>('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCollabEmail, setShowCollabEmail] = useState<boolean>(false);
  const [totalListens, setTotalListens] = useState<number>(0);
  const [username, setUsername] = useState('');
  const dataFetchedRef = useRef(false);

  const fetchUserCompositions = async () => {
    try {
      const response = await fetch('/api/compositions/user');
      const data = await response.json();
      if (data.success) {
        setCompositions(data.data);
        const total = data.data.reduce((sum: number, composition: Composition) => {
          return sum + (Array.isArray(composition.listens) ? composition.listens.length : 0);
        }, 0);
        setTotalListens(total);
      } else {
        throw new Error(data.message || 'Failed to fetch compositions');
      }
    } catch (error) {
      console.error('Error fetching user compositions:', error);
      setError('Failed to fetch compositions. Please try again later.');
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();

      if (data.success) {
        const userData = data.user;
        setUserProfile(userData);
        setBio(userData.bio || '');
        setProfilePicture(userData.profilePicture || '');
        setInstagramUrl(userData.instagramUrl || '');
        setTwitterUrl(userData.twitterUrl || '');
        setYoutubeUrl(userData.youtubeUrl || '');
        setCollabEmail(userData.collabEmail || '');
        setUsername(userData.username || '');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to fetch user profile. Please try again later.');
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && !dataFetchedRef.current) {
      dataFetchedRef.current = true;
      fetchUserProfile();
      fetchUserCompositions();
    }
  }, [status]);

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData();
    formData.append('bio', bio);
    formData.append('instagramUrl', instagramUrl);
    formData.append('twitterUrl', twitterUrl);
    formData.append('youtubeUrl', youtubeUrl);
    formData.append('collabEmail', collabEmail);

    if (fileInputRef.current?.files?.[0]) {
      formData.append('profilePicture', fileInputRef.current.files[0]);
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setIsEditing(false);
        const userData = data.user;
        setUserProfile(userData);
        setBio(userData.bio || '');
        setProfilePicture(userData.profilePicture || '');
        setInstagramUrl(userData.instagramUrl || '');
        setTwitterUrl(userData.twitterUrl || '');
        setYoutubeUrl(userData.youtubeUrl || '');
        setCollabEmail(userData.collabEmail || '');
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleCollabClick = useCallback(() => {
    setShowCollabEmail(!showCollabEmail);
    if (collabEmail) {
      navigator.clipboard.writeText(collabEmail)
        .catch(err => {
          console.error('Failed to copy collab email: ', err);
        });
    }
  }, [collabEmail, showCollabEmail]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p className="text-2xl font-semibold">You must be logged in to view this page.</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start mb-8">
          <div className="relative w-32 h-32 md:w-40 md:h-40 mb-4 md:mb-0 md:mr-6">
            <Image
              src={profilePicture || '/default-avatar.png'}
              alt="Profile Picture"
              layout="fill"
              objectFit="cover"
              className="rounded-full border-4 border-gray-700 shadow-lg"
            />
          </div>
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-emerald-400 flex items-center">
                  {username}
                  {userProfile?.role === 'pro' && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">
                      PRO
                    </span>
                  )}
                </h1>
                <p className="text-gray-300 mb-4 max-w-xl">{bio || 'No bio yet.'}</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <FileMusic className="text-emerald-500 mr-2" size={20}/>
                    <span className="text-sm text-gray-400 mr-2">Total Compositions:</span>
                    <span className="text-lg font-bold">{compositions.length}</span>
                  </div>
                  <div className="flex items-center">
                    <Headphones className="text-emerald-500 mr-2" size={20}/>
                    <span className="text-sm text-gray-400 mr-2">Total Listens:</span>
                    <span className="text-lg font-bold">{totalListens}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-4 mb-4">
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                   className="text-gray-400 hover:text-emerald-500 transition-colors">
                  <Instagram size={20}/>
                </a>
              )}
              {twitterUrl && (
                <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
                   className="text-gray-400 hover:text-emerald-500 transition-colors">
                  <Twitter size={20}/>
                </a>
              )}
              {youtubeUrl && (
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer"
                   className="text-gray-400 hover:text-emerald-500 transition-colors">
                  <Youtube size={20}/>
                </a>
              )}
              <button onClick={handleCollabClick}
                      className="text-gray-400 hover:text-emerald-500 transition-colors relative">
                <Users size={20}/>
                {showCollabEmail && (
                  <span className="absolute left-0 top-full mt-2 bg-gray-800 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
                    {collabEmail || 'No collab email set'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
  
        <div className="flex flex-wrap justify-between items-center mb-8">
          <div className="flex space-x-4 mb-4 md:mb-0">
            <Link href="/profile/add-a-track"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md transition-colors flex items-center">
              <PlusCircle size={20} className="mr-2"/>
              Add Track
            </Link>
            <button onClick={() => setIsEditing(true)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors flex items-center">
              <Edit size={20} className="mr-2"/>
              Edit Profile
            </button>

            <Link href="/profile/edit"
                  className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md transition-colors">
              <Settings size={20} />
            </Link>
          </div>
        </div>
  
        {error && <p className="text-red-500 mb-4">{error}</p>}
  
        {isEditing && (
          <form onSubmit={handleEditProfile} className="bg-gray-800 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-shadow"
                placeholder="Enter your bio"
                rows={4}
              />
              <div className="space-y-4">
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-shadow"
                  placeholder="Instagram URL"
                />
                <input
                  type="text"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-shadow"
                  placeholder="Twitter URL"
                />
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-shadow"
                  placeholder="YouTube URL"
                />
                <input
                  type="email"
                  value={collabEmail}
                  onChange={(e) => setCollabEmail(e.target.value)}
                  className="w-full p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 transition-shadow"
                  placeholder="Collaboration Email"
                />
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <div>
                <label htmlFor="profilePicture"
                       className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full cursor-pointer transition-colors inline-flex items-center">
                  <Upload size={20} className="mr-2"/>
                  Profile Picture
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <div className="space-x-4">
                <button type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-full transition-colors">
                  Save
                </button>
                <button type="button" onClick={() => setIsEditing(false)}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-full transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
  
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Music className="mr-3 text-emerald-500" size={24}/>
            My Compositions
          </h2>
          <UserCompositionsList
            compositions={compositions}
            onCompositionUpdated={fetchUserCompositions}
          />
        </div>
      </div>
    </div>
  );
}
