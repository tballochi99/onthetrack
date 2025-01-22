"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2, Home, Clock, Download, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface License {
  licenseId: string;
  licenseName: string;
  licensePrice: number;
}

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

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [downloadingFiles, setDownloadingFiles] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const verifyPaymentAndLoadHistory = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        if (sessionId) {
          const verifyResponse = await fetch('/api/purchase/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
          });

          if (!verifyResponse.ok) {
            throw new Error('Payment verification failed');
          }
        }

        const historyResponse = await fetch('/api/purchase/get-history');
        if (!historyResponse.ok) {
          throw new Error('Failed to load purchase history');
        }

        const data = await historyResponse.json();
        setPurchases(data.purchases || []);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    verifyPaymentAndLoadHistory();
  }, [searchParams]);

 const handleDownload = async (compositionId: string, title: string) => {
  try {
    setDownloadingFiles(prev => ({ ...prev, [compositionId]: true }));
    
    const compositionResponse = await fetch(`/api/compositions/${compositionId}`);
    if (!compositionResponse.ok) {
      throw new Error('Failed to fetch composition details');
    }
    
    const compositionData = await compositionResponse.json();
    const file = compositionData.data.file;
    
    if (!file) {
      throw new Error('No file available for this composition');
    }

    
    const response = await fetch(`/api/purchase/download/${encodeURIComponent(file)}`, {
      method: 'GET',
      headers: {
        'Accept': 'audio/mpeg',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Download failed: ${response.status} - ${errorText}`);
    }

    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error('Downloaded file is empty');
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.mp3`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

  } catch (error) {
    console.error('Download error:', error);
    alert('Failed to download the file. Please try again.');
  } finally {
    setDownloadingFiles(prev => ({ ...prev, [compositionId]: false }));
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center max-w-md w-full">
          <Loader2 className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold text-white mb-4">Processing your purchase...</h1>
          <p className="text-gray-300">Please wait while we verify your payment.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl mb-8">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white text-center mb-4">
            Payment Successful!
          </h1>
          <p className="text-gray-300 text-center mb-6">
            Thank you for your purchase! Your tracks are now available for download.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Return Home
          </button>
        </div>

        <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-emerald-400" />
            Purchase History
          </h2>
          
          {purchases.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No purchases found.</p>
          ) : (
            <div className="space-y-6">
              {purchases.map((purchase) => (
                <div key={purchase._id} className="space-y-4">
                  <div className="text-sm text-gray-400 border-b border-gray-700 pb-2">
                    Purchase Date: {new Date(purchase.createdAt).toLocaleDateString()} - Total: ${purchase.totalAmount.toFixed(2)}
                  </div>
                  
                  {purchase.items.map((item) => (
                    <div
                      key={item.compositionId}
                      className="bg-gray-750 p-4 rounded-lg border border-gray-700 hover:border-emerald-500 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={item.coverImage}
                            alt={item.title}
                            fill
                            className="rounded-md object-cover"
                          />
                        </div>
                        
                        <div className="flex-grow">
                          <h3 className="text-white font-medium">{item.title}</h3>
                          <p className="text-gray-400 text-sm">{item.artist}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-emerald-400 text-sm">
                              {item.licenseName}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400 text-sm">
                              ${item.licensePrice.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            console.log("File info:", {
                              id: item.compositionId,
                              file: item.file,
                              title: item.title
                            });
                            handleDownload(
                              item.compositionId,
                              item.file || '',
                              item.title
                            );
                          }}
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
                          ) : !item.file ? (
                            <>
                              <AlertCircle className="w-5 h-5" />
                              <span>No file</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-5 h-5" />
                              <span>Download</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}