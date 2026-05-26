import { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './lib/LanguageContext';
import { ThemeProvider, useTheme } from './lib/ThemeContext';
import { Tab, UserProfile } from './types';
import Home from './components/Home';
import SymptomChecker from './components/SymptomChecker';
import HospitalMap from './components/HospitalMap';
import Reminders from './components/Reminders';
import About from './components/About';
import Profile from './components/Profile';
import PinAuth from './components/PinAuth';
import InstallAppPage from './components/InstallAppPage';
import OfflineIndicator from './components/OfflineIndicator';
import { Home as HomeIcon, Stethoscope, MapPin, Pill, Globe, Info, HeartPulse, Moon, Sun, User, Download, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function SplashScreen({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  const mainTitle = "CamHealth";
  const subTitle = "Your Health, Our Priority";

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 3, filter: "blur(8px)" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 bg-gradient-to-tr from-blue-700 via-indigo-700 to-slate-900 z-[100] flex flex-col items-center justify-center text-white overflow-hidden"
    >
      <div className="flex flex-col items-center z-10">
        {/* Polished Logo Card */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 190,
            damping: 90,
            mass: 1.5,
            duration: 1.9
          }}
          className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-[2rem] flex items-center justify-center mb-6 sm:mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.25)] relative overflow-hidden ring-4 ring-white/30"
        >
          <div className="w-full h-full relative z-10 flex items-center justify-center">
            <img 
              src="/dss.png" 
              alt="CamHealth" 
              className="w-full h-full object-cover filter drop-shadow-sm" 
              onError={(e) => { 
                e.currentTarget.style.display = 'none'; 
                e.currentTarget.nextElementSibling!.classList.remove('hidden'); 
              }} 
            />
            <HeartPulse className="w-16 h-16 sm:w-20 sm:h-20 text-blue-600 hidden" />
          </div>
        </motion.div>

        {/* Attention-Grabbing Staggered Letter Reveal */}
        <motion.h1 
          className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 sm:mb-4 khmer-bold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)] flex gap-0.5 justify-center overflow-hidden"
        >
          {mainTitle.split("").map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 35, scale: 0.7, rotate: -15 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 12,
                delay: 0.15 + index * 0.05
              }}
              style={{ display: "inline-block" }}
              className="hover:text-blue-200 transition-colors cursor-default"
            >
              {char}
            </motion.span>
          ))}
        </motion.h1>

        {/* Attention-Grabbing Staggered Slogan Reveal */}
        <motion.p 
          className="text-blue-100/90 font-medium tracking-wider text-base sm:text-lg text-center flex gap-1.5 justify-center flex-wrap px-4 max-w-md drop-shadow"
        >
          {subTitle.split(" ").map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 160,
                damping: 10,
                delay: 0.75 + index * 0.1
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.p>
      </div>
    </motion.div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [showInstallPage, setShowInstallPage] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (localStorage.getItem('camhealth_pwa_dismissed') !== 'true') {
         // Add a small delay to make it feel less aggressive
         setTimeout(() => setShowInstallPrompt(true), 3500);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };
  
  const dismissInstallPWA = () => {
     setShowInstallPrompt(false);
     localStorage.setItem('camhealth_pwa_dismissed', 'true');
  };

  useEffect(() => {
    const isAuthed = localStorage.getItem('camhealth_session') === 'authenticated';
    if (isAuthed) {
      const savedProfile = localStorage.getItem('camhealth_profile');
      if (savedProfile) {
        try {
          setUserProfile(JSON.parse(savedProfile));
          setIsAuthenticated(true);
        } catch (e) {
          localStorage.removeItem('camhealth_session');
        }
      }
    }
  }, []);

  const handleAuthSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsAuthenticated(true);
  };

  return (
    <div className="fixed inset-0 bg-slate-100 dark:bg-slate-950 flex font-sans overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-500">
      <OfflineIndicator />
      {/* Responsive App Container */}
      <div className="w-full h-full bg-white dark:bg-slate-900 relative flex flex-col md:flex-row overflow-hidden transition-all duration-300">
        
        <AnimatePresence>
           {showSplash && <SplashScreen onFinish={() => {
              setShowSplash(false);
              const isAuthed = localStorage.getItem('camhealth_session') === 'authenticated';
              const pwaDismissed = localStorage.getItem('camhealth_pwa_dismissed') === 'true';
              if (!isAuthed && !pwaDismissed) {
                 setShowInstallPage(true);
              }
           }} />}
        </AnimatePresence>

        <AnimatePresence>
           {showInstallPage && (
              <InstallAppPage 
                 deferredPrompt={deferredPrompt} 
                 onNext={() => {
                    setShowInstallPage(false);
                    localStorage.setItem('camhealth_pwa_dismissed', 'true');
                 }} 
              />
           )}
        </AnimatePresence>

        <AnimatePresence>
           {!showSplash && !showInstallPage && !isAuthenticated && (
              <PinAuth onSuccess={handleAuthSuccess} />
           )}
        </AnimatePresence>

        <AnimatePresence>
           {showInstallPrompt && (
              <motion.div 
                 initial={{ opacity: 0, y: -50 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="absolute top-4 sm:top-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_15px_40px_-5px_rgba(0,0,0,0.6)] border border-slate-200 dark:border-slate-700 z-[110] overflow-hidden flex flex-col pointer-events-auto"
              >
                 <div className="p-4 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex shrink-0 items-center justify-center text-blue-600 dark:text-blue-400 ring-1 ring-blue-100 dark:ring-blue-800/50">
                       <img src="/logo.png" className="w-8 h-8 object-contain drop-shadow-sm" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
                       <HeartPulse size={20} className="hidden drop-shadow-md" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                       <h3 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base tracking-tight">{language === 'en' ? 'Install CamHealth App' : 'ដំឡើងកម្មវិធី CamHealth'}</h3>
                       <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed pr-2">{language === 'en' ? 'Add to your home screen for quick offline access and better experience.' : 'បន្ថែមទៅអេក្រង់ដើមរបស់អ្នកសម្រាប់ប្រើប្រាស់រហ័ស ងាយស្រួល និងមិនបាច់មានអ៊ីនធឺណិត។'}</p>
                    </div>
                 </div>
                 <div className="flex border-t border-slate-100 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/50">
                    <button onClick={dismissInstallPWA} className="flex-1 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors uppercase tracking-wider">{language === 'en' ? 'Not Now' : 'ពេលក្រោយ'}</button>
                    <div className="w-px bg-slate-200 dark:bg-slate-700/80"></div>
                    <button onClick={handleInstallPWA} className="flex-1 py-3.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5"><Download size={14} className="animate-bounce" /> {language === 'en' ? 'Install' : 'ដំឡើង'}</button>
                 </div>
              </motion.div>
           )}
        </AnimatePresence>

        {/* Desktop Sidebar Navigation (hidden on mobile) */}
        <div className="hidden md:flex flex-col w-24 lg:w-64 bg-slate-50 dark:bg-slate-900 z-50 border-r border-slate-200 dark:border-slate-800 transition-colors duration-300">
           <div className="p-6 flex items-center justify-center lg:justify-start gap-4 h-24 mb-2">
              <div className="w-12 h-12 rounded-2xl flex shrink-0 items-center justify-center bg-white shadow-lg ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
                 <img src="/logo.png" alt="CamHealth" className="w-full h-full object-contain p-1" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
                 <HeartPulse size={26} className="text-blue-600 drop-shadow-md hidden" />
              </div>
              <h1 className="font-extrabold text-2xl khmer-bold text-slate-800 dark:text-slate-100 hidden lg:block tracking-tight text-nowrap py-1">CamHealth</h1>
           </div>
           
           <div className="flex-1 px-4 py-6 flex flex-col gap-2 relative">
              <button onClick={() => setActiveTab('home')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'home' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'} group`}>
                 <HomeIcon size={22} className={activeTab === 'home' ? 'fill-blue-500/20' : 'group-hover:scale-110 transition-transform'} />
                 <span className="hidden lg:block khmer-bold truncate">{t.home}</span>
              </button>
              <button onClick={() => setActiveTab('symptoms')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'symptoms' ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'} group`}>
                 <Stethoscope size={22} className={activeTab === 'symptoms' ? 'fill-purple-500/20' : 'group-hover:scale-110 transition-transform'} />
                 <span className="hidden lg:block khmer-bold truncate">{t.symptoms}</span>
              </button>
              <button onClick={() => setActiveTab('map')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'map' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'} group`}>
                 <MapPin size={22} className={activeTab === 'map' ? 'fill-emerald-500/20' : 'group-hover:scale-110 transition-transform'} />
                 <span className="hidden lg:block khmer-bold truncate">{t.map}</span>
              </button>
              <button onClick={() => setActiveTab('reminders')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'reminders' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'} group`}>
                 <Pill size={22} className={activeTab === 'reminders' ? 'fill-amber-500/20' : 'group-hover:scale-110 transition-transform'} />
                 <span className="hidden lg:block khmer-bold truncate">{t.reminders}</span>
              </button>
              <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'profile' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'} group`}>
                 <User size={22} className={activeTab === 'profile' ? 'fill-blue-500/20' : 'group-hover:scale-110 transition-transform'} />
                 <span className="hidden lg:block khmer-bold truncate">{t.profile}</span>
              </button>
              <div className="mt-auto flex flex-col gap-2">
                 <button onClick={() => window.location.reload()} className="hidden md:flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-slate-500 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700 hover:text-slate-900 dark:hover:text-white group">
                    <RefreshCw size={22} className="text-blue-500 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="hidden lg:block uppercase text-xs font-bold tracking-wider">{t.refresh || 'Refresh'}</span>
                 </button>
                 <button onClick={toggleTheme} className="hidden md:flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-slate-500 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700 hover:text-slate-900 dark:hover:text-white group">
                    {theme === 'dark' ? <Sun size={22} className="text-amber-400 group-hover:rotate-90 transition-transform" /> : <Moon size={22} className="text-indigo-500 group-hover:-rotate-12 transition-transform" />}
                    <span className="hidden lg:block uppercase text-xs font-bold tracking-wider">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                 </button>
                 <button 
                   onClick={toggleLanguage}
                   className="hidden md:flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-slate-500 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700 hover:text-slate-900 dark:hover:text-white group"
                 >
                   <Globe size={22} className="text-blue-500 dark:text-blue-400 group-hover:animate-pulse"/>
                   <span className="hidden lg:block uppercase text-xs font-bold tracking-wider">{language === 'en' ? 'English (KHM)' : 'ភាសាខ្មែរ (ENG)'}</span>
                 </button>
                 <button onClick={() => setActiveTab('about')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'about' ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'} group`}>
                    <Info size={22} className={activeTab === 'about' ? 'fill-indigo-500/20' : 'group-hover:scale-110 transition-transform'} />
                    <span className="hidden lg:block khmer-bold truncate">{t.about}</span>
                 </button>
              </div>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden min-h-0 bg-white dark:bg-slate-900 shadow-none md:shadow-[inset_1px_0_10px_rgba(0,0,0,0.05)] dark:md:shadow-[inset_1px_0_10px_rgba(0,0,0,0.2)] transition-colors duration-300">
          
          {/* Mobile-only Top Header for Language */}
          <div className="md:hidden bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between z-40 shrink-0 shadow-sm transition-colors duration-300">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-md overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                   <img src="/logo.png" alt="CamHealth" className="w-full h-full object-contain p-0.5" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
                   <HeartPulse size={18} className="hidden drop-shadow-md" />
                </div>
                <h1 className="font-bold text-lg sm:text-xl khmer-bold text-slate-800 dark:text-white tracking-tight py-1">CamHealth</h1>
             </div>
             <div className="flex items-center gap-2">
                <button onClick={() => window.location.reload()} className="p-2 sm:p-2.5 rounded-lg text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                   <RefreshCw size={18} className="active:rotate-180 transition-transform duration-300" />
                </button>
                <button onClick={toggleTheme} className="p-2 sm:p-2.5 rounded-lg text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                   {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button 
                   onClick={toggleLanguage}
                   className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105 text-slate-700 dark:text-slate-200 transition-all active:scale-95"
                   title="Toggle Language"
                 >
                   <Globe size={14} className="text-blue-500 dark:text-blue-400"/>
                   <span className="uppercase text-[10px] sm:text-xs tracking-wider font-bold">{language === 'en' ? 'ENG' : 'KHM'}</span>
                 </button>
             </div>
          </div>

          <div className="flex-1 overflow-hidden relative min-h-0">
             <div className="h-full w-full relative bg-transparent">
                 <div className={`absolute inset-0 transition-all duration-300 ${activeTab === 'home' ? 'opacity-100 z-10 translate-y-0' : 'opacity-0 z-0 pointer-events-none translate-y-4'}`}>
                    <Home onTabChange={setActiveTab} />
                 </div>
                 <div className={`absolute inset-0 transition-all duration-300 ${activeTab === 'symptoms' ? 'opacity-100 z-10 translate-y-0' : 'opacity-0 z-0 pointer-events-none translate-y-4'}`}>
                    <SymptomChecker isActiveTab={activeTab === 'symptoms'} />
                 </div>
                 <div className={`absolute inset-0 transition-all duration-300 ${activeTab === 'map' ? 'opacity-100 z-10 translate-y-0' : 'opacity-0 z-0 pointer-events-none translate-y-4'}`}>
                    <HospitalMap />
                 </div>
                 <div className={`absolute inset-0 transition-all duration-300 ${activeTab === 'reminders' ? 'opacity-100 z-10 translate-y-0' : 'opacity-0 z-0 pointer-events-none translate-y-4'}`}>
                    <Reminders />
                 </div>
                 <div className={`absolute inset-0 transition-all duration-300 ${activeTab === 'profile' ? 'opacity-100 z-10 translate-y-0' : 'opacity-0 z-0 pointer-events-none translate-y-4'}`}>
                    <Profile />
                 </div>
                 <div className={`absolute inset-0 transition-all duration-300 ${activeTab === 'about' ? 'opacity-100 z-10 translate-y-0' : 'opacity-0 z-0 pointer-events-none translate-y-4'}`}>
                    <About />
                 </div>
             </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation (hidden on desktop) */}
        <div className="md:hidden shrink-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-safe pt-2 px-1 sm:px-2 flex justify-between items-center z-50 shadow-[0_-5px_20px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_-5px_20px_-15px_rgba(0,0,0,0.5)] transition-colors duration-300">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 flex-1 min-w-0 py-1.5 sm:py-2 rounded-xl transition-all ${activeTab === 'home' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
             <HomeIcon size={20} className={activeTab === 'home' ? 'fill-blue-500/20 scale-110 transition-transform' : ''} />
             <span className="text-[9px] sm:text-[10px] font-semibold khmer-bold truncate w-full text-center px-0.5">{t.home}</span>
          </button>
          <button onClick={() => setActiveTab('symptoms')} className={`flex flex-col items-center gap-1 flex-1 min-w-0 py-1.5 sm:py-2 rounded-xl transition-all ${activeTab === 'symptoms' ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
             <Stethoscope size={20} className={activeTab === 'symptoms' ? 'fill-purple-500/20 scale-110 transition-transform' : ''} />
             <span className="text-[9px] sm:text-[10px] font-semibold khmer-bold truncate w-full text-center px-0.5">{t.symptoms}</span>
          </button>
          <button onClick={() => setActiveTab('map')} className={`flex flex-col items-center gap-1 flex-1 min-w-0 py-1.5 sm:py-2 rounded-xl transition-all ${activeTab === 'map' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
             <MapPin size={20} className={activeTab === 'map' ? 'fill-emerald-500/20 scale-110 transition-transform' : ''} />
             <span className="text-[9px] sm:text-[10px] font-semibold khmer-bold truncate w-full text-center px-0.5">{t.map}</span>
          </button>
          <button onClick={() => setActiveTab('reminders')} className={`flex flex-col items-center gap-1 flex-1 min-w-0 py-1.5 sm:py-2 rounded-xl transition-all ${activeTab === 'reminders' ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
             <Pill size={20} className={activeTab === 'reminders' ? 'fill-amber-500/20 scale-110 transition-transform' : ''} />
             <span className="text-[9px] sm:text-[10px] font-semibold khmer-bold truncate w-full text-center px-0.5">{t.reminders}</span>
          </button>
          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 flex-1 min-w-0 py-1.5 sm:py-2 rounded-xl transition-all ${activeTab === 'profile' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
             <User size={20} className={activeTab === 'profile' ? 'fill-blue-500/20 scale-110 transition-transform' : ''} />
             <span className="text-[9px] sm:text-[10px] font-semibold khmer-bold truncate w-full text-center px-0.5">{t.profile}</span>
          </button>
          <button onClick={() => setActiveTab('about')} className={`flex flex-col items-center gap-1 flex-1 min-w-0 py-1.5 sm:py-2 rounded-xl transition-all ${activeTab === 'about' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
             <Info size={20} className={activeTab === 'about' ? 'fill-indigo-500/20 scale-110 transition-transform' : ''} />
             <span className="text-[9px] sm:text-[10px] font-semibold khmer-bold truncate w-full text-center px-0.5">{t.about}</span>
          </button>
        </div>
        
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

