'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Search } from 'lucide-react';

// --- Type Definitions ---
type Deal = {
  title: string;
  description: string;
  terms: string | null;
  category: string;
  businesses: {
    business_name: string;
    logo_url: string | null;
    address: string;
  }[];
};

// --- Enhanced Deal Card ---
const DealCard = ({ deal, index, onQuickView }: { deal: Deal; index: number; onQuickView: (deal: Deal) => void }) => {
  const business = deal.businesses[0] || { business_name: 'Local Business', address: '', logo_url: '/placeholder.svg' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
      className="bg-white rounded-lg shadow-md p-4 mb-4 cursor-pointer border hover:border-blue-200"
      role="button"
      onClick={() => onQuickView(deal)}
    >
      <div className="flex items-center mb-2">
        {business.logo_url ? (
          <Image
            src={business.logo_url}
            alt={`${business.business_name} logo`}
            width={40}
            height={40}
            className="rounded-full mr-2 object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-200 rounded-full mr-2 flex items-center justify-center">
            <span className="text-gray-500 text-xs">Logo</span>
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900">{business.business_name}</h3>
          {index === 0 && <span className="text-sm text-green-500">New Deal!</span>}
          <div className="text-sm text-gray-500 flex items-center">
            <MapPin size={14} className="mr-1" />
            {business.address}
          </div>
        </div>
      </div>
      <h2 className="text-xl font-bold mb-2 text-blue-600">{deal.title}</h2>
      <p className="text-gray-700 mb-2 text-sm leading-relaxed overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {deal.description}
      </p>
      {deal.terms && (
        <div className="text-sm text-gray-500 italic pt-2 border-t border-gray-100">
          Terms: {deal.terms}
        </div>
      )}
    </motion.div>
  );
};

// --- Quick View Modal ---
const QuickViewModal = ({ deal, isOpen, onClose }: { deal: Deal | null; isOpen: boolean; onClose: () => void }) => {
  if (!deal || !isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white rounded-lg p-6 max-w-md w-full m-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900">{deal.title}</h2>
            <p className="text-gray-700 mb-4">{deal.description}</p>
            {deal.terms && (
              <div className="text-sm text-gray-500 italic mb-6 p-2 bg-gray-50 rounded">
                Terms: {deal.terms}
              </div>
            )}
            <Link
              href="/campaigns"
              className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg text-center font-semibold hover:bg-green-700 transition-colors"
            >
              Add to My Campaign
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Hero Carousel ---
const HeroCarousel = ({ featuredDeals }: { featuredDeals: Deal[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredDeals.length);
    }, 3000); // 3-second rotation
    return () => clearInterval(interval);
  }, [featuredDeals.length]);

  if (featuredDeals.length === 0) return null;

  return (
    <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-8 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="relative h-full flex flex-col items-center justify-center text-center text-white p-6"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-3">{featuredDeals[currentIndex]?.title}</h3>
          <p className="text-lg mb-6 max-w-md">{featuredDeals[currentIndex]?.description}</p>
          <Link
            href="#deals-grid"
            className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Explore More
          </Link>
        </motion.div>
      </AnimatePresence>
      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {featuredDeals.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-3 h-3 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

// --- Filters ---
const Filters = ({
  onCategoryChange,
  onGeoFilter,
  categories
}: {
  onCategoryChange: (cat: string) => void;
  onGeoFilter: () => void;
  categories: string[];
}) => (
  <div className="flex flex-wrap gap-3 mb-8 justify-center items-center">
    <button className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors">
      <Search className="w-4 h-4 mr-2" /> Search Deals
    </button>
    <button
      onClick={onGeoFilter}
      className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
    >
      <MapPin className="w-4 h-4 mr-2" /> Near Me
    </button>
    {categories.map((cat) => (
      <button
        key={cat}
        onClick={() => onCategoryChange(cat)}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
      >
        {cat}
      </button>
    ))}
  </div>
);

// --- Main Client Component ---
export default function DealsPage({
  initialDeals,
  initialIsMember,
  initialFeatured
}: {
  initialDeals: Deal[];
  initialIsMember: boolean;
  initialFeatured: Deal[];
}) {
  const [deals, setDeals] = useState(initialDeals);
  const [isMember] = useState(initialIsMember);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [progress, setProgress] = useState(0);
  const supabase = createClientComponentClient();

  // Geo Filter (Fallback to all if no PostGIS)
  const handleGeoFilter = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported in your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Assuming RPC setup; fallback to random shuffle for demo
          const { data } = await supabase
            .rpc('nearby_deals', {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              radius: 10000,
            })
            .catch(() => ({ data: initialDeals })); // Graceful fallback
          setDeals(data || initialDeals);
          setProgress((prev) => Math.min(100, prev + 20));
        } catch (error) {
          console.error('Geo filter error:', error);
          // Shuffle for "nearby" feel
          setDeals(initialDeals.sort(() => Math.random() - 0.5));
        }
      },
      () => alert('Please allow location access for nearby deals.')
    );
  };

  const handleCategoryChange = (cat: string) => {
    setCategoryFilter(cat);
    if (!cat) {
      setDeals(initialDeals);
    } else {
      setDeals(initialDeals.filter((d) => d.category === cat));
    }
    setProgress((prev) => Math.min(100, prev + 10));
  };

  useEffect(() => {
    if (deals.length > 0) {
      setProgress((prev) => Math.min(100, prev + 5)); // Incremental on load
    }
  }, [deals.length]);

  if (!isMember) {
    return (
      <main className="bg-gray-50 min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="container mx-auto max-w-2xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold mb-4 text-gray-900"
          >
            Members-Only Deals Await!
          </motion.h1>
          <p className="text-gray-600 mb-8">Unlock exclusive WNY savings by supporting a fundraiser.</p>
          <Link
            href="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
          >
            Login or Sign Up
          </Link>
        </div>
      </main>
    );
  }

  const uniqueCategories = [...new Set(initialDeals.map((d) => d.category).filter(Boolean))];

  return (
    <main className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Your WNY Deal Wonderland
          </h1>
          <p className="text-lg text-gray-600 mb-4">Discover savings that fuel fun fundraisers.</p>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-sm text-gray-500">Deal Hunt Progress: {Math.round(progress)}% – Explore to unlock tips!</p>
        </motion.div>

        {initialFeatured.length > 0 && <HeroCarousel featuredDeals={initialFeatured} />}

        <Filters
          onCategoryChange={handleCategoryChange}
          onGeoFilter={handleGeoFilter}
          categories={uniqueCategories}
        />

        {deals.length > 0 ? (
          <div id="deals-grid">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
              viewport={{ once: true }}
            >
              {deals.map((deal, index) => (
                <DealCard key={`${deal.title}-${index}`} deal={deal} index={index} onQuickView={setSelectedDeal} />
              ))}
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-12 bg-white rounded-xl shadow-md"
          >
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Deals Match Your Filters Yet</h2>
            <p className="text-gray-500">Try adjusting your search or check back soon!</p>
          </motion.div>
        )}
      </div>
      <QuickViewModal deal={selectedDeal} isOpen={!!selectedDeal} onClose={() => setSelectedDeal(null)} />
    </main>
  );
}

// --- Server-Side Data Fetch (RSC Wrapper) ---
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function getServerDeals() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return { deals: [], isMember: false, featured: [] };

  const { data: membership } = await supabase
    .from('memberships')
    .select('id')
    .eq('user_id', session.user.id)
    .gte('expires_at', new Date().toISOString())
    .limit(1)
    .single();

  if (!membership) return { deals: [], isMember: false, featured: [] };

  const { data: dealData, error } = await supabase
    .from('deals')
    .select(`
      title, description, terms, category,
      businesses!business_id (
        business_name, logo_url, address
      )
    `)
    .eq('is_active', true)
    .eq('approval_status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching deals:', error);
    return { deals: [], isMember: true, featured: [] };
  }

  const deals = dealData as Deal[] || [];
  return { deals, isMember: true, featured: deals.slice(0, 5) }; // Top 5 for featured
}

export default async function DealsPageWrapper() {
  const { deals, isMember, featured } = await getServerDeals();
  return <DealsPage initialDeals={deals} initialIsMember={isMember} initialFeatured={featured} />;
}