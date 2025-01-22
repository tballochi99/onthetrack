"use client";
import React, { useState, useEffect } from 'react';
import { Check, X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { useSession } from 'next-auth/react';

interface Feature {
  text: string;
  included: boolean;
}

interface Plan {
  title: string;
  price: number;
  features: Feature[];
  isPopular: boolean;
}

interface SubscriptionStatus {
  role: 'free' | 'pro';
  subscriptionStatus: 'none' | 'active' | 'cancelled';
  subscriptionId?: string;
}

interface PricingCardProps {
  title: string;
  price: number;
  features: Feature[];
  isPopular: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ title, price, features, isPopular }) => {
  const [loading, setLoading] = useState(false);
  const [userSubscription, setUserSubscription] = useState<SubscriptionStatus | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/subscription/status');
          const data = await response.json();
          setUserSubscription(data.subscription);
        } catch (error) {
          console.error('Error fetching subscription status:', error);
        }
      }
    };

    fetchSubscriptionStatus();
  }, [session]);

  const isProUser = userSubscription?.role === 'pro' && userSubscription?.subscriptionStatus === 'active';
  const isCurrentPlan = (title === 'Free' && !isProUser) || (title === 'Pro' && isProUser);

  const handleSubscription = async () => {
    try {
      if (!session) {
        router.push('/login');
        return;
      }

      if (title === "Free") {
        if (!isProUser) {
          router.push('/');
        } else {
          if (confirm('Voulez-vous annuler votre abonnement Pro et revenir au plan gratuit ?')) {
            await fetch('/api/subscription/cancel', {
              method: 'POST'
            });
            router.push('/home');
          }
        }
        return;
      }

      if (title === "Pro" && isProUser) {
        alert('Vous avez déjà un abonnement Pro actif');
        return;
      }

      setLoading(true);
      
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return 'Loading...';
    if (isCurrentPlan) return 'Current Plan';
    if (title === 'Free') return 'Switch to Free';
    if (isProUser) return 'Already Subscribed';
    return `Subscribe for $${price}`;    
  };

  return (
    <div className={`w-full max-w-sm p-8 ${isPopular ? 'bg-emerald-900' : 'bg-gray-800'} text-center rounded-3xl shadow-xl transition-transform hover:scale-105`}>
    
      <h2 className={`text-2xl font-bold ${isPopular ? 'text-emerald-400' : 'text-white'}`}>
        {title}
      </h2>
      
      <p className="mt-4 text-4xl font-bold text-white">
        ${price}<span className="text-lg font-normal text-gray-400">/month</span>
      </p>

      <ul className="mt-8 space-y-4 text-left">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            {feature.included ? (
              <Check className="w-5 h-5 text-emerald-400 mr-2" />
            ) : (
              <X className="w-5 h-5 text-red-400 mr-2" />
            )}
            <span className={`${feature.included ? 'text-gray-300' : 'text-gray-500'}`}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleSubscription}
        disabled={loading || (isProUser && title === 'Pro')}
        className={`
          w-full py-3 mt-8 rounded-full font-semibold 
          text-white transition-colors duration-300 
          flex items-center justify-center
          ${isPopular 
            ? 'bg-emerald-500 hover:bg-emerald-600' 
            : 'bg-gray-700 hover:bg-gray-600'
          }
          ${(loading || (isProUser && title === 'Pro')) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          ${isCurrentPlan ? 'bg-gray-600 cursor-default' : ''}
        `}
      >
        {getButtonText()}
        {!loading && !isCurrentPlan && <ArrowRight className="inline ml-2 w-4 h-4" />}
      </button>
    </div>
  );
};

const Pricing: React.FC = () => {
  const plans: Plan[] = [
    {
      title: "Free",
      price: 0,
      features: [
        { text: "Upload up to 5 beats per month", included: true },
        { text: "Basic analytics", included: true },
        { text: "Sell beats with 0% platform fee", included: false },
        { text: "Priority support", included: false },
        { text: "Possibility of multi-posting on youtube", included: false },
      ],
      isPopular: false,
    },
    {
      title: "Pro",
      price: 9.99,
      features: [
        { text: "Unlimited beat uploads", included: true },
        { text: "Advanced analytics and insights", included: true },
        { text: "Sell beats with 0% platform fee", included: true },
        { text: "Priority support", included: true },
        { text: "Possibility of multi-posting on youtube", included: true },
      ],
      isPopular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center px-4 py-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-4">
          <span className="text-emerald-400">Flexible </span>
          Plans for Every Producer
        </h1>
        <p className="text-xl text-gray-400">
          Choose the plan that fits your needs and start selling your beats today.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:gap-12">
        {plans.map((plan, index) => (
          <PricingCard key={index} {...plan} />
        ))}
      </div>
    </div>
  );
};

export default Pricing;