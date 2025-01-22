"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SubscriptionSuccess() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setMessage('Session ID not found');
      return;
    }

    const verifySubscription = async () => {
      try {
        const response = await fetch('/api/subscription/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('Your subscription has been activated successfully!');
          setTimeout(() => {
            router.push('/');
          }, 3000);
        } else {
          throw new Error(data.error || 'Failed to verify subscription');
        }
      } catch (error) {
        console.error('Error:', error);
        setStatus('error');
        setMessage('Failed to verify subscription. Please contact support.');
      }
    };

    verifySubscription();
  }, [sessionId, router]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <h2 className="text-2xl font-bold text-white mb-4">Processing your subscription...</h2>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500 mx-auto"></div>
          </>
        )}
        
        {status === 'success' && (
          <>
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">Subscription Activated!</h2>
            <p className="text-gray-300">{message}</p>
            <p className="text-gray-400 mt-4">Redirecting to home...</p>
            <div className="mt-8">
              <svg
                className="w-16 h-16 mx-auto text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </>
        )}
        
        {status === 'error' && (
          <>
            <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
            <p className="text-gray-300">{message}</p>
            <button
              onClick={() => router.push('/home')}
              className="mt-6 px-6 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors"
            >
              Return to Pricing
            </button>
          </>
        )}
      </div>
    </div>
  );
}

