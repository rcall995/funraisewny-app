'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Search, Star } from 'lucide-react';
import { type Deal } from './page';
import useUser from '@/hooks/useUser'; // NEW: Import useUser to get member's name

// --- DealCard component is unchanged ---
const DealCard = ({ deal, index, onQuickView }: { deal: Deal; index: number; onQuickView: (deal: Deal) => void }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }} whileHover={{ scale: 1.03, y: -5 }} className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer border border-transparent hover:border-blue-500 group" role="button" onClick={() => onQuickView(deal)}>
        {/* ... content of DealCard ... */}
    </motion.div>
);


// --- NEW: Redemption Screen Component ---
const RedemptionScreen = ({ deal, userName }: { deal: Deal; userName: string }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="p-4 sm:p-8 text-center bg-gray-50">
            <div className="border-4 border-blue-600 rounded-lg p-6 relative animate-pulse-slow">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    <Star className="inline-block w-4 h-4 mr-1" /> VALID
                </div>
                <h3 className="text-gray-600 text-sm mt-4">MEMBER</h3>
                <p className="text-2xl font-bold text-gray-900">{userName}</p>
                
                <div className="my-6 py-6 border-y-2 border-dashed border-gray-300">
                    <h2 className="text-3xl font-extrabold text-blue-700">{deal.title}</h2>
                    <p className="text-md text-gray-700 mt-2">at <span className="font-semibold">{deal.business_name}</span></p>
                </div>
                
                <p className="text-gray-500 text-xs">Redeemed On</p>
                <p className="font-semibold text-gray-800 text-lg">{currentTime.toLocaleDateString()}</p>
                <p className="font-mono text-gray-800 text-2xl tracking-wider">{currentTime.toLocaleTimeString()}</p>
            </div>
        </div>
    );
};


// --- UPDATED: Quick View Modal ---
const QuickViewModal = ({ deal, isOpen, onClose, user }: { deal: Deal | null; isOpen: boolean; onClose: () => void; user: any }) => {
  const [isRedeeming, setIsRedeeming] = useState(false);

  // When the modal is closed, always reset the redeeming state
  const handleClose = () => {
    setIsRedeeming(false);
    onClose();
  };

  if (!deal || !isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={handleClose}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} className="bg-white rounded-lg max-w-lg w-full m-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <AnimatePresence mode="wait">
              <motion.div key={isRedeeming ? 'redeem' : 'details'} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                {isRedeeming ? (
                  <RedemptionScreen deal={deal} userName={user?.user_metadata?.full_name || 'Valued Member'} />
                ) : (
                  <div className="p-8">
                    {deal.logo_url && <Image src={deal.logo_url} alt={`${deal.business_name} logo`} width={64} height={64} className="rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-md" />}
                    <h2 className="text-3xl font-bold mb-2 text-gray-900 text-center">{deal.title}</h2>
                    <p className="text-center text-gray-600 mb-6">Offered by <span className="font-semibold">{deal.business_name}</span></p>
                    <p className="text-gray-700 mb-4">{deal.description}</p>
                    {deal.terms && ( <div className="text-sm text-gray-600 italic mb-6 p-4 bg-gray-100 rounded-md"> <h4 className="font-semibold not-italic mb-1">Terms & Conditions</h4> {deal.terms} </div> )}
                    <button onClick={() => setIsRedeeming(true)} className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg text-center font-semibold hover:bg-blue-700 transition-colors">
                      Use This Deal
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


// --- The Main Client Component ---
export default function DealsClientPage({ initialDeals, initialFeatured }: { initialDeals: Deal[]; initialFeatured: Deal[]; }) {
  const [deals, setDeals] = useState(initialDeals);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const { user } = useUser(); // NEW: Get the current user

  const handleCategoryChange = (cat: string) => { if (!cat) { setDeals(initialDeals); } else { setDeals(initialDeals.filter((d) => d.category === cat)); } };
  const handleSearchChange = (searchTerm: string) => { const lowercasedTerm = searchTerm.toLowerCase(); if (!lowercasedTerm) { setDeals(initialDeals); } else { setDeals(initialDeals.filter(d => d.title.toLowerCase().includes(lowercasedTerm) || d.description.toLowerCase().includes(lowercasedTerm) || d.business_name?.toLowerCase().includes(lowercasedTerm) )); } };
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
        
        {/* ... Filter and Search UI ... */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Search deals or businesses..." onChange={(e) => handleSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={() => handleCategoryChange('')} className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-semibold">All</button>
                {uniqueCategories.map((cat) => ( <button key={cat} onClick={() => handleCategoryChange(cat)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 text-sm font-semibold transition-colors"> {cat} </button> ))}
            </div>
        </div>

        {deals.length > 0 ? (
          <div id="deals-grid">
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal, index) => ( <DealCard key={`${deal.title}-${index}`} deal={deal} index={index} onQuickView={setSelectedDeal} /> ))}
            </motion.div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-12 bg-white rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Deals Match Your Search</h2>
            <p className="text-gray-500">Try a different category or search term.</p>
          </motion.div>
        )}
      </div>
      <QuickViewModal deal={selectedDeal} isOpen={!!selectedDeal} onClose={() => setSelectedDeal(null)} user={user} />
    </main>
  );
}