import React, { useState, useEffect } from 'react';
import { Download, MonitorSmartphone, PlusSquare, Share } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

export default function InstallPWA() {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if the device is iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800/80 dark:to-indigo-900/40 p-5 sm:p-6 rounded-2xl shadow-sm border border-indigo-100/60 dark:border-indigo-500/20 transition-colors">
      <div className="flex items-start gap-4">
        <div className="shrink-0 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-indigo-600 dark:text-indigo-400">
          <MonitorSmartphone className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[15px] sm:text-base khmer-bold mb-1">
            {language === 'en' ? 'Progressive Web App (PWA)' : 'កម្មវិធីវិបតំឡើងលើទូរស័ព្ទ (PWA)'}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
            {language === 'en' 
              ? "Progressive Web Apps (PWA) is a new technology that creates a middle ground between a website and a mobile app. They are installed on the phone like a normal app (web app) and can be accessed from the home screen."
              : "Progressive Web Apps (PWA) គឺជាបច្គេកវិទ្យាថ្មីដែលបង្កើតចំណុចកណ្តាលរវាងគេហទំព័រ និងកម្មវិធីទូរស័ព្ទ។ វាអាចត្រូវបានដំឡើងនៅលើទូរស័ព្ទដូចជាកម្មវិធីធម្មតា និងអាចបើកបានចេញពីអេក្រង់ទូរស័ព្ទរបស់អ្នក។"
            }
          </p>

          {isInstallable && !isIOS ? (
            <button
              onClick={handleInstallClick}
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-colors shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {language === 'en' ? 'Install CamHealth App' : 'ដំឡើងកម្មវិធី CamHealth'}
            </button>
          ) : isIOS ? (
            <div className="bg-indigo-100/50 dark:bg-indigo-900/30 p-4 rounded-xl text-sm text-indigo-900 dark:text-indigo-200 border border-indigo-200/50 dark:border-indigo-800/50">
              <strong className="block mb-2 font-semibold">
                {language === 'en' ? 'To install on iOS:' : 'របៀបដំឡើងនៅលើ iOS៖'}
              </strong>
              <ol className="list-decimal pl-5 space-y-1.5 opacity-90">
                <li className="pl-1">
                  {language === 'en' ? (
                     <span className="flex flex-wrap items-center gap-1.5">Tap the <Share className="w-3.5 h-3.5 inline align-text-bottom" /> <strong>Share</strong> button</span>
                  ) : (
                     <span className="flex flex-wrap items-center gap-1.5">ចុចប៊ូតុង <Share className="w-3.5 h-3.5 inline align-text-bottom" /> <strong>ចែករំលែក (Share)</strong></span>
                  )}
                </li>
                <li className="pl-1">
                  {language === 'en' ? (
                     <span className="flex flex-wrap items-center gap-1.5">Scroll down and tap <PlusSquare className="w-3.5 h-3.5 inline align-text-bottom" /> <strong>"Add to Home Screen"</strong></span>
                  ) : (
                     <span className="flex flex-wrap items-center gap-1.5">អូសចុះក្រោម រួចជ្រើសរើស <PlusSquare className="w-3.5 h-3.5 inline align-text-bottom" /> <strong>"Add to Home Screen"</strong></span>
                  )}
                </li>
              </ol>
            </div>
          ) : (
            <div className="bg-indigo-100/50 dark:bg-indigo-900/30 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-indigo-800 dark:text-indigo-200 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
              {language === 'en' 
                ? "PWA technology is active. You can install this app from your browser menu."
                : "បច្ចេកវិទ្យា PWA កំពុងដំណើរការ។ អ្នកអាចដំឡើងកម្មវិធីនេះពីម៉ឺនុយកម្មវិធីរុករករបស់អ្នក។"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
