import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { UserProfile, Reminder, PillHistoryEntry } from '../types';
import { 
  User, Camera, Lock, Shield, Calendar, Activity, 
  Heart, Plus, Trash2, CheckCircle2, RefreshCw, LogOut,
  Dna, Award, Pill, FileText, Check, AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Profile() {
  const { t, language } = useLanguage();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    avatarUrl: 'default_1',
    pinCode: '',
    isSetup: false,
    consentAccepted: false,
    gender: 'Other',
    bloodType: 'O+',
    height: '',
    weight: '',
    allergies: '',
    conditions: '',
    notes: '',
    birthDate: ''
  });

  const [activeSubTab, setActiveSubTab] = useState<'info' | 'medical' | 'adherence' | 'privacy'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editGender, setEditGender] = useState('Other');
  const [editBloodType, setEditBloodType] = useState('O+');
  const [editHeight, setEditHeight] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editAllergies, setEditAllergies] = useState('');
  const [editConditions, setEditConditions] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editAvatar, setEditAvatar] = useState('default_1');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [confirmReset, setConfirmReset] = useState(false);

  // Security Form State
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [newPinConfirm, setNewPinConfirm] = useState('');
  const [pinChangeMessage, setPinChangeMessage] = useState({ text: '', isError: false });

  // Stats from Medication Reminders
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [history, setHistory] = useState<PillHistoryEntry[]>([]);

  // Selected preset avatars
  const presetAvatars = [
    { id: 'default_1', emoji: '🧑‍⚕️', bg: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600' },
    { id: 'default_2', emoji: '👨‍⚕️', bg: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600' },
    { id: 'default_3', emoji: '👩‍⚕️', bg: 'bg-purple-100 dark:bg-purple-950/40 text-purple-600' },
    { id: 'default_4', emoji: '🧑', bg: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600' },
    { id: 'default_5', emoji: '🩺', bg: 'bg-amber-100 dark:bg-amber-950/40 text-amber-500' },
  ];

  useEffect(() => {
    // Load profile
    const savedProfile = localStorage.getItem('camhealth_profile');
    if (savedProfile) {
      try {
        const loaded = JSON.parse(savedProfile) as UserProfile;
        setProfile(loaded);
        syncEditFields(loaded);
      } catch (e) {
        console.error("Failed to load profile", e);
      }
    }

    // Load Reminders stats
    const savedReminders = localStorage.getItem('camhealth_reminders');
    const savedHistory = localStorage.getItem('camhealth_pill_history');
    if (savedReminders) {
      try { setReminders(JSON.parse(savedReminders)); } catch (e) {}
    }
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) {}
    }
  }, []);

  const syncEditFields = (p: UserProfile) => {
    setEditName(p.name || '');
    setEditDob(p.birthDate || '');
    setEditGender(p.gender || 'Other');
    setEditBloodType(p.bloodType || 'O+');
    setEditHeight(p.height || '');
    setEditWeight(p.weight || '');
    setEditAllergies(p.allergies || '');
    setEditConditions(p.conditions || '');
    setEditNotes(p.notes || '');
    setEditAvatar(p.avatarUrl || 'default_1');
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      alert(language === 'en' ? "Please enter your name" : "សូមបញ្ចូលឈ្មោះរបស់អ្នក");
      return;
    }

    const updated = {
      ...profile,
      name: editName,
      birthDate: editDob,
      gender: editGender,
      bloodType: editBloodType,
      height: editHeight,
      weight: editWeight,
      allergies: editAllergies,
      conditions: editConditions,
      notes: editNotes,
      avatarUrl: editAvatar,
    };

    setProfile(updated);
    localStorage.setItem('camhealth_profile', JSON.stringify(updated));
    setIsEditing(false);
  };

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPinInput !== profile.pinCode) {
      setPinChangeMessage({
        text: language === 'en' ? 'Old PIN is incorrect' : 'លេខកូដចាស់មិនត្រឹមត្រូវទេ',
        isError: true
      });
      return;
    }
    if (newPinInput.length !== 6 || !/^\d+$/.test(newPinInput)) {
      setPinChangeMessage({
        text: language === 'en' ? 'New PIN must be exactly 6 digits' : 'លេខកូដថ្មីត្រូវមាន ៦ខ្ទង់',
        isError: true
      });
      return;
    }
    if (newPinInput !== newPinConfirm) {
      setPinChangeMessage({
        text: language === 'en' ? 'New PIN confirmations do not match' : 'ការបញ្ជាក់លេខកូដថ្មីមិនត្រូវគ្នាទេ',
        isError: true
      });
      return;
    }

    const updated = {
      ...profile,
      pinCode: newPinInput
    };
    setProfile(updated);
    localStorage.setItem('camhealth_profile', JSON.stringify(updated));
    
    // Reset Form
    setCurrentPinInput('');
    setNewPinInput('');
    setNewPinConfirm('');
    setPinChangeMessage({
      text: language === 'en' ? 'PIN changed successfully!' : 'ផ្លាស់ប្តូរលេខកូដជោគជ័យ!',
      isError: false
    });
    setTimeout(() => {
      setPinChangeMessage({ text: '', isError: false });
    }, 4500);
  };

  const handleLockSession = () => {
    // Dispatch lock event or reload page to activate lock screen
    localStorage.removeItem('camhealth_session');
    window.location.reload();
  };

  // Stats calculation
  const totalLogs = history.length;
  const takenLogs = history.filter(h => h.status === 'taken').length;
  const missedLogs = history.filter(h => h.status === 'missed').length;
  const skippedLogs = history.filter(h => h.status === 'skipped').length;
  const adherenceRate = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 100;

  const chartData = [
    { name: t.taken, value: takenLogs || 1, color: '#10b981' }, // emerald-500
    { name: t.missed, value: missedLogs, color: '#f43f5e' }, // rose-500
    { name: language === 'en' ? 'Skipped' : 'រំលងចោល', value: skippedLogs, color: '#f59e0b' } // amber-500
  ].filter(item => item.value > 0);

  // Avatar renderer helper
  const renderAvatar = (url: string, sizeClass = "w-20 h-20 text-4xl") => {
    if (url.startsWith('data:image')) {
      return (
        <img 
          src={url} 
          alt="Avatar" 
          className={`${sizeClass} rounded-full object-cover ring-2 ring-blue-500/10 shadow-md bg-white`} 
        />
      );
    }
    
    const preset = presetAvatars.find(p => p.id === url) || presetAvatars[0];
    return (
      <div className={`${sizeClass} ${preset.bg} rounded-full flex items-center justify-center shadow-inner font-medium`}>
        {preset.emoji}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto pb-10 transition-colors relative">
      
      {/* Redesigned Premium Header Card & Bio Section */}
      <div className="px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-6 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60 transition-colors">
        <div className="max-w-4xl mx-auto w-full space-y-5">
          
          {/* Authentic Cambodia National Health ID Card */}
          <div className="bg-gradient-to-br from-blue-700 to-indigo-900 dark:from-slate-900 dark:to-slate-950 p-5 sm:p-6 rounded-[24px] text-white shadow-xl relative overflow-hidden border border-white/10 dark:border-white/5">
            {/* Artistic watermark element */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
            <div className="absolute -right-20 -top-20 w-52 h-52 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -left-20 -bottom-20 w-44 h-44 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col justify-between gap-5 text-left">
              {/* Card Title Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-xl shadow-inner shrink-0">
                    🇰🇭
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold tracking-widest text-blue-200 uppercase leading-none">
                      {language === 'en' ? 'Kingdom of Cambodia' : 'ព្រះរាជាណាចក្រកម្ពុជា'}
                    </p>
                    <h3 className="text-xs sm:text-sm font-bold text-white/95 mt-1 leading-none">
                      {language === 'en' ? 'CamHealth Wallet' : 'កាបូបព័ត៌មានខេមហេល'}
                    </h3>
                  </div>
                </div>
                
                {/* Real-time Status Badge */}
                <div className="shrink-0 flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[9px] font-semibold text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 relative">
                    <span className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></span>
                  </span>
                  {language === 'en' ? 'Encrypted' : 'កូដនីយកម្ម'}
                </div>
              </div>

              {/* Card Personal Details */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
                <div className="relative group shrink-0">
                  {renderAvatar(isEditing ? editAvatar : (profile.avatarUrl || 'default_1'), "w-24 h-24 sm:w-28 sm:h-28 text-5xl sm:text-6xl ring-4 ring-white/15 dark:ring-slate-800 shadow-md")}
                  {isEditing && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 p-2 bg-blue-600 text-white rounded-xl shadow-lg border border-white dark:border-slate-800 hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
                      title={t.uploadPhoto}
                    >
                      <Camera size={14} />
                    </button>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleUploadPhoto} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>

                <div className="flex-1 min-w-0 w-full text-center sm:text-left space-y-2">
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder={t.userName}
                        className="bg-white/10 dark:bg-slate-800/80 border border-white/20 text-white font-semibold text-lg sm:text-xl px-3 py-1 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 placeholder-white/50 w-full max-w-sm text-center sm:text-left"
                      />
                    ) : (
                      <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white line-clamp-1">
                        {profile.name || (language === 'en' ? "CamHealth User" : "អ្នកប្រើប្រាស់ CamHealth")}
                      </h2>
                    )}
                    <p className="text-[10px] sm:text-xs text-blue-200/70 font-mono mt-1 tracking-wider uppercase">
                      ID: KH-HWS-{(profile.birthDate?.replace(/-/g, '') || '960523')}-{profile.bloodType || 'O'}
                    </p>
                  </div>

                  {/* Smart Vitals quick stats inside card */}
                  <div className="grid grid-cols-3 gap-2.5 max-w-sm mx-auto sm:mx-0 pt-1.5">
                    <div className="bg-white/5 border border-white/5 py-1 px-2 rounded-xl text-center">
                      <span className="text-[8px] text-blue-200/65 block uppercase tracking-wider font-semibold">{t.bloodType}</span>
                      <span className="text-[11px] sm:text-xs font-bold text-white">{profile.bloodType || '—'}</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 py-1 px-2 rounded-xl text-center">
                      <span className="text-[8px] text-blue-200/65 block uppercase tracking-wider font-semibold">{language === 'en' ? 'Height' : 'កម្ពស់'}</span>
                      <span className="text-[11px] sm:text-xs font-bold text-white">{profile.height ? `${profile.height} cm` : '—'}</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 py-1 px-2 rounded-xl text-center">
                      <span className="text-[8px] text-blue-200/65 block uppercase tracking-wider font-semibold">{language === 'en' ? 'Weight' : 'ទម្ងន់'}</span>
                      <span className="text-[11px] sm:text-xs font-bold text-white">{profile.weight ? `${profile.weight} kg` : '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings / Controls Bar underneath */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-1">
            {/* Bottom meta tag */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100/75 dark:bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-200/40 dark:border-slate-700/30 self-stretch sm:self-auto">
              <span className="text-sm">🛡️</span>
              <span className="truncate">
                {profile.conditions ? `🩺 ${profile.conditions}` : (language === 'en' ? 'Smart Healthcare Solutions for Cambodia' : 'សេវាសុខភាពឆ្លាតវៃ សម្រាប់ប្រជាជនកម្ពុជា')}
              </span>
            </div>

            {/* Quick Actions Buttons */}
            <div className="flex items-center gap-2.5">
              {isEditing ? (
                <>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      syncEditFields(profile);
                    }}
                    className="flex-1 sm:flex-none px-4 py-2.5 text-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-xs cursor-pointer transition-colors"
                  >
                    {language === 'en' ? 'Cancel' : 'បោះបង់'}
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
                  >
                    <Check size={14} /> {language === 'en' ? 'Save' : 'រក្សាទុក'}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 rounded-xl font-semibold text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    {language === 'en' ? 'Edit Health Profile' : 'កែប្រែប្រវត្តិរូប'}
                  </button>
                  <button 
                    onClick={handleLockSession}
                    className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl transition-all flex items-center justify-center shadow-sm cursor-pointer"
                    title={t.lockApp}
                  >
                    <LogOut size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Modern, Highly Responsive Segmented Swiper Sub-Navigation */}
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/80 transition-colors py-3">
         <div className="max-w-4xl mx-auto px-4">
           {/* Horizontally scrollable segmented bar on mobile, elegant grid on desktop */}
           <div className="bg-slate-200/65 dark:bg-slate-800/60 p-1.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto no-scrollbar md:grid md:grid-cols-4 md:gap-3">
             {[
               { id: 'info', label: t.basicInfo, icon: User },
               { id: 'medical', label: t.medicalHistory, icon: FileText },
               { id: 'adherence', label: t.adherenceOverview, icon: Award },
               { id: 'privacy', label: t.privacyAlert, icon: Shield }
             ].map((tab) => {
               const Icon = tab.icon;
               const active = activeSubTab === tab.id;
               return (
                 <button
                   key={tab.id}
                   onClick={() => setActiveSubTab(tab.id as any)}
                   className={`min-w-[130px] sm:min-w-0 md:w-full py-2.5 sm:py-3.5 px-3.5 flex items-center justify-center gap-2 rounded-xl font-bold text-xs cursor-pointer transition-all flex-shrink-0 select-none ${
                     active 
                       ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5' 
                       : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/35 dark:hover:bg-slate-700/20'
                   }`}
                 >
                   <Icon size={14} className={active ? "text-blue-600 dark:text-blue-400 shrink-0" : "opacity-60 shrink-0"} />
                   <span className="truncate leading-none">{tab.label}</span>
                 </button>
               );
             })}
           </div>
         </div>
      </div>

      {/* Inner Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 w-full mt-6">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* TAB 1: BASIC INFORMATION */}
          {activeSubTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Form: Edit Fields */}
              <div className="md:col-span-2 space-y-4 bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 transition-colors">
                <h3 className="font-medium text-slate-800 dark:text-white text-base sm:text-lg mb-3 flex items-center gap-2">
                  <User size={18} className="text-blue-500" />
                  {t.basicInfo}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name field (if not in medical tab) */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t.userName}</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
                      />
                    ) : (
                      <div className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-white border border-transparent rounded-xl font-medium text-sm transition-colors break-words">
                        {editName || '—'}
                      </div>
                    )}
                  </div>

                  {/* DOB */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t.dob}</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editDob}
                        onChange={(e) => setEditDob(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
                      />
                    ) : (
                      <div className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-white border border-transparent rounded-xl font-medium text-sm transition-colors break-words">
                        {editDob || '—'}
                      </div>
                    )}
                  </div>

                  {/* Gender selection */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t.gender}</label>
                    {isEditing ? (
                      <select
                        value={editGender}
                        onChange={(e) => setEditGender(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
                      >
                        <option value="Male">{language === 'en' ? 'Male' : 'ប្រុស'}</option>
                        <option value="Female">{language === 'en' ? 'Female' : 'ស្រី'}</option>
                        <option value="Other">{language === 'en' ? 'Other / Prefer not to say' : 'ផ្សេងៗ / មិនបញ្ជាក់'}</option>
                      </select>
                    ) : (
                      <div className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-white border border-transparent rounded-xl font-medium text-sm transition-colors break-words">
                        {editGender === 'Male' ? (language === 'en' ? 'Male' : 'ប្រុស') : 
                         editGender === 'Female' ? (language === 'en' ? 'Female' : 'ស្រី') : 
                         (language === 'en' ? 'Other / Prefer not to say' : 'ផ្សេងៗ / មិនបញ្ជាក់')}
                      </div>
                    )}
                  </div>

                  {/* Blood Type */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t.bloodType}</label>
                    {isEditing ? (
                      <select
                        value={editBloodType}
                        onChange={(e) => setEditBloodType(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-white border border-transparent rounded-xl font-medium text-sm transition-colors break-words">
                        {editBloodType || '—'}
                      </div>
                    )}
                  </div>

                  {/* Height */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t.height}</label>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="175"
                          value={editHeight}
                          onChange={(e) => setEditHeight(e.target.value)}
                          className="w-full pl-4 pr-12 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
                        />
                        <span className="absolute right-4 top-3 text-xs font-medium text-slate-400 select-none">cm</span>
                      </div>
                    ) : (
                      <div className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-white border border-transparent rounded-xl font-medium text-sm transition-colors break-words">
                        {editHeight ? `${editHeight} cm` : '—'}
                      </div>
                    )}
                  </div>

                  {/* Weight */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t.weight}</label>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="68"
                          value={editWeight}
                          onChange={(e) => setEditWeight(e.target.value)}
                          className="w-full pl-4 pr-12 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors"
                        />
                        <span className="absolute right-4 top-3 text-xs font-medium text-slate-400 select-none">kg</span>
                      </div>
                    ) : (
                      <div className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-white border border-transparent rounded-xl font-medium text-sm transition-colors break-words">
                        {editWeight ? `${editWeight} kg` : '—'}
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block">{language === 'en' ? 'Select Preset Avatar' : 'ជ្រើសរើសរូបតំណាងគំរូ'}</label>
                    <div className="flex gap-3 flex-wrap">
                      {presetAvatars.map((av) => (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setEditAvatar(av.id)}
                          className={`p-3 rounded-xl border text-2xl transition-all duration-200 cursor-pointer ${
                            editAvatar === av.id 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-105 shadow-md' 
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {av.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Quick Vitals Cards */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-slate-800 dark:to-slate-700 p-5 rounded-3xl text-white shadow-md relative overflow-hidden transition-colors">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Heart size={120} className="stroke-white stroke-[4px]" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                      <span className="text-[10px] text-white/70 uppercase tracking-widest font-semibold block mb-1">Body Specs</span>
                      <h4 className="text-xs font-medium text-blue-100/90 leading-tight mb-4">
                        {language === 'en' ? 'Quick Personal Vitals' : 'លក្ខណសម្បត្តិទូទៅ'}
                      </h4>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                      <div className="bg-white/10 dark:bg-black/20 p-2.5 rounded-2xl border border-white/5">
                        <span className="text-[10px] text-blue-200 block mb-0.5">{language === 'en' ? 'BLOOD' : 'ក្រុមឈាម'}</span>
                        <span className="text-lg font-semibold">{profile.bloodType || '—'}</span>
                      </div>
                      <div className="bg-white/10 dark:bg-black/20 p-2.5 rounded-2xl border border-white/5">
                        <span className="text-[10px] text-blue-200 block mb-0.5">{language === 'en' ? 'HEIGHT' : 'កម្ពស់'}</span>
                        <span className="text-sm font-semibold">{profile.height ? `${profile.height} cm` : '—'}</span>
                      </div>
                      <div className="bg-white/10 dark:bg-black/20 p-2.5 rounded-2xl border border-white/5">
                        <span className="text-[10px] text-blue-200 block mb-0.5">{language === 'en' ? 'WEIGHT' : 'ទម្ងន់'}</span>
                        <span className="text-sm font-semibold">{profile.weight ? `${profile.weight} kg` : '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 transition-colors">
                  <h4 className="font-medium text-slate-800 dark:text-white text-xs uppercase tracking-wider mb-2.5 text-blue-600 flex items-center gap-1">
                    <Activity size={14} /> {language === 'en' ? 'Active Records' : 'កំណត់ត្រាសកម្ម'}
                  </h4>
                  <ul className="text-xs font-medium space-y-2 text-slate-500 dark:text-slate-400">
                    <li className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700/55">
                      <span>{t.reminders}:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{reminders.length} pills active</span>
                    </li>
                    <li className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700/55">
                      <span>{language === 'en' ? 'Self Checks:' : 'ពិនិត្យរោគសញ្ញា:'}</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{totalLogs} times logged</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MEDICAL HISTORY */}
          {activeSubTab === 'medical' && (
            <div className="space-y-4 bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 transition-colors">
              <h3 className="font-medium text-slate-800 dark:text-white text-base sm:text-lg mb-2 flex items-center gap-2">
                <Dna size={18} className="text-purple-500" />
                {t.medicalHistory}
              </h3>
              <p className="text-xs text-slate-400 leading-snug">
                {language === 'en' 
                  ? 'Keep track of chronic illnesses, chemical/drug sensitivities, or clinical diagnoses for doctor consultations.'
                  : 'កត់ត្រាជំងឺរ៉ាំរ៉ៃ ឱសថប្រតិកម្ម ឬការវិនិច្ឆ័យរោគពីគ្រូពេទ្យ ដើម្បីងាយស្រួលពិគ្រោះយោបល់នាពេលក្រោយ។'}
              </p>

              <div className="space-y-4 mt-4">
                {/* Allergies / sensitivities */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 text-amber-500">
                    🛡️ {t.allergies}
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={editAllergies}
                      onChange={(e) => setEditAllergies(e.target.value)}
                      placeholder={language === 'en' ? "penicillin, peanuts, seafood..." : "ថ្នាំ Penicillin, សណ្តែកដី, អាហារសមុទ្រ..."}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-xs sm:text-sm text-slate-800 dark:text-white transition-colors"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-slate-700 dark:text-slate-300 font-medium text-xs sm:text-sm min-h-12 border border-slate-200/40 dark:border-slate-700/30">
                      {profile.allergies || (language === 'en' ? 'No known allergies reported.' : 'មិនមានកំណត់ត្រាប្រតិកម្មថ្នាំ ឬចំណីអាហារទេ។')}
                    </div>
                  )}
                </div>

                {/* Chronic Conditions */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 text-blue-500">
                    🩺 {t.chronicConditions}
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={editConditions}
                      onChange={(e) => setEditConditions(e.target.value)}
                      placeholder={language === 'en' ? "hypertension, type 2 diabetes, asthma..." : "ជំងឺលើសឈាម, ទឹកនោមផ្អែម, ហឺត..."}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-xs sm:text-sm text-slate-800 dark:text-white transition-colors"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-slate-700 dark:text-slate-300 font-medium text-xs sm:text-sm min-h-12 border border-slate-200/40 dark:border-slate-700/30">
                      {profile.conditions || (language === 'en' ? 'No chronic conditions recorded.' : 'មិនមានប្រវត្តិជំងឺរ៉ាំរ៉ៃទេ។')}
                    </div>
                  )}
                </div>

                {/* General Medical Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 text-purple-500">
                    📝 {t.generalNotes}
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder={language === 'en' ? "Family medical history, regular surgeries, current medication prescriptions..." : "ប្រវត្តិសុខភាពគ្រួសារ, ការវះកាត់ធ្លាប់ធ្វើ, វេជ្ជបញ្ជាថ្នាំលេបប្រចាំកាយ..."}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-xs sm:text-sm text-slate-800 dark:text-white transition-colors"
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-slate-700 dark:text-slate-300 font-medium text-xs sm:text-sm min-h-20 border border-slate-200/40 dark:border-slate-700/30">
                      {profile.notes || (language === 'en' ? 'No medical notes registered.' : 'មិនមានកំណត់ត្រាបន្ថែមទេ។')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEDICATION REMINDERS & ADHERENCE */}
          {activeSubTab === 'adherence' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Adherence Score Ring */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 flex flex-col items-center justify-center text-center transition-colors">
                <h4 className="font-medium text-slate-800 dark:text-white text-xs sm:text-sm uppercase tracking-wider mb-4 text-blue-500 flex items-center gap-1.5">
                  <Award size={16} /> Adherence Level
                </h4>

                <div className="w-40 h-40 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { value: adherenceRate, color: '#2563eb' },
                          { value: 100 - adherenceRate, color: '#e2e8f0' }
                        ]}
                        innerRadius={55}
                        outerRadius={70}
                        paddingAngle={0}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        <Cell key="cell-0" fill={adherenceRate > 75 ? "#10b981" : adherenceRate > 40 ? "#f59e0b" : "#f43f5e"} />
                        <Cell key="cell-1" fill="#e2e8f0" className="dark:fill-slate-700" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-semibold text-slate-800 dark:text-white">{adherenceRate}%</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      {adherenceRate > 80 ? 'Excellent' : adherenceRate > 50 ? 'Regular' : 'Needs Care'}
                    </span>
                  </div>
                </div>

                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-4 leading-normal">
                  {language === 'en' 
                    ? 'Adherence is calculated based on pill intake confirmation logs.' 
                    : 'កម្រិតគោរពវិន័យថ្នាំ ល្អបំផុតគឺនៅពេលដែលលោកអ្នកលេបថ្នាំទៀងទាត់តាមម៉ោងរំលឹក។'}
                </p>
              </div>

              {/* Stats Log Info */}
              <div className="md:col-span-2 space-y-4 bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 transition-colors">
                <h3 className="font-medium text-slate-800 dark:text-white text-base sm:text-lg border-b border-slate-100 dark:border-slate-700 pb-2.5 flex items-center gap-2">
                  <Pill size={18} className="text-amber-500 animate-bounce" />
                  {language === 'en' ? 'Intake Log Statistics' : 'ស្ថិតិកំណត់ត្រាលេបថ្នាំ'}
                </h3>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-medium text-slate-400 block mb-0.5">{t.taken}</span>
                    <span className="text-2xl font-semibold text-emerald-500">{takenLogs}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-medium text-slate-400 block mb-0.5">{t.missed}</span>
                    <span className="text-2xl font-semibold text-rose-500">{missedLogs}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-medium text-slate-400 block mb-0.5">{language === 'en' ? 'Skipped' : 'រំលងចោល'}</span>
                    <span className="text-2xl font-semibold text-amber-500">{skippedLogs}</span>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <h4 className="text-xs font-medium text-slate-400 uppercase tracking-widest">{language === 'en' ? 'Recent History Logs' : 'ប្រវត្តិកាលលេបថ្នាំចុងក្រោយ'}</h4>
                  {history.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60 text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {history.slice(0, 5).map((h) => (
                        <div key={h.id} className="py-2.5 flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 dark:text-slate-100">{h.medicineName}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{new Date(h.takenAt).toLocaleDateString()} at {h.scheduledTime}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            h.status === 'taken' 
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                              : h.status === 'missed' 
                              ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' 
                              : 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                          }`}>
                            {h.status === 'taken' ? t.taken : h.status === 'missed' ? t.missed : (language === 'en' ? 'Skipped' : 'លុបចោល')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2">{language === 'en' ? 'No history logs captured yet.' : 'មិនទាន់មានប្រវត្តិកាលលេបថ្នាំនៅឡើយទេ។'}</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: SECURITY & HEALTH DATA REGULATIONS */}
          {activeSubTab === 'privacy' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* PIN Settings */}
              <div className="md:col-span-2 space-y-4 bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 transition-colors">
                <h3 className="font-medium text-slate-800 dark:text-white text-base sm:text-lg mb-2 flex items-center gap-2">
                  <Lock size={18} className="text-amber-500" />
                  {t.pinReset}
                </h3>
                
                <form onSubmit={handleChangePin} className="space-y-4">
                  {pinChangeMessage.text && (
                    <div className={`p-3 rounded-xl text-xs font-medium border ${
                      pinChangeMessage.isError 
                        ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800 text-rose-500' 
                        : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-500'
                    }`}>
                      {pinChangeMessage.text}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{language === 'en' ? 'Enter Current PIN (6 digits)' : 'បញ្ចូលលេខកូដបច្ចុប្បន្ន (៦ខ្ទង់)'}</label>
                    <input
                      type="password"
                      maxLength={6}
                      value={currentPinInput}
                      onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/gs, ''))}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium tracking-wider text-sm transition-colors"
                      placeholder="••••••"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{language === 'en' ? 'New PIN (6 digits)' : 'បញ្ចូលលេខកូដថ្មី (៦ខ្ទង់)'}</label>
                      <input
                        type="password"
                        maxLength={6}
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value.replace(/\D/gs, ''))}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium tracking-wider text-sm transition-colors"
                        placeholder="••••••"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{language === 'en' ? 'Confirm New PIN' : 'បញ្ជាក់លេខកូដថ្មី'}</label>
                      <input
                        type="password"
                        maxLength={6}
                        value={newPinConfirm}
                        onChange={(e) => setNewPinConfirm(e.target.value.replace(/\D/gs, ''))}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium tracking-wider text-sm transition-colors"
                        placeholder="••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 font-medium text-slate-950 rounded-xl cursor-pointer shadow-sm active:scale-95 transition-transform text-xs uppercase tracking-wider"
                  >
                    {t.changePin}
                  </button>
                </form>
              </div>

              {/* GDPR / HIPAA statement & Reset Info */}
              <div className="space-y-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                  <h4 className="font-medium text-slate-800 dark:text-white text-xs uppercase tracking-wider mb-2.5 text-blue-600 flex items-center gap-1.5">
                    <Shield size={14} /> HIPAA & GDPR Compliance
                  </h4>
                  <p className="text-[11px] sm:text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                    {t.healthCompliance}
                  </p>
                  <p className="text-[11px] sm:text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-medium mt-3">
                    {language === 'en'
                      ? 'The 6-digit passcode ensures local encryption and limits physical entry. Your medical data, diagnostic logs, and custom schedules are sandboxed and fully offline-secure.'
                      : 'លេខកូដសម្ងាត់ ៦ខ្ទង់ ធានាសុវត្ថិភាពទិន្នន័យពីការជ្រៀតជ្រែកដោយផ្ទាល់។ ព័ត៌មានសុខភាព និងកាលវិភាគរបស់អ្នកត្រូវបានចាក់សោក្នុងឧបករណ៍របស់អ្នកយ៉ាងរឹងមាំបំផុត។'}
                  </p>
                </div>

                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-3xl text-rose-500">
                  <h4 className="font-medium text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                    <AlertTriangle size={14} /> {language === 'en' ? 'Danger Zone' : 'តំបន់គ្រោះថ្នាក់'}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] leading-snug font-medium mb-3">
                    {language === 'en'
                      ? 'Resetting your local database will permanently wipe your pills reminders, medication log charts, and local medical documents. This is irreversible.'
                      : 'ការកំណត់ឡើងវិញរបស់ទិន្នន័យនឹងលុបចោលការរំលឹកថ្នាំ ប្រវត្តិលេបថ្នាំ និងកំណត់ត្រាសុខភាពទាំងអស់។'}
                  </p>
                  <button
                    onClick={() => {
                      if (confirmReset) {
                        localStorage.clear();
                        window.location.reload();
                      } else {
                        setConfirmReset(true);
                        setTimeout(() => setConfirmReset(false), 5000);
                      }
                    }}
                    className={`px-3.5 py-1.5 font-medium text-[10px] rounded-lg tracking-wider transition-all ${confirmReset ? 'bg-black text-rose-500 border border-rose-500 animate-pulse' : 'bg-rose-600 hover:bg-rose-700 text-white'}`}
                  >
                    {confirmReset 
                      ? (language === 'en' ? 'TAP AGAIN TO CONFIRM' : 'ចុចម្តងទៀតដើម្បីបញ្ជាក់') 
                      : ` ${language === 'en' ? 'RESET ALL DATABASE' : 'សម្អាតទិន្នន័យទាំងអស់'}`
                    }
                  </button>
                </div>
              </div>

            </div>
          )}

        </motion.div>
      </div>

    </div>
  );
}
