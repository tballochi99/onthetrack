"use client";

import { useEffect, useState } from 'react';
import { Clock, Download, Loader2, AlertCircle, Music, User } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from "../context/authprovider";

interface PurchaseItem {
  compositionId: string;
  title: string;
  artist: string;
  licenseName: string;
  licensePrice: number;
  coverImage: string;
  file: string;
}

interface Purchase {
  _id: string;
  items: PurchaseItem[];
  totalAmount: number;
  createdAt: string;
}

export default function PurchasesPage() {
  const { session } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingFiles, setDownloadingFiles] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await fetch('/api/purchase/get-history');
        if (!response.ok) {
          throw new Error('Failed to fetch purchases');
        }
        const data = await response.json();
        setPurchases(data.purchases);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load purchase history');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchPurchases();
    } else {
      setLoading(false);
    }
  }, [session]);

  const handleDownload = async (compositionId: string, file: string, title: string) => {
    if (!file) {
      alert('No file available for download');
      return;
    }

    try {
      setDownloadingFiles(prev => ({ ...prev, [compositionId]: true }));
      
      const fileName = file.split('/').pop();
      const downloadUrl = `/api/purchase/download/${encodeURIComponent(fileName)}`;
      
      console.log('Initiating download from:', downloadUrl);
      
      const response = await fetch(downloadUrl);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('audio/mpeg')) {
        throw new Error('Invalid file type received');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.mp3`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download file. Please try again.');
    } finally {
      setDownloadingFiles(prev => ({ ...prev, [compositionId]: false }));
    }
  };

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4">
        <AlertCircle className="w-16 h-16 mb-4 text-red-500" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-center">Please log in to view your purchase history.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4">
        <Loader2 className="w-16 h-16 mb-4 animate-spin text-emerald-400" />
        <h1 className="text-2xl font-bold mb-2">Loading</h1>
        <p>Fetching your purchase history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4">
        <AlertCircle className="w-16 h-16 mb-4 text-red-500" />
        <h1 className="text-2xl font-bold mb-2">Error</h1>
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center text-white">
          <Clock className="w-8 h-8 mr-2 text-emerald-400" />
          Purchase History
        </h1>

        {purchases.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
            <p className="text-gray-400 text-lg">No purchases found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {purchases.map((purchase) => (
              <div
                key={purchase._id}
                className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700"
              >
                <div className="mb-4 pb-2 border-b border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">
                      {new Date(purchase.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="text-emerald-400 font-bold">
                      Total: ${purchase.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {purchase.items.map((item) => (
                    <div
                      key={`${purchase._id}-${item.compositionId}`}
                      className="bg-gray-750 p-4 rounded-lg flex items-center gap-4"
                    >
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <Image
                          src={item.coverImage}
                          alt={item.title}
                          fill
                          className="rounded-lg object-cover"
                        />
                      </div>

                      <div className="flex-grow">
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {item.title}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <p className="flex items-center text-gray-400">
                            <User className="w-4 h-4 mr-2 text-emerald-400" />
                            {item.artist}
                          </p>
                          <p className="flex items-center text-gray-400">
                            <Music className="w-4 h-4 mr-2 text-emerald-400" />
                            {item.licenseName}
                          </p>
                        </div>
                        <p className="text-emerald-400 text-sm mt-1">
                          ${item.licensePrice.toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDownload(item.compositionId, item.file, item.title)}
                        disabled={downloadingFiles[item.compositionId]}
                        className={`flex-shrink-0 px-4 py-2 rounded-lg flex items-center space-x-2 ${
                          downloadingFiles[item.compositionId]
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        } transition-colors`}
                      >
                        {downloadingFiles[item.compositionId] ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Downloading...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-5 h-5" />
                            <span>Download</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}