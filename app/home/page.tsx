"use client";

import React, { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Pricing from '../components/PricingSection';
import { ArrowRight, Play, Pause, ChevronDown, ChevronUp, Star, Music, Users, DollarSign } from 'lucide-react';

const Home: React.FC = () => {
  const { data: session, status } = useSession();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const features = [
    { title: 'Beat Marketplace', icon: Music, description: 'Upload, sell, and buy high-quality beats from producers worldwide.' },
    { title: 'One platform for maximum reach', icon: Users, description: 'Publish your beats on our marketplace and seamlessly share them directly to youtube in one simple step.' },
    { title: 'Zero Platform Fees', icon: DollarSign, description: 'Keep 100% of your earnings: easily track your revenue and manage royalties from your beats with no additional fees.' },
  ];

  const testimonials = [
    { name: 'Alex P.', role: 'Hip-Hop Producer', quote: 'This platform has helped me find tracks that fit perfectly with my style. The quality of the productions is impressive!' },
    { name: 'Sarah M.', role: 'R&B Artist', quote: 'The compositions are original and diverse. It’s great to have so many options to inspire my music!' },
    { name: 'Chris D.', role: 'EDM Producer', quote: 'I love discovering new sounds here. The creativity from other producers is next level and really pushes my own work!' },
];

const faqItems = [
  { 
      question: "How do I start selling my beats?", 
      answer: "Create an account, choose between the Free or Pro plan, upload your beats, and set your prices. It's quick and easy to get started!" 
  },
  { 
      question: "What are the benefits of the Pro plan?", 
      answer: "The Pro plan offers unlimited beat uploads, advanced analytics, 0% platform fees on sales, priority support, and the ability to post directly to YouTube for maximum exposure." 
  },
  { 
      question: "Do I keep 100% of my earnings?", 
      answer: "With the Pro plan, you keep 100% of your sales. For the Free plan, there is a 20% platform fee on each sale." 
  },
  { 
      question: "Can I publish my beats on YouTube?", 
      answer: "Yes! The Pro plan lets you post directly to YouTube from our platform, helping you reach a larger audience effortlessly." 
  },
  { 
      question: "How does collaboration work on the platform?", 
      answer: "You can connect with other producers and artists for potential collaborations. Our tools make it easy to share and create together." 
  },
  { 
      question: "What analytics are available?", 
      answer: "Free users have access to basic analytics, while Pro users get advanced insights, helping them track performance and optimize their sales strategy." 
  },
  { 
      question: "Is customer support available?", 
      answer: "Yes, all users have access to support, but Pro users receive priority support to ensure faster assistance." 
  },
];


  return (
    <div className="body-font bg-gray-900 text-white">
      <div className="relative w-full min-h-screen flex items-center">
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4/5 h-full bg-cover bg-center rounded-full"          
          style={{
            backgroundImage: `url('/image.jpg')`,
            filter: 'blur(100px)',
            zIndex: -1,
          }}
        ></div>
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="flex flex-col w-full mb-2 text-left md:text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tighter lg:text-7xl md:text-6xl">
              <span className="text-emerald-400">Sell/Buy </span>
              <br className="hidden lg:block" />
              Beats Online
            </h1>
            <p className="mx-auto mt-4 text-xl font-normal leading-relaxed text-gray-300 lg:w-2/3">
              Revolutionize your music career. Create, collaborate, and monetize your beats like never before.
            </p>
          </div>
          <div className="flex justify-center mt-12 space-x-4">
            <a
              className="rounded-full inline-flex items-center py-3 px-8 font-semibold text-black transition duration-300 ease-in-out transform bg-white hover:bg-emerald-600 hover:text-white hover:scale-105"
              href="/register"
            >
              Start Selling
            </a>
            <a
              className="rounded-full inline-flex items-center py-3 px-8 font-semibold text-white transition duration-300 ease-in-out transform bg-emerald-500 hover:bg-emerald-600 hover:scale-105"
              href="/tracks"
            >
              Explore Beats
            </a>
          </div>
        </div>
      </div>

      <div className="py-24 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-emerald-400">Why Choose On The Track ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
                <feature.icon className="w-12 h-12 text-emerald-400 mb-4" />
                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Pricing />

      <div className="py-24 bg-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-emerald-400">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-emerald-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-24 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8 text-emerald-400">Join Our Thriving Community</h2>
          <p className="text-lg font-light leading-relaxed text-gray-300 lg:w-2/3 mx-auto mb-8">
            Connect with fellow producers, share your beats, and grow together in our vibrant community.
            Get feedback, collaborate on projects, and stay inspired.
          </p>
          <a 
            href="/community"
            className="inline-flex items-center py-3 px-8 font-semibold text-white rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors duration-300"
          >
            Join the Community
            <ArrowRight className="ml-2" />
          </a>
        </div>
      </div>

      <section className="bg-gray-800 py-24">
  <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
    <div>
      <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-emerald-400">
        Maximize Your Reach with Multi-Platform Posting
      </h2>
      <p className="mb-8 text-lg text-gray-300">
        Learn how to effortlessly share your beats on both On The Track and YouTube simultaneously, expanding your audience and boosting your visibility. Watch the video below for a quick tutorial on how to get started!
      </p>
      <div className="space-y-4">
        {['One-Click Multi-Platform Posting', 'Synchronize Your Content', 'Reach Wider Audiences'].map((topic, index) => (
          <div key={index} className="flex items-center">
            <div className="bg-emerald-500 rounded-full p-2 mr-4">
              <Play className="w-4 h-4 text-white" />
            </div>
            <span className="text-white">{topic}</span>
          </div>
        ))}
      </div>
      <a href="/register" className="inline-flex items-center mt-8 py-3 px-5 text-base font-medium text-center text-white rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors duration-300">
        Get Started
        <ArrowRight className="w-4 h-4 ml-2" />
      </a>
    </div>
    <div className="relative rounded-lg overflow-hidden shadow-xl">
      <video
        ref={videoRef}
        src="/3d.mp4"
        className="w-full h-full object-cover"
        playsInline
        loop
        muted
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <button 
          onClick={togglePlay}
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-4 transition-colors duration-300"
        >
          {isPlaying ? <Pause size={32} /> : <Play size={32} />}
        </button>
      </div>
    </div>
  </div>
</section>



      <section className="bg-gray-900 py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-emerald-400">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-gray-800 rounded-lg overflow-hidden">
                <button
                  className="flex justify-between items-center w-full p-4 text-left"
                  onClick={() => setActiveTab(activeTab === index ? -1 : index)}
                >
                  <span className="font-semibold text-white">{item.question}</span>
                  {activeTab === index ? <ChevronUp className="text-emerald-400" /> : <ChevronDown className="text-emerald-400" />}
                </button>
                {activeTab === index && (
                  <div className="p-4 bg-gray-700">
                    <p className="text-gray-300">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-emerald-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 text-white">Join On The Track today and take your music career to the next level.</p>
          <a
            href="/register"
            className="inline-flex items-center py-3 px-8 font-semibold text-emerald-600 bg-white rounded-full hover:bg-gray-100 transition-colors duration-300"
          >
            Get Started Now
            <ArrowRight className="ml-2" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;