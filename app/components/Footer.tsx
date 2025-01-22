"use client";

import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-gray-400 py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center">
          <div className="flex space-x-4 mb-4">
            <Link href="#" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200">
              <Facebook size={20} />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200">
              <Twitter size={20} />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200">
              <Instagram size={20} />
            </Link>
          </div>
          <div className="text-sm">
            © {currentYear} On The Track. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;