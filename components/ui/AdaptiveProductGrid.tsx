'use client';

import { useEffect, useState } from 'react';
import { CompactProduct } from '@/lib/network/codec';

export default function AdaptiveProductGrid({ initialProducts }: { initialProducts: CompactProduct[] }) {
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);

  useEffect(() => {
    const conn = (navigator as any).connection;
    if (conn) {
      const checkNetwork = () => {
        // Flag true if the network matches 2g profiles
        setIsLowBandwidth(conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g' || conn.saveData);
      };
      conn.addEventListener('change', checkNetwork);
      checkNetwork();
      return () => conn.removeEventListener('change', checkNetwork);
    }
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {initialProducts.map(product => (
        <div key={product.id} className="p-4 border border-brand-light-gray bg-white rounded-2xl flex flex-col justify-between hover:shadow-lg transition-shadow">
          {/* Completely skip rendering media tags over heavy 2G lines */}
          {!isLowBandwidth ? (
            <div className="w-full h-40 bg-gray-100 animate-pulse rounded-xl mb-3 flex items-center justify-center text-gray-400 text-xs">
              [Image Placeholder]
            </div>
          ) : (
            <div className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md self-start mb-3 border border-amber-200">
              ⚡ Data-Saver Text Mode Active
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-semibold text-brand-charcoal font-[Outfit,sans-serif] line-clamp-2">Product SKU #{product.id}</h3>
            <p className="text-brand-emerald font-bold mt-2 font-[Inter,sans-serif]">₦{(product.price / 100).toLocaleString()}</p>
          </div>
          
          <button 
            className="w-full text-xs py-2 mt-4 font-bold bg-brand-charcoal text-white rounded-xl hover:bg-black transition-colors"
            onClick={() => {
              // Usually we'd hook this into the cart or offline mutation queue
              console.log('Clicked add to cart for', product.id)
            }}
          >
            Add To Cart
          </button>
        </div>
      ))}
    </div>
  );
}
