'use client'; // Switch to client for animations (keep data fetch server-side via props or RSC pattern)

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers'; // For initial server fetch
import Link from 'next/link';
import Image from 'next/image'; // Replace <img> for optimization
import { MapPin, Search, Filter } from 'lucide-react'; // Icons for wow

// --- Type Definitions (unchanged + geo) ---
type Deal = {
  title: string;
  description: string;
  terms: string | null;
  category: string;
  businesses: {
    business_name: string;
    logo_url: string | null;
    address: string;
    location?: { lat: number; lng: number }; // For geo
  }[];
};

// --- Enhanced Deal Card with Hover/Modal ---
const DealCard = ({ deal, index, onQuickView }: { deal: Deal; index: number; onQuickView: (deal: Deal) => void }) => {
  const business = deal.businesses[0] || { business_name: 'Local Business', address: '', logo_url: '/placeholder.svg' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }} // Staggered entrance
      whileHover={{ y: -5, scale: 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} // Lift on hover
      className="group bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
      onClick={() => onQuickView(deal)}
    >
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Image
          src={business.logo_url || '/placeholder.svg'}
          alt={`${business.business_name} logo`}
          fill
          className="object-contain p-4"
        />
        {/* Urgency Badge */}
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs"
        >
          New Deal!
        </motion.span>
      </div>
      <div className="p-6">
        <div className="flex items-center mb-3">
          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
          <p className="text-sm text-gray-500">{business.address}</p>
        </div>
        <h3 className="font-bold text-lg text-gray-900 mb-2">{business.business_name}</h3>
        <h2 className="text-xl font-semibold text-blue-600 mb-3">{deal.title}</h2>
        <p className="text-gray-600 text-sm line-clamp-2">{deal.description}</p>
      </div>
      {deal.terms && (
        <div className="bg-gray-50 p-4 border-t">
          <p className="text-xs text-gray-500 italic">Terms: {deal.terms}</p>
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{deal.title}</h2>
              <p className="text-gray-700 mb-4">{deal.description}</p>
              {deal.terms && <p className="text-sm text-gray-500 italic mb-6">Terms: {deal.terms}</p>}
              <Link
                href="/campaigns" // Tie to user's campaign
                className="w-full bg-green-600 text-white py-3 rounded-lg text-center block hover:bg-green-700"
              >
                Add to My Campaign
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Hero Carousel (Spotlight Deals) ---
const HeroCarousel = ({ featuredDeals }: { featuredDeals: Deal[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCurrentIndex((prev) => (prev + 1) % featuredDeals.length), 5000);
    return () => clearInterval(interval);
  }, [featuredDeals.length]);

  return (
    <div className="relative h-96 rounded-xl overflow-hidden mb-8">
      <Image
        src="/images/hero-bg.jpg" // Add your WNY bg
        alt="WNY Savings"
        fill
        className="object-cover"
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center text-white text-center p-8"
        >
          <div>
            <h1 className="text-4xl font-bold mb-4">{featuredDeals[currentIndex]?.title}</h1>
            <p className="text-xl mb-6">{featuredDeals[currentIndex]?.description}</p>
            <button onClick={() => {}} className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold">
              Explore All
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// --- Filters (Category + Geo) ---
const Filters = ({ onCategoryChange, onGeoFilter, categories }: { onCategoryChange: (cat: string) => void; onGeoFilter: () => void; categories: string[] }) => (
  <div className="flex flex-wrap gap-4 mb-8 justify-center">
    <button className="flex items-center px-4 py-2 bg-blue-100 rounded-full hover:bg-blue-200">
      <Search className="w-4 h-4 mr-2" /> Search Deals
    </button>
    <button onClick={onGeoFilter} className="flex items-center px-4 py-2 bg-green-100 rounded-full hover:bg-green-200">
      <MapPin className="w-4 h-4 mr-2" /> Near Me
    </button>
    {categories.map((cat) => (
      <button key={cat} onClick={() => onCategoryChange(cat)} className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300">
        {cat}
      </button>
    ))}
  </div>
);

// --- Main Page (Client-Side for Interactivity) ---
export default function DealsPage({ initialDeals, initialIsMember, initialFeatured }: { initialDeals: Deal[]; initialIsMember: boolean; initialFeatured: Deal[] }) {
  const [deals, setDeals] = useState(initialDeals);
  const [isMember, setIsMember] = useState(initialIsMember);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [progress, setProgress] = useState(0); // For gamification
  const supabase = createClientComponentClient();

  // Geo Filter Example (with PostGIS)
  const handleGeoFilter = async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { data } = await supabase
        .from('deals')
        .select('*')
        .eq('is_active', true)
        .eq('approval_status', 'approved')
        .filter('businesses.location', 'st_dwithin', `POINT(${position.coords.longitude} ${position.coords.latitude}), 10000`); // 10km radius<grok-card data-id="c63cb5" data-type="citation_card"></grok-card>
      setDeals(data as Deal[]);
    });
  };

  const handleCategoryChange = (cat: string) => {
    setCategoryFilter(cat);
    // Filter client-side or refetch
    setDeals(initialDeals.filter((d) => !cat || d.category === cat));
  };

  // Gamify: Increment progress on view
  useEffect(() => {
    setProgress(Math.min(100, progress + 20)); // e.g., +20 per interaction
  }, [deals]);

  if (!isMember) {
    return (
      <main className="bg-gray-50 min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold mb-4">Members-Only Deals Await!</h1>
          <p className="text-gray-600 mb-8">Unlock WNY savings by joining a fundraiser.</p>
          <Link href="/login" className="px-8 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700">
            Get Started
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your WNY Deal Wonderland
          </h1>
          <p className="text-lg text-gray-600 mt-2">Discover savings that fuel fun fundraisers.</p>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <motion.div
              className="bg-green-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">Deal Hunt Progress: {progress}% – Keep exploring!</p>
        </div>

        <HeroCarousel featuredDeals={initialFeatured.slice(0, 3)} />

        <Filters
          onCategoryChange={handleCategoryChange}
          onGeoFilter={handleGeoFilter}
          categories={['Food', 'Retail', 'Services']} // Derive from data
        />

        {deals.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {deals.map((deal, index) => (
              <DealCard key={deal.title + index} deal={deal} index={index} onQuickView={setSelectedDeal} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center p-12 bg-white rounded-xl shadow-md">
            <h2 className="text-xl font-semibold">No Deals Match Yet</h2>
            <p className="text-gray-500 mt-2">Try another filter!</p>
          </div>
        )}
      </div>
      <QuickViewModal deal={selectedDeal} isOpen={!!selectedDeal} onClose={() => setSelectedDeal(null)} />
    </main>
  );
}

// --- Server-Side Data Fetch (New RSC Wrapper) ---
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

  const { data: dealData } = await supabase
    .from('deals')
    .select(`
      title, description, terms, category,
      businesses!business_id (business_name, logo_url, address, location)
    `)
    .eq('is_active', true)
    .eq('approval_status', 'approved')
    .order('created_at', { ascending: false });

  const deals = dealData as Deal[] || [];
  return { deals, isMember: true, featured: deals }; // Or slice for featured
}

// --- Export Wrapper (RSC Pattern) ---
export default async function DealsPageWrapper() {
  const { deals, isMember, featured } = await getServerDeals();
  return <DealsPage initialDeals={deals} initialIsMember={isMember} initialFeatured={featured} />;
}