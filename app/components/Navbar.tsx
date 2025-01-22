"use client"

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, ShoppingCart, User, LogOut } from 'lucide-react';
import Image from 'next/image';

interface User {
  _id: string;
  username: string;
}

interface Composition {
  _id: string;
  title: string;
  genre: string;
  tags: string[];
  user: User;
}

type SuggestionType = 'composition' | 'user' | 'genre' | 'tag';

interface Suggestion {
  type: SuggestionType;
  value: string;
  id?: string;
}

const SearchBar = ({ isTracksPage }: { isTracksPage: boolean }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCompositions = async () => {
      try {
        const response = await fetch('/api/compositions');
        const data = await response.json();
        if (data.success) {
          setCompositions(data.data);
        }
      } catch (error) {
        console.error('Error fetching compositions:', error);
      }
    };

    if (isTracksPage) {
      fetchCompositions();
    }
  }, [isTracksPage]);

  const generateSuggestions = (searchTerm: string): Suggestion[] => {
    if (searchTerm.length > 0) {
      const searchLower = searchTerm.toLowerCase();

      const compositionSuggestions: Suggestion[] = compositions
        .filter(comp => comp.title && comp.title.toLowerCase().includes(searchLower))
        .map(comp => ({
          type: 'composition',
          value: comp.title,
          id: comp._id
        }));

      const userSuggestions: Suggestion[] = compositions
        .filter(comp => comp.user && comp.user.username && comp.user.username.toLowerCase().includes(searchLower))
        .map(comp => ({
          type: 'user',
          value: comp.user.username,
          id: comp.user._id
        }))
        .reduce((acc, current) => {
          const x = acc.find(item => item.value === current.value);
          if (!x) {
            return acc.concat([current]);
          }
          return acc;
        }, [] as Suggestion[]);

      const genreSuggestions: Suggestion[] = compositions
        .filter(comp => comp.genre && typeof comp.genre === 'string' && comp.genre.toLowerCase().includes(searchLower))
        .map(comp => ({
          type: 'genre',
          value: comp.genre
        }))
        .reduce((acc, current) => {
          const x = acc.find(item => item.value === current.value);
          if (!x) {
            return acc.concat([current]);
          }
          return acc;
        }, [] as Suggestion[]);

      const tagSuggestions: Suggestion[] = compositions
        .flatMap(comp => comp.tags || [])
        .filter(tag => tag && typeof tag === 'string' && tag.toLowerCase().includes(searchLower))
        .map(tag => ({
          type: 'tag',
          value: tag
        }))
        .reduce((acc, current) => {
          const x = acc.find(item => item.value === current.value);
          if (!x) {
            return acc.concat([current]);
          }
          return acc;
        }, [] as Suggestion[]);

      return [...compositionSuggestions, ...userSuggestions, ...genreSuggestions, ...tagSuggestions]
        .slice(0, 10);
    }
    return [];
  };

  useEffect(() => {
    if (searchTerm.length > 0 && isTracksPage) {
      const newSuggestions = generateSuggestions(searchTerm);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, isTracksPage, compositions]);

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSearchTerm('');
    setShowSuggestions(false);
    switch (suggestion.type) {
      case 'composition':
        if (suggestion.id) {
          router.push(`/compositions/${suggestion.id}`);
        }
        break;
      case 'user':
        if (suggestion.id) {
          router.push(`/profile/${suggestion.id}`);
        }
        break;
      case 'genre':
        router.push(`/tracks?genre=${encodeURIComponent(suggestion.value)}`);
        break;
      case 'tag':
        router.push(`/tracks?tag=${encodeURIComponent(suggestion.value)}`);
        break;
    }
  };

  if (!isTracksPage) return null;

  return (
    <div className="flex-1 mx-56" ref={searchRef}>
    <div className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search beats, artists, tags..."
        className="w-full px-4 py-2 rounded-full bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/50"
      />
      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.value}-${index}`}
              className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white hover:text-emerald-400 transition-colors duration-200 flex items-center"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.type === 'composition' && <Search className="mr-2 h-4 w-4 text-emerald-400" />}
              {suggestion.type === 'tag' && <span className="mr-2 text-emerald-400">#</span>}
              {suggestion.type === 'user' && <span className="mr-2 text-emerald-400">@</span>}
              {suggestion.type === 'genre' && <span className="mr-2 text-emerald-400">🎵</span>}
              <span>{suggestion.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
};

const CartIcon = ({ count }: { count: number }) => (
  <Link href="/cart">
    <div className="relative text-gray-300 hover:text-emerald-400 cursor-pointer flex items-center transition-colors duration-200">
      <ShoppingCart className="w-6 h-6" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 rounded-full bg-emerald-500 text-white text-xxs w-3 h-3 flex items-center justify-center">
          {count}
        </span>
      )}
    </div>
  </Link>
);

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href}>
    <span className="text-gray-300 hover:text-emerald-400 cursor-pointer transition-colors duration-200">
      {children}
    </span>
  </Link>
);

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const pathname = usePathname();
  const isTracksPage = pathname === '/tracks';

  useEffect(() => {
    const fetchCartItemsCount = async () => {
      if (session) {
        try {
          const response = await fetch('/api/cart');
          if (response.ok) {
            const data = await response.json();
            setCartItemsCount(data.cart.length);
          }
        } catch (error) {
          console.error('Error fetching cart items:', error);
        }
      } else {
        setCartItemsCount(0);
      }
    };

    fetchCartItemsCount();
  }, [session]);

  return (
    <nav className="w-full p-4 bg-black shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200">
          <Image
            src="/logo.png"
            alt="On The Track Logo"
            width={32}
            height={32}
            className="w-14"
          />
          <span className="text-white text-lg font-bold cursor-pointer hover:text-emerald-300 transition-colors duration-200">
            On The Track
          </span>
        </Link>

        <SearchBar isTracksPage={isTracksPage} />

        <div className="flex space-x-4 items-center">
          <NavLink href="/tracks">Tracks</NavLink>
          {session ? (
            <>
              <NavLink href="/global-dashboard">Dashboard</NavLink>
              <NavLink href="/profile">Profile</NavLink>
              <CartIcon count={cartItemsCount} />
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-gray-300 hover:text-red-400 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <NavLink href="/login">Login</NavLink>
              <NavLink href="/register">Register</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;