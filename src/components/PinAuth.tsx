import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { useTheme } from '../lib/ThemeContext';
import { UserProfile } from '../types';
import { Lock, Shield, User, Globe, Check, Eye, EyeOff, KeyRound, AlertCircle, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PinAuthProps {
 onSuccess: (p: UserProfile) => void;
}

export default function PinAuth({ onSuccess }: PinAuthProps) {
 const { t, language, toggleLanguage } = useLanguage();
 const { theme, toggleTheme } = useTheme();
 
 const [hasProfile, setHasProfile] = useState<boolean>(false);
 const [existingProfile, setExistingProfile] = useState<UserProfile | null>(null);

 // Authentication State
 const [pin, setPin] = useState<string>('');
 const [authError, setAuthError] = useState<string>('');
 const [isShaking, setIsShaking] = useState<boolean>(false);

 // Wizard State
 const [setupStep, setSetupStep] = useState<number>(1);

 // Registration Form State
 const [regName, setRegName] = useState<string>('');
 const [regPin, setRegPin] = useState<string>('');
 const [regConfirmPin, setRegConfirmPin] = useState<string>('');
 const [regAvatar, setRegAvatar] = useState<string>('default_1');
 const [consentChecked, setConsentChecked] = useState<boolean>(false);
 const [regError, setRegError] = useState<string>('');

 const regFileInputRef = useRef<HTMLInputElement>(null);

 const presetAvatars = [
 { id: 'default_1', emoji: '🧑‍⚕️', bg: 'bg-emerald-100 text-emerald-600' },
 { id: 'default_2', emoji: '👨‍⚕️', bg: 'bg-blue-100 text-blue-600' },
 { id: 'default_3', emoji: '👩‍⚕️', bg: 'bg-purple-100 text-purple-600' },
 { id: 'default_4', emoji: '🧑', bg: 'bg-indigo-100 text-indigo-600' },
 { id: 'default_5', emoji: '🩺', bg: 'bg-amber-100 text-amber-500' },
 ];

 useEffect(() => {
 const saved = localStorage.getItem('camhealth_profile');
 if (saved) {
 try {
 const parsed = JSON.parse(saved) as UserProfile;
 if (parsed.pinCode && parsed.isSetup) {
 setHasProfile(true);
 setExistingProfile(parsed);
 }
 } catch (e) {
 console.error("Error reading profile", e);
 }
 }
 }, []);

 // Handle keypad typing for authentication
 const handleKeypadPress = (val: string) => {
 setAuthError('');
 if (val === 'clear') {
 setPin('');
 return;
 }
 if (val === 'back') {
 setPin(prev => prev.slice(0, -1));
 return;
 }
 if (pin.length < 6) {
 const nextPin = pin + val;
 setPin(nextPin);
 
 // Auto-submit on 6 digits
 if (nextPin.length === 6) {
 handleAuthenticate(nextPin);
 }
 }
 };

 const handleAuthenticate = (enteredPin: string) => {
 if (!existingProfile) return;
 
 if (enteredPin === existingProfile.pinCode) {
 // Authenticated! Save flag in session and invoke onSuccess
 localStorage.setItem('camhealth_session', 'authenticated');
 onSuccess(existingProfile);
 } else {
 // Trigger shake & message
 setIsShaking(true);
 setAuthError(t.incorrectPin);
 setPin('');
 setTimeout(() => setIsShaking(false), 500);
 }
 };

 // Keyboard support for convenience
 useEffect(() => {
 if (!hasProfile) return;
 const handlePhysicalKeyDown = (e: KeyboardEvent) => {
 if (/^\d$/.test(e.key)) {
 handleKeypadPress(e.key);
 } else if (e.key === 'Backspace') {
 handleKeypadPress('back');
 } else if (e.key === 'Escape') {
 handleKeypadPress('clear');
 }
 };
 window.addEventListener('keydown', handlePhysicalKeyDown);
 return () => window.removeEventListener('keydown', handlePhysicalKeyDown);
 }, [pin, hasProfile, existingProfile]);

 // Design Registration / Profile Setup
 const handleRegisterSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 setRegError('');

 if (!regName.trim()) {
 setRegError(language === 'en' ? "Please enter your full name" : "សូមបញ្ចូលឈ្មោះពេញរបស់អ្នក");
 return;
 }
 if (regPin.length !== 6 || !/^\d+$/.test(regPin)) {
 setRegError(language === 'en' ? "Passcode must be exactly 6 digits" : "លេខកូដត្រូវមាន ៦ខ្ទង់");
 return;
 }
 if (regPin !== regConfirmPin) {
 setRegError(t.notMatch);
 return;
 }
 if (!consentChecked) {
 setRegError(language === 'en' ? "Please accept the local privacy disclosure" : "សូមយល់ព្រមតាមការណែនាំឯកជនភាព");
 return;
 }

 // Save profile
 const profileData: UserProfile = {
 name: regName.trim(),
 avatarUrl: regAvatar,
 pinCode: regPin,
 isSetup: true,
 consentAccepted: true,
 bloodType: 'O+',
 gender: 'Other',
 };

 localStorage.setItem('camhealth_profile', JSON.stringify(profileData));
 localStorage.setItem('camhealth_session', 'authenticated');
 onSuccess(profileData);
 };

 const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (file) {
 const reader = new FileReader();
 reader.onloadend = () => {
 setRegAvatar(reader.result as string);
 };
 reader.readAsDataURL(file);
 }
 };

 const renderAvatarPreview = (avatar: string, sizeClass = "w-20 h-20 text-4xl") => {
 if (avatar.startsWith('data:image')) {
 return (
 <img 
 src={avatar} 
 alt="Avatar" 
 className={`${sizeClass} rounded-full object-cover ring-2 ring-blue-500/10 shadow-md bg-white`} 
 />
 );
 }
 const preset = presetAvatars.find(p => p.id === avatar) || presetAvatars[0];
 return (
 <div className={`${sizeClass} ${preset.bg} rounded-full flex items-center justify-center shadow-inner font-medium`}>
 {preset.emoji}
 </div>
 );
 };

 return (
 <div className="absolute inset-0 bg-slate-100 z-[110] flex items-center justify-center p-4 transition-colors duration-300">
 <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-200/60 p-6 sm:p-8 flex flex-col justify-between overflow-hidden transition-all duration-300">
 
 {/* VIEW 1: UNLOCK SCREEN (PIN KEYPAD) */}
 {hasProfile && existingProfile ? (
 <div className="flex flex-col items-center flex-1 py-4 justify-between h-full relative">
 
 <button 
 onClick={toggleLanguage}
 className="absolute -top-2 right-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-medium shadow-sm text-slate-600 active:scale-95 transition-all cursor-pointer z-20"
 >
 <Globe size={12} className="text-blue-500" />
 {language === 'en' ? 'ENG' : 'KHM'}
 </button>
 
 {/* Header / Brand details */}
 <div className="text-center mb-6">
 <motion.div 
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ type: "spring", stiffness: 200, damping: 20 }}
 className="mb-4 inline-block"
 >
 {renderAvatarPreview(existingProfile.avatarUrl, "w-20 h-20 text-4xl mx-auto")}
 </motion.div>

 <h2 className="text-xl font-semibold text-slate-800 mb-1.5">
 {language === 'en' ? 'Welcome Back!' : 'សូមស្វាគមន៍មកវិញ!'}
 </h2>
 <p className="text-sm font-medium text-blue-600 ">
 {existingProfile.name}
 </p>
 </div>

 {/* Title description / prompt */}
 <div className="text-center w-full mb-4">
 <span className="text-xs font-medium uppercase tracking-wider text-slate-400 block mb-3">
 {t.enterPin}
 </span>

 {/* Dots representation */}
 <motion.div 
 animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
 transition={{ duration: 0.4 }}
 className="flex justify-center gap-3.5 mb-2 py-2"
 >
 {[...Array(6)].map((_, i) => (
 <div
 key={i}
 className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
 pin.length > i 
 ? 'bg-blue-600 border-blue-600 scale-125' 
 : 'border-slate-300 bg-transparent'
 }`}
 />
 ))}
 </motion.div>

 {authError ? (
 <div className="text-xs font-semibold text-rose-500 flex items-center justify-center gap-1 mt-2">
 <AlertCircle size={12} /> {authError}
 </div>
 ) : (
 <div className="h-5"></div>
 )}
 </div>

 {/* Tactile Virtual Keypad */}
 <div className="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto">
 {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
 <button
 key={num}
 type="button"
 onClick={() => handleKeypadPress(num)}
 className="w-16 h-16 rounded-full bg-slate-50 hover:bg-slate-100 :bg-slate-700/80 active:scale-95 text-slate-800 font-semibold text-xl flex items-center justify-center shadow-sm select-none transition-all cursor-pointer mx-auto"
 >
 {num}
 </button>
 ))}
 <button
 type="button"
 onClick={() => handleKeypadPress('clear')}
 className="w-16 h-16 rounded-full flex items-center justify-center text-xs font-medium text-slate-400 hover:text-slate-600 :text-slate-400 select-none cursor-pointer mx-auto"
 >
 {language === 'en' ? 'Clear' : 'លុប'}
 </button>
 <button
 type="button"
 onClick={() => handleKeypadPress('0')}
 className="w-16 h-16 rounded-full bg-slate-50 hover:bg-slate-100 :bg-slate-700/80 active:scale-95 text-slate-800 font-semibold text-xl flex items-center justify-center shadow-sm select-none transition-all cursor-pointer mx-auto"
 >
 0
 </button>
 <button
 type="button"
 onClick={() => handleKeypadPress('back')}
 className="w-16 h-16 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-700 :text-slate-200 select-none cursor-pointer mx-auto"
 >
 ⌫
 </button>
 </div>

 <div className="mt-6 text-center text-[10px] text-slate-400/90 font-medium leading-relaxed max-w-xxs flex items-center gap-1.5 justify-center">
 <Shield size={12} className="text-emerald-500 shrink-0" />
 <span>{language === 'en' ? 'Offline Pin Security Active' : 'ការការពារដោយទិន្នន័យក្រៅប្រព័ន្ធគឺសកម្ម'}</span>
 </div>

 </div>
 ) : (
 
 /* VIEW 2: REGISTRATION / PROFILE SETUP WIZARD */
 <div className="flex flex-col flex-1 pb-4">
 {/* Wizard Header */}
 <div className="flex items-center justify-between mb-6">
 <div className="flex gap-2 relative z-20">
 {[1, 2, 3].map(step => (
 <div key={step} className={`w-8 h-2 rounded-full transition-all ${setupStep >= step ? 'bg-blue-600 ' : 'bg-slate-200 '}`} />
 ))}
 </div>
 <button 
 onClick={toggleLanguage}
 className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-medium shadow-sm text-slate-600 active:scale-95 transition-all cursor-pointer z-20"
 >
 <Globe size={12} className="text-blue-500" />
 {language === 'en' ? 'ENG' : 'KHM'}
 </button>
 </div>

 <form onSubmit={handleRegisterSubmit} className="flex-1 flex flex-col justify-between">
 
 <AnimatePresence mode="wait">
 <motion.div 
 key={setupStep}
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 transition={{ duration: 0.2 }}
 className="flex-1 flex flex-col"
 >
 
 {setupStep === 1 && (
 <div className="space-y-6">
 <div className="text-center mb-2">
 <h2 className="text-xl font-semibold text-slate-800 ">
 {language === 'en' ? 'Create Profile' : 'បង្កើតប្រវត្តិរូប'}
 </h2>
 <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
 {language === 'en' ? 'Let\'s get started' : 'តោះចាប់ផ្តើម'}
 </p>
 </div>

 {regError && (
 <div className="p-3 bg-rose-50 border border-rose-200 text-rose-500 rounded-xl text-xs font-medium flex items-center gap-1.5">
 <AlertCircle size={14} /> {regError}
 </div>
 )}

 <div className="flex flex-col items-center gap-3">
 <div className="relative group">
 {renderAvatarPreview(regAvatar, "w-20 h-20 text-4xl")}
 <button 
 type="button"
 onClick={() => regFileInputRef.current?.click()}
 className="absolute -bottom-1 -right-1 p-2 bg-blue-600 text-white rounded-xl shadow-md border-2 border-white hover:bg-blue-700 active:scale-90 transition-all cursor-pointer"
 title={t.uploadPhoto}
 >
 <Camera size={14} />
 </button>
 <input 
 type="file" 
 ref={regFileInputRef} 
 onChange={handleUploadPhoto} 
 accept="image/*" 
 className="hidden" 
 />
 </div>

 <div className="flex gap-2 flex-wrap justify-center mt-1">
 {presetAvatars.map((av) => (
 <button
 key={av.id}
 type="button"
 onClick={() => setRegAvatar(av.id)}
 className={`p-2.5 rounded-xl border text-xl transition-all cursor-pointer ${
 regAvatar === av.id 
 ? 'border-blue-500 bg-blue-50 shadow-sm scale-110' 
 : 'border-slate-200 bg-white opacity-60 hover:opacity-100'
 }`}
 >
 {av.emoji}
 </button>
 ))}
 </div>
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-medium text-slate-500 uppercase tracking-wider pl-1">{t.userName}</label>
 <input
 type="text"
 required={setupStep === 1}
 placeholder={language === 'en' ? "e.g. Udomkevin Vat" : "ឧ. វ៉ាត ឧត្តមខេវិន"}
 value={regName}
 onChange={(e) => setRegName(e.target.value)}
 className="w-full px-5 py-3.5 bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all shadow-inner"
 />
 </div>
 </div>
 )}

 {setupStep === 2 && (
 <div className="space-y-6">
 <div className="text-center mb-2">
 <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
 <KeyRound size={24} />
 </div>
 <h2 className="text-xl font-semibold text-slate-800 ">
 {language === 'en' ? 'Secure Account' : 'គណនីសុវត្ថិភាព'}
 </h2>
 <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
 {language === 'en' ? 'Set a 6-digit passcode' : 'កំណត់លេខសម្ងាត់ ៦ខ្ទង់'}
 </p>
 </div>

 {regError && (
 <div className="p-3 bg-rose-50 border border-rose-200 text-rose-500 rounded-xl text-xs font-medium flex items-center gap-1.5">
 <AlertCircle size={14} /> {regError}
 </div>
 )}

 <div className="space-y-4">
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-slate-500 uppercase tracking-wider pl-1">{t.pincode}</label>
 <input
 type="password"
 required={setupStep === 2}
 maxLength={6}
 placeholder="••••••"
 value={regPin}
 onChange={(e) => setRegPin(e.target.value.replace(/\D/gs, ''))}
 className="w-full px-5 py-4 bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold tracking-[0.5em] text-lg text-center transition-all shadow-inner"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-slate-500 uppercase tracking-wider pl-1">{language === 'en' ? 'Confirm PIN' : 'បញ្ជាក់កូដសម្ងាត់'}</label>
 <input
 type="password"
 required={setupStep === 2}
 maxLength={6}
 placeholder="••••••"
 value={regConfirmPin}
 onChange={(e) => setRegConfirmPin(e.target.value.replace(/\D/gs, ''))}
 className="w-full px-5 py-4 bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold tracking-[0.5em] text-lg text-center transition-all shadow-inner"
 />
 </div>
 </div>
 </div>
 )}

 {setupStep === 3 && (
 <div className="space-y-6">
 <div className="text-center mb-2">
 <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
 <Shield size={24} />
 </div>
 <h2 className="text-xl font-semibold text-slate-800 ">
 {language === 'en' ? 'Data Privacy' : 'ឯកជនភាពទិន្នន័យ'}
 </h2>
 <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
 {language === 'en' ? 'Review and agree' : 'ពិនិត្យនិងយល់ព្រម'}
 </p>
 </div>

 {regError && (
 <div className="p-3 bg-rose-50 border border-rose-200 text-rose-500 rounded-xl text-xs font-medium flex items-center gap-1.5">
 <AlertCircle size={14} /> {regError}
 </div>
 )}

 <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 shadow-inner">
 <h4 className="font-semibold text-sm text-slate-800 mb-2 flex items-center gap-2">
 <Check size={16} className="text-emerald-500" />
 {t.privacyAlert}
 </h4>
 <p className="text-xs leading-relaxed text-slate-600 font-medium">
 {t.healthCompliance}
 </p>
 </div>

 <label className="flex items-start gap-3 p-2 text-sm text-slate-700 font-medium cursor-pointer select-none">
 <input
 type="checkbox"
 checked={consentChecked}
 onChange={(e) => setConsentChecked(e.target.checked)}
 className="mt-1 rounded-sm text-blue-600 focus:ring-blue-500 w-5 h-5 cursor-pointer flex-shrink-0"
 />
 <span className="leading-snug">{t.consentLabel}</span>
 </label>
 </div>
 )}
 </motion.div>
 </AnimatePresence>

 <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100 ">
 {setupStep > 1 && (
 <button
 type="button"
 onClick={() => { setRegError(''); setSetupStep(prev => prev - 1); }}
 className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 :bg-slate-700 text-slate-700 font-medium rounded-2xl transition-all cursor-pointer active:scale-95"
 >
 {language === 'en' ? 'Back' : 'ត្រឡប់'}
 </button>
 )}
 
 {setupStep < 3 ? (
 <button
 type="button"
 onClick={() => {
 setRegError('');
 if (setupStep === 1 && !regName.trim()) {
 setRegError(language === 'en' ? "Please enter your name" : "សូមបញ្ចូលឈ្មោះរបស់អ្នក");
 return;
 }
 if (setupStep === 2) {
 if (regPin.length !== 6) {
 setRegError(language === 'en' ? "Passcode must be 6 digits" : "លេខកូដត្រូវមាន ៦ខ្ទង់");
 return;
 }
 if (regPin !== regConfirmPin) {
 setRegError(t.notMatch);
 return;
 }
 }
 setSetupStep(prev => prev + 1);
 }}
 className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 :bg-blue-600 text-white font-semibold rounded-2xl shadow-md transition-all cursor-pointer active:scale-95"
 >
 {language === 'en' ? 'Continue' : 'បន្ត'}
 </button>
 ) : (
 <button
 type="submit"
 className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 :bg-emerald-600 text-white font-semibold rounded-2xl shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
 >
 <Check size={18} />
 {language === 'en' ? 'Finish Setup' : 'បញ្ចប់ការរៀបចំ'}
 </button>
 )}
 </div>
 </form>
 </div>
 )}

 </div>
 </div>
 );
}
