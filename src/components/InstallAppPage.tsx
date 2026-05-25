import { useState } from 'react';
import { Download, Globe, HeartPulse, Share, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';

interface InstallAppPageProps {
  onNext: () => void;
  deferredPrompt: any | null;
}

export default function InstallAppPage({ onNext, deferredPrompt }: InstallAppPageProps) {
  const { language, toggleLanguage } = useLanguage();
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install: ${outcome}`);
      onNext();
    } else {
      // Fallback for iOS or unsupported browsers
      const isIos = /ipad|iphone|ipod/.test(navigator.userAgent.toLowerCase());
      if (isIos) {
        setShowIosInstructions(true);
      } else {
        // Just proceed if we can't install, or give generic prompt
        alert(language === 'en' ? 'To install, look for the "Add to Home Screen" option in your browser menu.' : 'ដើម្បីដំឡើង សូមស្វែងរកជម្រើស "បន្ថែមទៅអេក្រង់ដើម" នៅក្នុងម៉ឺនុយកម្មវិធីរុករករបស់អ្នក។');
      }
    }
  };

  const handleSkip = () => {
    onNext();
  };

  return (
    <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900 z-[110] flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center text-center overflow-hidden relative">
        
        <button 
          onClick={toggleLanguage}
          className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-[10px] font-medium shadow-sm text-slate-600 dark:text-slate-300 active:scale-95 transition-all cursor-pointer z-20"
        >
          <Globe size={12} className="text-blue-500" />
          {language === 'en' ? 'ENG' : 'KHM'}
        </button>

        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-24 h-24 bg-blue-50 dark:bg-blue-900/40 rounded-[2rem] flex items-center justify-center mt-6 mb-6 shadow-md ring-4 ring-blue-100 dark:ring-blue-800/50 relative overflow-hidden"
        >
          <img 
            src="/logo.png" 
            alt="CamHealth" 
            className="w-full h-full object-cover z-10 drop-shadow-sm"
            onError={(e) => { 
                e.currentTarget.style.display = 'none'; 
                e.currentTarget.nextElementSibling!.classList.remove('hidden'); 
            }}
          />
          <HeartPulse size={40} className="text-blue-600 dark:text-blue-400 hidden z-10" />
        </motion.div>

        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
          {language === 'en' ? 'Install CamHealth' : 'ដំឡើង CamHealth-ខេមហេល'}
        </h2>
        
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed max-w-sm mx-auto">
          {language === 'en' 
            ? 'Install this app on your device for quick access, offline mode, and a better overall experience.' 
            : 'ដំឡើងកម្មវិធីនេះនៅលើឧបករណ៍របស់អ្នកសម្រាប់ប្រើប្រាស់រហ័ស ដំណើរការទាន់ចិត្ត និងងាយស្រួលប្រើ។'}
        </p>

        <div className="w-full flex flex-col gap-3">
          <button 
            onClick={handleInstallClick}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Download size={20} className="animate-bounce" />
            {language === 'en' ? 'Install App' : 'ដំឡើងកម្មវិធី'}
          </button>
          
          <button 
            onClick={handleSkip}
            className="w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 transition-all"
          >
            {language === 'en' ? 'Skip for now' : 'រំលងសិន'}
          </button>
        </div>

        {/* iOS Install Instructions Modal */}
        <AnimatePresence>
          {showIosInstructions && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute inset-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-slate-200 dark:ring-slate-600">
                <Compass size={32} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                {language === 'en' ? 'Install on iOS' : 'ដំឡើងនៅលើ iOS'}
              </h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-8 max-w-xs leading-relaxed">
                {language === 'en' ? 'To install this app on your iPhone or iPad, tap the Share button below and select "Add to Home Screen".' : 'ដើម្បីដំឡើងកម្មវិធីនេះនៅលើ iPhone ឬ iPad របស់អ្នក សូមចុចប៊ូតុងចែករំលែកខាងក្រោម ហើយជ្រើសរើស "បន្ថែមទៅអេក្រង់ដើម"។'}
              </p>
              
              <div className="flex bg-slate-100 dark:bg-slate-700 p-3 rounded-2xl gap-4 items-center mb-10 shadow-sm border border-slate-200 dark:border-slate-600">
                <Share size={24} className="text-blue-500" />
                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                  {language === 'en' ? 'Tap Share' : 'ចុច ចែករំលែក'}
                </span>
                <span className="text-slate-300 dark:text-slate-500">→</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                  {language === 'en' ? 'Add to Home Screen' : 'បន្ថែមទៅអេក្រង់ដើម'}
                </span>
              </div>

              <button 
                onClick={() => { setShowIosInstructions(false); onNext(); }}
                className="w-full py-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95 transition-all"
              >
                {language === 'en' ? 'I understand' : 'ខ្ញុំយល់ហើយ'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
