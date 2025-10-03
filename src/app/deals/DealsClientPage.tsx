'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Search } from 'lucide-react';
import { type Deal } from './page'; // Import the Deal type from our server page

// --- Enhanced Deal Card ---
const DealCard = ({ deal, index, onQuickView }: { deal: Deal; index: number; onQuickView: (deal: Deal) => void }) => {
  const business = deal.businesses[0] || { business_name: 'Local Business', address: '', logo_url: '/placeholder.svg' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.03, y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer border border-transparent hover:border-blue-500 group"
      role="button"
      onClick={() => onQuickView(deal)}
    >
      <div className="p-5">
        <div className="flex items-center mb-4">
          {business.logo_url && <Image src={business.logo_url} alt={`${business.business_name} logo`} width={48} height={48} className="rounded-full mr-4 object-cover border-2 border-gray-100" />}
          <div>
            <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{business.business_name}</h3>
            <div className="text-xs text-gray-500 flex items-center mt-1">
              <MapPin size={12} className="mr-1 flex-shrink-0" />
              <span>{business.address}</span>
            </div>
          </div>
        </div>
        <h2 className="text-lg font-bold mb-2 text-gray-900">{deal.title}</h2>
        <p className="text-gray-600 text-sm leading-relaxed h-10 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {deal.description}
        </p>
      </div>
      {deal.terms && (
        <div className="text-xs text-gray-500 italic px-5 py-3 border-t bg-gray-50/50">
          Terms: {deal.terms.length > 50 ? `${deal.terms.substring(0, 50)}...` : deal.terms}
        </div>
      )}
    </motion.div>
  );
};

// --- Quick View Modal ---
const QuickViewModal = ({ deal, isOpen, onClose }: { deal: Deal | null; isOpen: boolean; onClose: () => void }) => {
  if (!deal || !isOpen) return null;
  const business = deal.businesses[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} className="bg-white rounded-lg p-8 max-w-lg w-full m-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {business?.logo_url && <Image src={business.logo_url} alt={`${business.business_name} logo`} width={64} height={64} className="rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-md" />}
            <h2 className="text-3xl font-bold mb-2 text-gray-900 text-center">{deal.title}</h2>
            <p className="text-center text-gray-600 mb-6">Offered by <span className="font-semibold">{business?.business_name}</span></p>
            <p className="text-gray-700 mb-4">{deal.description}</p>
            {deal.terms && (
              <div className="text-sm text-gray-600 italic mb-6 p-4 bg-gray-100 rounded-md">
                <h4 className="font-semibold not-italic mb-1">Terms & Conditions</h4>
                {deal.terms}
              </div>
            )}
            <button className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg text-center font-semibold hover:bg-blue-700 transition-colors">
              Use This Deal
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Hero Carousel ---
const HeroCarousel = ({ featuredDeals, onQuickView }: { featuredDeals: Deal[]; onQuickView: (deal: Deal) => void; }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredDeals.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredDeals.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredDeals.length]);

  if (featuredDeals.length === 0) return null;

  const currentDeal = featuredDeals[currentIndex];

  return (
    <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-12 shadow-lg group cursor-pointer" onClick={() => onQuickView(currentDeal)}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {currentDeal.businesses[0]?.logo_url && <Image src={currentDeal.businesses[0].logo_url} alt="Featured Deal Background" layout="fill" objectFit="cover" className="group-hover:scale-105 transition-transform duration-500" />}
        </motion.div>
      </AnimatePresence>
      <div className="relative h-full flex flex-col items-center justify-end text-center text-white p-8">
        <h3 className="text-2xl md:text-4xl font-bold drop-shadow-lg">{currentDeal.title}</h3>
        <p className="text-lg mt-2 drop-shadow-md">from {currentDeal.businesses[0]?.business_name}</p>
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {featuredDeals.map((_, idx) => (
          <button key={idx} onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx);}} className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/50'}`} />
        ))}
      </div>
    </div>
  );
};


// --- The Main Client Component ---
export default function DealsClientPage({ initialDeals, initialFeatured }: { initialDeals: Deal[]; initialFeatured: Deal[]; }) {
  const [deals, setDeals] = useState(initialDeals);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const handleCategoryChange = (cat: string) => {
    if (!cat) {
      setDeals(initialDeals);
    } else {
      setDeals(initialDeals.filter((d) => d.category === cat));
    }
  };
  
  const handleSearchChange = (searchTerm: string) => {
    const lowercasedTerm = searchTerm.toLowerCase();
    if (!lowercasedTerm) {
      setDeals(initialDeals);
    } else {
      setDeals(initialDeals.filter(d => 
        d.title.toLowerCase().includes(lowercasedTerm) ||
        d.description.toLowerCase().includes(lowercasedTerm) ||
        d.businesses[0]?.business_name.toLowerCase().includes(lowercasedTerm)
      ));
    }
  };

  const uniqueCategories = [...new Set(initialDeals.map((d) => d.category).filter(Boolean))];

  return (
    <main className="bg-gray-100 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Exclusive Member Deals
          </h1>
          <p className="text-lg text-gray-600">Your year of savings in Western New York starts here.</p>
        </motion.div>

        <HeroCarousel featuredDeals={initialFeatured} onQuickView={setSelectedDeal} />

        <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                    type="text"
                    placeholder="Search deals or businesses..."
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={() => handleCategoryChange('')} className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-semibold">All</button>
                {uniqueCategories.map((cat) => (
                    <button key={cat} onClick={() => handleCategoryChange(cat)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 text-sm font-semibold transition-colors">
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        {deals.length > 0 ? (
          <div id="deals-grid">
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} initial="hidden" animate="visible">
              {deals.map((deal, index) => (
                <DealCard key={`${deal.title}-${index}`} deal={deal} index={index} onQuickView={setSelectedDeal} />
              ))}
            </motion.div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-12 bg-white rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Deals Match Your Search</h2>
            <p className="text-gray-500">Try a different category or search term.</p>
          </motion.div>
        )}
      </div>
      <QuickViewModal deal={selectedDeal} isOpen={!!selectedDeal} onClose={() => setSelectedDeal(null)} />
    </main>
  );
}