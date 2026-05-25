import { useState, useEffect } from 'react';
import { WifiOff, RefreshCcw, Wifi } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  
  useEffect(() => {
    const handleOffline = () => {
       setIsOffline(true);
       setIsSyncing(false);
    };
    const handleOnline = () => {
       setIsOffline(false);
       setIsSyncing(true);
       setTimeout(() => setIsSyncing(false), 3000);
    };
    
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline && !isSyncing) return null;

  return (
    <div className="fixed top-2 md:top-4 left-1/2 -translate-x-1/2 z-[999] pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
      {isOffline ? (
         <div className="bg-red-50 dark:bg-slate-800 border border-red-200 dark:border-red-900/50 shadow-lg rounded-full px-4 py-2 flex items-center gap-3 backdrop-blur-md transition-all">
            <div className="animate-pulse bg-red-100 dark:bg-red-900/30 p-1.5 rounded-full">
               <WifiOff size={16} className="text-red-500 dark:text-red-400" />
            </div>
            <div className="flex flex-col">
               <span className="text-xs font-bold text-red-700 dark:text-red-300 tracking-tight leading-tight">Offline Mode</span>
               <span className="text-[10px] text-red-600/80 dark:text-red-400/80 flex items-center gap-1 font-medium leading-tight">
                  <WifiOff size={10} />
                  Sync paused
               </span>
            </div>
         </div>
      ) : (
         <div className="bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900/50 shadow-lg rounded-full px-4 py-2 flex items-center gap-3 backdrop-blur-md transition-all">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-full">
               <Wifi size={16} className="text-emerald-600 dark:text-emerald-400 animate-pulse" />
            </div>
            <div className="flex flex-col">
               <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 tracking-tight leading-tight">Back Online</span>
               <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 flex items-center gap-1 font-medium leading-tight">
                  <RefreshCcw size={10} className="animate-spin" />
                  Syncing data...
               </span>
            </div>
         </div>
      )}
    </div>
  );
}
