import React from 'react';
import { BarChart2, Users, TrendingUp, LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface FeatureItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon: Icon, title, description }) => (
  <div className="flex items-start mb-8">
    <div className="flex-shrink-0 mr-4">
      <div className="p-3 bg-emerald-500 rounded-full">
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <div>
      <h3 className="text-xl font-semibold text-emerald-400 mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  </div>
);

const FeatureCards: React.FC = () => {
  return (
    <section className="bg-gray-900 py-20 w-full">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 lg:pr-16 mb-10 lg:mb-0">
            <div className="flex items-center mb-4">
              <h2 className="text-3xl font-bold text-emerald-500 mr-4">YOUR PLATFORM</h2>
              <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded">NEW</span>
            </div>
            <h3 className="text-4xl font-bold text-white mb-8">Your music business in one place</h3>
            <FeatureItem
              icon={BarChart2}
              title="Manage your business"
              description="Upload your beats, communicate with your clients, and manage your beat store, all in a streamlined workflow."
            />
            <FeatureItem
              icon={TrendingUp}
              title="Track your performance"
              description="Get comprehensive analytics that give you insights into your beats' performance, to make informed decisions and optimize your sales."
            />
            <FeatureItem
              icon={Users}
              title="Grow your audience"
              description="Use a powerful suite of marketing tools and integrations to monetize and attract more customers."
            />
            <Link href="/home" passHref>
              <button className="mt-8 bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
                Learn more
              </button>
            </Link>
          </div>
          <div className="lg:w-1/2">
            <img
              src="/image.jpg"
              alt="Platform Dashboard"
              className="rounded-lg shadow-2xl w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;