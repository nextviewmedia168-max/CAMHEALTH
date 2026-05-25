import { useState, useEffect } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { Info, Users, Star, CheckCircle, Shield, Smartphone, Download, Share, PlusSquare, WifiOff, Zap } from 'lucide-react';

export default function About() {
  const { t, language } = useLanguage();
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios'>('android');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const founderPortraitUrl = "/founder_portrait_1779547959472.png";

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
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
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto pb-6 transition-colors">
      <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 sticky top-0 z-10 shadow-sm transition-colors">
         <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-xl khmer-bold">{t.about}</h2>
      </div>

      <div className="p-6 space-y-6 max-w-4xl mx-auto w-full">
        
        {/* App Logo/Header */}
        <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 rounded-3xl shadow-md text-white text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-inner overflow-hidden shrink-0">
               <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
               <Info className="w-12 h-12 text-blue-600 hidden" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight khmer-bold mb-1">{t.appTitle}</h1>
            <span className="text-blue-100 text-sm">v1.0.0</span>
        </div>

        {/* Founder Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 transition-colors flex flex-col sm:flex-row items-center sm:items-start gap-6">
           <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-md ring-4 ring-blue-500/10">
              <img 
                 src={founderPortraitUrl} 
                 alt="Founder Portrait" 
                 className="w-full h-full object-cover"
                 referrerPolicy="no-referrer"
              />
           </div>
           <div className="flex-1 text-center sm:text-left space-y-1.5">
              <span className="text-[10px] sm:text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">
                 {language === 'en' ? 'App Founder' : 'ស្ថាបនិកកម្មវិធី'}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 khmer-bold">
                 {language === 'en' ? 'Vat Udomkevin' : 'វ៉ាត​ ឧត្តមខេវិន'}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                 {language === 'en' 
                    ? "I created CamHealth with the goal of improving access to healthcare through simple and effective digital solutions."
                    : "ខ្ញុំបានបង្កើត CamHealth-ខេមហេល ដោយមានគោលបំណងលើកកម្ពស់ការទទួលបានសេវាសុខភាពសាធារណៈ តាមរយៈដំណោះស្រាយឌីជីថលដែលសាមញ្ញ និងមានប្រសិទ្ធភាពខ្ពស់។"}
              </p>
           </div>
        </div>

        {/* Vision Section */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 transition-colors">
           <div className="flex items-center gap-3 mb-3 text-purple-600 dark:text-purple-400">
              <Star className="w-5 h-5" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 khmer-bold">{t.aboutVision}</h3>
           </div>
           <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{t.aboutVisionDesc}</p>
        </div>

        {/* Advantages Section */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 transition-colors">
           <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-5 h-5" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 khmer-bold">{t.aboutAdvantages}</h3>
           </div>
           <ul className="space-y-3">
               <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-300 items-start">
                   <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                   <span>{t.aboutAdvantagesList1}</span>
               </li>
               <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-300 items-start">
                   <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                   <span>{t.aboutAdvantagesList2}</span>
               </li>
               <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-300 items-start">
                   <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                   <span>{t.aboutAdvantagesList3}</span>
               </li>
               {t.aboutAdvantagesList4 && (
                  <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-300 items-start">
                      <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span>{t.aboutAdvantagesList4}</span>
                  </li>
               )}
           </ul>
        </div>

        {/* PWA Technology & Install Guide */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/60 transition-colors space-y-5">
           <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
              <Smartphone className="w-5 h-5" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base sm:text-lg khmer-bold">
                 {language === 'en' ? 'PWA Mobile App Technology' : 'បច្ចេកវិទ្យាដំឡើងលើទូរស័ព្ទ (PWA)'}
              </h3>
           </div>

           {/* Definition block */}
           <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/40 dark:from-slate-900/60 dark:to-indigo-950/20 p-4 rounded-2xl border border-blue-100/50 dark:border-slate-700/40">
              <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed font-medium">
                 {language === 'en' 
                    ? "Progressive Web Apps (PWA) is a new technology that creates a middle ground between a website and a mobile app. They are installed on the phone like a normal app (web app) and can be accessed from the home screen."
                    : "Progressive Web Apps (PWA) គឺជាបច្ចេកវិទ្យាថ្មីមួយដែលបង្កើតឡើងជាស្ពានចម្លងរវាងគេហទំព័រ និងកម្មវិធីទូរស័ព្ទដៃ (Mobile App)។ វាត្រូវបានដំឡើងនៅលើទូរស័ព្ទដៃដូចជាកម្មវិធីធម្មតា (Web App) និងអាចចូលប្រើប្រាស់បានពីអេក្រង់ដើម (Home Screen)។"}
              </p>
           </div>

           {/* Quick Features Row */}
           <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100/75 dark:border-slate-800/80 text-center space-y-1 shadow-sm">
                 <WifiOff className="w-4.5 h-4.5 mx-auto text-amber-500" />
                 <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {language === 'en' ? 'Offline Support' : 'ប្រើគ្មានអ៊ីនធឺណិត'}
                 </h4>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100/75 dark:border-slate-800/80 text-center space-y-1 shadow-sm">
                 <Zap className="w-4.5 h-4.5 mx-auto text-emerald-500 animate-pulse" />
                 <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {language === 'en' ? 'Fast & Light' : 'លឿន & ស្រាល'}
                 </h4>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100/75 dark:border-slate-800/80 text-center space-y-1 shadow-sm">
                 <Smartphone className="w-4.5 h-4.5 mx-auto text-blue-500" />
                 <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {language === 'en' ? 'Home Screen' : 'នៅលើអេក្រង់ដើម'}
                 </h4>
              </div>
           </div>

           {/* Interactive Install Button (Shows if browser supports it) */}
           {isInstallable && (
             <button
                onClick={handleInstallClick}
                className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Download className="w-5 h-5 animate-bounce" />
                {language === 'en' ? 'Install CamHealth App Now' : 'ដំឡើងកម្មវិធី CamHealth ឥឡូវនេះ'}
             </button>
           )}

           {/* Platform selector */}
           <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                 <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {language === 'en' ? 'Install Instructions' : 'របៀបដំឡើងដាក់លើអេក្រង់ទូរស័ព្ទ'}
                 </span>
                 <div className="bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl flex gap-1 self-start sm:self-auto">
                    <button
                       onClick={() => setActivePlatform('android')}
                       className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          activePlatform === 'android'
                             ? 'bg-blue-600 text-white shadow-sm'
                             : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                       }`}
                    >
                       Android / Chrome
                    </button>
                    <button
                       onClick={() => setActivePlatform('ios')}
                       className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          activePlatform === 'ios'
                             ? 'bg-blue-600 text-white shadow-sm'
                             : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                       }`}
                    >
                       Apple iOS / Safari
                    </button>
                 </div>
              </div>

              {/* Install steps based on selection */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100/70 dark:border-slate-800/60">
                 {activePlatform === 'android' ? (
                    <div className="space-y-4">
                       <div className="flex gap-3 items-start leading-snug">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                          <div>
                             <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {language === 'en' ? "Open CamHealth in Google Chrome" : "បើកកម្មវិធី CamHealth នៅក្នុងកម្មវិធី Google Chrome"}
                             </p>
                             <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {language === 'en' ? "Make sure you are browsing using Google Chrome on your Android phone." : "សូមប្រាកដថាអ្នកកំពុងបើកមើល ដោយប្រើកម្មវិធី Google Chrome លើទូរស័ព្ទរបស់អ្នក។"}
                             </p>
                          </div>
                       </div>
                       <div className="flex gap-3 items-start leading-snug">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                          <div>
                             <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {language === 'en' ? "Tap the 3-dots (⋮) options button" : "ចុចលើប៊ូតុងជម្រើស ចុចបី (⋮) នៅផ្នែកកំពូលស្តាំ"}
                             </p>
                             <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {language === 'en' ? "Look for the browser menu button in the top-right corner of Chrome." : "ស្វែងរកប៊ូតុងមឺនុយរបស់កម្មវិធីបើកអ៊ីនធឺណិតនៅជ្រុងកំពូលស្តាំ។"}
                             </p>
                          </div>
                      </div>
                      <div className="flex gap-3 items-start leading-snug">
                         <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                         <div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                               {language === 'en' ? "Select 'Install App' or 'Add to Home Screen'" : "ជ្រើសរើសពាក្យ 'ដំឡើងកម្មវិធី' ឬ 'បន្ថែមទៅអេក្រង់ដើម'"}
                               <Download size={13} className="text-emerald-500 shrink-0" />
                            </p>
                            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
                               {language === 'en' ? "Chrome will ask you to confirm. Click 'Install' to place the beautiful shortcut on your home screen." : "ប្រព័ន្ធនឹងសួរអ្នកដើម្បីបញ្ជាក់។ សូមចុច 'ដំឡើង' ដើម្បីដាក់រូបតំណាងដ៏ស្រស់ស្អាតនៅលើអេក្រង់ដើមទូរស័ព្ទរបស់អ្នក។"}
                            </p>
                         </div>
                      </div>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       <div className="flex gap-3 items-start leading-snug">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                          <div>
                             <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {language === 'en' ? "Open CamHealth in Safari Browser" : "បើកកម្មវិធី CamHealth នៅក្នុងកម្មវិធីរុករក Safari"}
                             </p>
                             <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {language === 'en' ? "PWA features on iPhone require using Apple's default Safari browser." : "មុខងារដំឡើង PWA លើប្រព័ន្ធ iOS/iPhone តម្រូវឱ្យប្រើប្រាស់កម្មវិធីរុករក Safari ផ្លូវការ។"}
                             </p>
                          </div>
                       </div>
                       <div className="flex gap-3 items-start leading-snug">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                          <div>
                             <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                {language === 'en' ? "Tap the Share button in the navigation bar" : "ចុចលើប៊ូតុងចែករំលែក (Share) នៅផ្នែកខាងក្រោម"}
                                <Share size={13} className="text-blue-500 shrink-0" />
                             </p>
                             <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {language === 'en' ? "Look for the browser toolbar share icon depicting a box with an upward-pointing arrow." : "ស្វែងរករូបតំណាងចែករំលែកដែលមានរាងប្រអប់ និងព្រួញចង្អុលឡើងលើ។"}
                             </p>
                          </div>
                       </div>
                       <div className="flex gap-3 items-start leading-snug">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                          <div>
                             <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                {language === 'en' ? "Choose 'Add to Home Screen'" : "ជ្រើសរើសពាក្យ 'បន្ថែមទៅអេក្រង់ដើម' (Add to Home Screen)"}
                                <PlusSquare size={13} className="text-indigo-500 shrink-0" />
                             </p>
                             <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {language === 'en' ? "Scroll through the option list, select 'Add to Home Screen', and click 'Add' at the top-right." : "អូសចុះក្រោមក្នុងបញ្ជី រួចរើសពាក្យ 'Add to Home Screen' ហើយចុចប៊ូតុង 'Add' នៅលើកំពូលខាងស្តាំ។"}
                             </p>
                          </div>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Creators Section */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 transition-colors">
           <div className="flex items-center gap-3 mb-3 text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 khmer-bold">{t.aboutCreators}</h3>
           </div>
           <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{t.aboutCreatorsDesc}</p>
        </div>

      </div>
    </div>
  );
}
