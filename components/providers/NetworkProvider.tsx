'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// 'slow-2g' | '2g' | '3g' | '4g'
export type NetworkEffectiveType = 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';

interface NetworkContextType {
  effectiveType: NetworkEffectiveType;
  downlink: number;
  rtt: number;
  saveData: boolean;
  isOffline: boolean;
}

const defaultNetworkState: NetworkContextType = {
  effectiveType: '4g', // Default to optimistic fast network
  downlink: 10,
  rtt: 50,
  saveData: false,
  isOffline: false,
};

const NetworkContext = createContext<NetworkContextType>(defaultNetworkState);

export const useNetwork = () => useContext(NetworkContext);

interface NetworkProviderProps {
  children: ReactNode;
  initialType?: NetworkEffectiveType;
}

export function NetworkProvider({ children, initialType }: NetworkProviderProps) {
  const [networkState, setNetworkState] = useState<NetworkContextType>({
    ...defaultNetworkState,
    effectiveType: initialType || '4g',
  });

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    const updateNetworkState = () => {
      const isOffline = !navigator.onLine;
      
      let newType: NetworkEffectiveType = '4g';
      let newDownlink = 10;
      let newRtt = 50;
      let newSaveData = false;

      if (connection) {
        newType = connection.effectiveType || '4g';
        newDownlink = connection.downlink || 10;
        newRtt = connection.rtt || 50;
        newSaveData = connection.saveData || false;
      }

      setNetworkState({
        effectiveType: isOffline ? 'unknown' : newType,
        downlink: newDownlink,
        rtt: newRtt,
        saveData: newSaveData,
        isOffline,
      });

      // Sync network quality to a cookie so the server can read it on next page load
      if (!isOffline && connection) {
        document.cookie = `x-network-quality=${newType}; path=/; max-age=3600; SameSite=Lax`;
      }
    };

    // Initial check
    updateNetworkState();

    // Event listeners for changes
    if (connection) {
      connection.addEventListener('change', updateNetworkState);
    }
    window.addEventListener('online', updateNetworkState);
    window.addEventListener('offline', updateNetworkState);

    return () => {
      if (connection) {
        connection.removeEventListener('change', updateNetworkState);
      }
      window.removeEventListener('online', updateNetworkState);
      window.removeEventListener('offline', updateNetworkState);
    };
  }, []);

  return (
    <NetworkContext.Provider value={networkState}>
      {children}
    </NetworkContext.Provider>
  );
}
