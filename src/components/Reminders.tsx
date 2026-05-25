import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { Reminder, PillTime, PillHistoryEntry } from '../types';
import { Bell, Plus, Trash2, Clock, Pill, Camera, CheckCircle, XCircle, History, TrendingUp, Calendar as CalendarIcon, Info, Check, BellRing } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

function isToday(dateString: string) {
  const d = new Date(dateString);
  const today = new Date();
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
}

export const translateOption = (val: string, language: 'en' | 'km'): string => {
  if (!val) return val;
  const map: Record<string, string> = {
    '1 Pill': '១ គ្រាប់',
    '2 Pills': '២ គ្រាប់',
    '0.5 Pill': '០.៥ គ្រាប់',
    '1 Tablet': '១ គ្រាប់',
    '1 Capsule': '១ គ្រាប់កន្សោម',
    '5 ml': '៥ មីលីលីត្រ',
    '10 ml': '១០ មីលីលីត្រ',
    '1 Spoon': '១ ស្លាបព្រា',
    'Before food (empty stomach)': 'មុនអាហារ (ពោះទទេ)',
    'After food': 'ក្រោយអាហារ',
    'With food': 'ជាមួយអាហារ',
    'Before bedtime': 'មុនចូលគេង',
    'In the morning': 'ពេលព្រឹក',
    'Do not crush': 'កុំបុក ឬកិនបំបែក',
    'Daily': 'រៀងរាល់ថ្ងៃ',
    'Twice a day': 'ពីរដងក្នុងមួយថ្ងៃ',
    'Three times a day': 'បីដងក្នុងមួយថ្ងៃ',
    'Every 8 hours': 'រៀងរាល់ ៨ ម៉ោងម្តង',
    'Every 12 hours': 'រៀងរាល់ ១២ ម៉ោងម្តង',
    'Once a week': 'ម្តងក្នុងមួយសប្តាហ៍',
    'As needed (PRN)': 'នៅពេលត្រូវការ (តាមការចាំបាច់)',
    '3 days': '៣ ថ្ងៃ',
    '5 days': '៥ ថ្ងៃ',
    '7 days': '៧ ថ្ងៃ',
    '10 days': '១០ ថ្ងៃ',
    '14 days': '១៤ ថ្ងៃ',
    '30 days': '៣០ ថ្ងៃ',
    'Until finished': 'រហូតអស់ថ្នាំ',

    '១ គ្រាប់': '1 Pill',
    '២ គ្រាប់': '2 Pills',
    '០.៥ គ្រាប់': '0.5 Pill',
    '១ គ្រាប់កន្សោម': '1 Capsule',
    '៥ មីលីលីត្រ': '5 ml',
    '១០ មីលីលីត្រ': '10 ml',
    '១ ស្លាបព្រា': '1 Spoon',
    'មុនអាហារ (ពោះទទេ)': 'Before food (empty stomach)',
    'ក្រោយអាហារ': 'After food',
    'ជាមួយអាហារ': 'With food',
    'មុនចូលគេង': 'Before bedtime',
    'ពេលព្រឹក': 'In the morning',
    'កុំបុក ឬកិនបំបែក': 'Do not crush',
    'រៀងរាល់ថ្ងៃ': 'Daily',
    'ពីរដងក្នុងមួយថ្ងៃ': 'Twice a day',
    'បីដងក្នុងមួយថ្ងៃ': 'Three times a day',
    'រៀងរាល់ ៨ ម៉ោងម្តង': 'Every 8 hours',
    'រៀងរាល់ ១២ ម៉ោងម្តង': 'Every 12 hours',
    'ម្តងក្នុងមួយសប្តាហ៍': 'Once a week',
    'នៅពេលត្រូវការ (តាមការចាំបាច់)': 'As needed (PRN)',
    '៣ ថ្ងៃ': '3 days',
    '៥ ថ្ងៃ': '5 days',
    '៧ ថ្ងៃ': '7 days',
    '១០ ថ្ងៃ': '10 days',
    '១៤ ថ្ងៃ': '14 days',
    '៣០ ថ្ងៃ': '30 days',
    'រហូតអស់ថ្នាំ': 'Until finished',
  };

  if (language === 'km') {
    return map[val] || val;
  } else {
    const entry = Object.entries(map).find(([k, v]) => v === val);
    if (entry) {
      return entry[0];
    }
    return map[val] || val;
  }
};

interface SelectableInputProps {
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}

function SelectableInput({ placeholder, value, onChange, options }: SelectableInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-4 pr-10 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm font-medium transition-colors"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 max-h-48 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-1.5 duration-150">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Reminders() {
  const { language, t } = useLanguage();
  const isKhmer = language === 'km';
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [history, setHistory] = useState<PillHistoryEntry[]>([]);
  const [view, setView] = useState<'list' | 'add' | 'history'>('list');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'ongoing'>('all');
  
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const [activePillAlert, setActivePillAlert] = useState<{
    medicineName: string;
    dosage: string;
    instruction: string;
    time: string;
  } | null>(null);

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gainNode.gain.setValueAtTime(0.12, start);
        gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.start(start);
        osc.stop(start + duration);
      };
      playTone(523.25, audioCtx.currentTime, 0.4); // C5
      playTone(659.25, audioCtx.currentTime + 0.15, 0.5); // E5
      playTone(783.99, audioCtx.currentTime + 0.3, 0.6); // G5
    } catch (e) {
      console.error('Failed to play chime audio', e);
    }
  };

  const testReminder = () => {
    playChime();
    setActivePillAlert({
      medicineName: language === 'en' ? 'Amoxicillin (Health Test)' : 'អាម៉ុកស៊ីស៊ីលីន (សាកល្បងវេជ្ជសាស្ត្រ)',
      dosage: language === 'en' ? '500mg' : '៥០០ មីលីក្រាម',
      instruction: language === 'en' ? 'Take before food with warm water' : 'ញ៉ាំមុនបាយជាមួយទឹកក្តៅឧណ្ហៗ',
      time: '08:00'
    });
  };

  useEffect(() => {
     if (isConfirmingClear) {
        const timer = setTimeout(() => setIsConfirmingClear(false), 3000);
        return () => clearTimeout(timer);
     }
  }, [isConfirmingClear]);

  const remindersRef = useRef(reminders);
  const historyRef = useRef(history);
  
  useEffect(() => {
     remindersRef.current = reminders;
     historyRef.current = history;
  }, [reminders, history]);
  
  // Add Form State
  const [newMed, setNewMed] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newInstruction, setNewInstruction] = useState('');
  const [newFrequency, setNewFrequency] = useState(isKhmer ? 'រៀងរាល់ថ្ងៃ' : 'Daily');
  const [newDuration, setNewDuration] = useState(isKhmer ? '៧ ថ្ងៃ' : '7 days');
  const [newTimes, setNewTimes] = useState<PillTime[]>([{ id: '1', time: '08:00' }]);
  const [newPhoto, setNewPhoto] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
     setNewFrequency(isKhmer ? 'រៀងរាល់ថ្ងៃ' : 'Daily');
     setNewDuration(isKhmer ? '៧ ថ្ងៃ' : '7 days');
  }, [language, isKhmer]);

  useEffect(() => {
    const saved = localStorage.getItem('camhealth_reminders');
    const savedHistory = localStorage.getItem('camhealth_pill_history');
    if (saved) {
       try { setReminders(JSON.parse(saved)); } catch(e) {}
    }
    if (savedHistory) {
       try { setHistory(JSON.parse(savedHistory)); } catch(e) {}
    }
    const handleStorageChange = () => {
      const savedNew = localStorage.getItem('camhealth_reminders');
      const savedHistoryNew = localStorage.getItem('camhealth_pill_history');
      if (savedNew) {
         try { setReminders(JSON.parse(savedNew)); } catch(e) {}
      }
      if (savedHistoryNew) {
         try { setHistory(JSON.parse(savedHistoryNew)); } catch(e) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    if ('Notification' in window && Notification.permission === 'default') {
       try {
         Notification.requestPermission().catch(() => {});
       } catch (e) {}
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Update current time occasionally
  useEffect(() => {
      const intervalId = setInterval(() => {
          setCurrentTime(new Date());
      }, 30000); // 30s
      return () => clearInterval(intervalId);
  }, []);

  // Alert checking and auto-miss processing
  useEffect(() => {
     const interval = setInterval(() => {
        const now = new Date();
        const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const currentRems = remindersRef.current;
        let historyChanged = false;
        let updatedHistory = [...historyRef.current];
        
        const isExactMinute = now.getSeconds() === 0;

        currentRems.filter(r => r.isActive).forEach(rem => {
           rem.times.forEach(pt => {
              const loggedToday = updatedHistory.find(h => h.reminderId === rem.id && h.scheduledTime === pt.time && isToday(h.takenAt));
              
              if (!loggedToday) {
                 if (isExactMinute && pt.time === currentTimeStr) {
                     playChime();
                     setActivePillAlert({
                        medicineName: rem.medicineName,
                        dosage: rem.dosage,
                        instruction: rem.instruction,
                        time: pt.time
                     });
                    if ('Notification' in window && Notification.permission === 'granted') {
                       new Notification(`Time for Medicine: ${rem.medicineName}`, {
                          body: `Dosage: ${rem.dosage || '1'}\n${rem.instruction}`,
                          icon: '/favicon.ico'
                       });
                    }
                 }
                 
                 const [h, m] = pt.time.split(':').map(Number);
                 const scheduleTime = new Date();
                 scheduleTime.setHours(h, m, 0, 0);
                 const diffMinutes = (now.getTime() - scheduleTime.getTime()) / 60000;
                 
                 // If 60+ minutes passed and not logged, mark missed automatically
                 if (diffMinutes >= 60) {
                     updatedHistory.unshift({
                        id: Date.now().toString() + Math.random().toString(),
                        reminderId: rem.id,
                        medicineName: rem.medicineName,
                        takenAt: new Date().toISOString(),
                        scheduledTime: pt.time,
                        status: 'missed'
                     });
                     historyChanged = true;
                 }
              }
           });
        });
        
        if (historyChanged) {
            setHistory(updatedHistory);
            localStorage.setItem('camhealth_pill_history', JSON.stringify(updatedHistory));
        }
     }, 1000);
     return () => clearInterval(interval);
  }, []);

  const saveReminders = (newRems: Reminder[]) => {
    setReminders(newRems);
    localStorage.setItem('camhealth_reminders', JSON.stringify(newRems));
  };
  const saveHistoryList = (newHist: PillHistoryEntry[]) => {
    setHistory(newHist);
    localStorage.setItem('camhealth_pill_history', JSON.stringify(newHist));
  };

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
        const reader = new FileReader();
        reader.onloadend = () => { setNewPhoto(reader.result as string); };
        reader.readAsDataURL(file);
     }
  };

  const handleAdd = () => {
    if (!newMed.trim()) return;
    const item: Reminder = {
      id: Date.now().toString(),
      medicineName: newMed,
      dosage: newDosage,
      instruction: newInstruction,
      frequency: newFrequency,
      duration: newDuration,
      times: newTimes,
      photoUrl: newPhoto,
      isActive: true
    };
    saveReminders([...reminders, item]);
    setView('list');
    setNewMed(''); setNewDosage(''); setNewInstruction('');
    setNewPhoto(undefined); setNewTimes([{ id: '1', time: '08:00' }]);
  };

  const toggleReminder = (id: string) => {
    saveReminders(reminders.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };
  
  const deleteReminder = (id: string) => {
    saveReminders(reminders.filter(r => r.id !== id));
  };

  const logPill = (reminderId: string, medicineName: string, scheduledTime: string, status: 'taken' | 'missed') => {
     const entry: PillHistoryEntry = {
        id: Date.now().toString(),
        reminderId,
        medicineName,
        takenAt: new Date().toISOString(),
        scheduledTime,
        status
     };
     saveHistoryList([entry, ...history]);
  };

  const addTimeSlot = () => {
     setNewTimes([...newTimes, { id: Date.now().toString(), time: '12:00' }]);
  };

  const removeTimeSlot = (id: string) => {
     setNewTimes(newTimes.filter(t => t.id !== id));
  };

  const updateTimeSlot = (id: string, val: string) => {
     setNewTimes(newTimes.map(t => t.id === id ? { ...t, time: val } : t));
  };

  // Stats calculation
  const takenCount = history.filter(h => h.status === 'taken').length;
  const missedCount = history.filter(h => h.status === 'missed').length;
  const totalCount = takenCount + missedCount;
  const adherenceRate = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;
  
  const pieData = [
     { name: 'Taken', value: takenCount, color: '#10b981' }, // Emerald
     { name: 'Missed', value: missedCount, color: '#f43f5e' } // Rose
  ];

  const getSlotStatus = (reminderId: string, time: string) => {
      const loggedToday = history.find(h => h.reminderId === reminderId && h.scheduledTime === time && isToday(h.takenAt));
      if (loggedToday) {
          return { state: loggedToday.status }; 
      }
      
      const now = currentTime;
      const [h, m] = time.split(':').map(Number);
      const scheduleTime = new Date(now);
      scheduleTime.setHours(h, m, 0, 0);
      
      const diffMinutes = (now.getTime() - scheduleTime.getTime()) / 60000; // in minutes
      
      if (diffMinutes < 0) {
          return { state: 'upcoming' };
      } else if (diffMinutes >= 0 && diffMinutes < 60) {
          return { state: 'due' };
      } else {
          return { state: 'missed' }; // Fallback (should be auto-logged anyway)
      }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 pb-20 overflow-y-auto transition-colors">
      <div className="p-4 sm:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3 sm:gap-4 sticky top-0 z-10 shadow-sm transition-colors">
         <div className="flex justify-between items-center">
            <h2 className="font-bold text-slate-800 dark:text-white text-lg sm:text-xl khmer-bold tracking-tight">{t.reminders}</h2>
            {view === 'list' && (
              <div className="flex items-center gap-2">
                 {(reminders.length > 0 || history.length > 0) && (
                    isConfirmingClear ? (
                       <button 
                         onClick={() => {
                            saveReminders([]);
                            saveHistoryList([]);
                            setIsConfirmingClear(false);
                         }}
                         className="bg-rose-600 text-white font-bold px-3 py-1.5 rounded-full text-[10px] sm:text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 animate-pulse flex items-center gap-1"
                       >
                         <Check size={12} /> {t.confirmClear}
                       </button>
                    ) : (
                       <button 
                         onClick={() => setIsConfirmingClear(true)} 
                         className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-50 dark:bg-rose-900/40 text-rose-500 dark:text-rose-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:text-white rounded-full flex items-center justify-center transition-colors"
                         title="Clear All Reminders & Data"
                       >
                         <Trash2 size={18} className="sm:hidden" />
                         <Trash2 size={20} className="hidden sm:block" />
                       </button>
                    )
                 )}
                 <button 
                     onClick={testReminder}
                     className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:text-white rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 marginRight-2"
                     title="Test Reminder Chime on Phone"
                  >
                    <BellRing size={18} className="sm:hidden text-indigo-500 dark:text-indigo-400" />
                    <BellRing size={20} className="hidden sm:block text-indigo-500 dark:text-indigo-400" />
                  </button>
                  <button onClick={() => setView('history')} className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 dark:bg-blue-900/40 text-blue-500 dark:text-blue-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:text-white rounded-full flex items-center justify-center transition-colors">
                   <History size={18} className="sm:hidden" />
                   <History size={20} className="hidden sm:block" />
                 </button>
                 <button onClick={() => setView('add')} className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-50 dark:bg-amber-900/40 text-amber-500 dark:text-amber-400 hover:bg-amber-100 hover:text-amber-600 dark:hover:text-white rounded-full flex items-center justify-center transition-colors">
                   <Plus size={18} className="sm:hidden" />
                   <Plus size={20} className="hidden sm:block" />
                 </button>
              </div>
            )}
            {(view === 'add' || view === 'history') && (
              <button onClick={() => setView('list')} className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50">
                 {t.backToList}
              </button>
            )}
         </div>
         
         {/* Filter Chips */}
         {view === 'list' && (
             <div className="flex gap-2 border-t border-slate-200 dark:border-slate-800 pt-3 overflow-x-auto pb-1.5 no-scrollbar text-xs sm:text-sm transition-colors w-full">
                 <button 
                    onClick={() => setActiveFilter('all')}
                    className={`px-4 py-2 rounded-full whitespace-nowrap font-bold shadow-xs active:scale-95 transition-all text-xs border ${activeFilter === 'all' ? 'bg-amber-500 text-white border-amber-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                 >
                    {t.allSchedule}
                 </button>
                 <button 
                    onClick={() => setActiveFilter('today')}
                    className={`px-4 py-2 rounded-full whitespace-nowrap font-bold shadow-xs active:scale-95 transition-all text-xs border ${activeFilter === 'today' ? 'bg-amber-500 text-white border-amber-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                 >
                    {t.today}
                 </button>
                 <button 
                    onClick={() => setActiveFilter('ongoing')}
                    className={`px-4 py-2 rounded-full whitespace-nowrap font-bold shadow-xs active:scale-95 transition-all text-xs border ${activeFilter === 'ongoing' ? 'bg-amber-500 text-white border-amber-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                 >
                    {t.ongoing}
                 </button>
             </div>
         )}
      </div>

      <div className="p-3 sm:p-4 space-y-4">
        {view === 'add' && (
          <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300 transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-white khmer-bold text-sm sm:text-base">{t.newReminder}</h3>
            
            <div className="flex items-center gap-3 sm:gap-4">
               {newPhoto ? (
                  <img src={newPhoto} alt="Med" className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover border border-slate-200 dark:border-slate-700" />
               ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-700 border-2 border-dashed border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-400 transition-colors">
                     <Pill size={20} className="sm:hidden" />
                     <Pill size={24} className="hidden sm:block" />
                  </div>
               )}
               <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg sm:rounded-xl border border-blue-100 dark:border-transparent hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                  <Camera size={14} /> {t.uploadPhoto}
               </button>
               <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleAddPhoto} />
            </div>

            <input 
              type="text" placeholder={t.medicineName} value={newMed} onChange={e => setNewMed(e.target.value)}
              className="px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm font-medium transition-colors"
            />
            <div className="flex gap-3 sm:gap-4">
               <SelectableInput 
                 placeholder={t.dosageLabel} 
                 value={newDosage} 
                 onChange={setNewDosage}
                 options={isKhmer 
                   ? ['១ គ្រាប់', '២ គ្រាប់', '០.៥ គ្រាប់', '១ កន្សោម', '៥ មីលីលីត្រ', '១០ មីលីលីត្រ', '១ ស្លាបព្រា']
                   : ['1 Pill', '2 Pills', '0.5 Pill', '1 Capsule', '5 ml', '10 ml', '1 Spoon']
                 }
               />
            </div>
            <div className="flex gap-3 sm:gap-4">
               <SelectableInput 
                 placeholder={t.instruction} 
                 value={newInstruction} 
                 onChange={setNewInstruction}
                 options={isKhmer
                   ? ['មុនអាហារ (ពោះទទេ)', 'ក្រោយអាហារ', 'ជាមួយអាហារ', 'មុនចូលគេង', 'ពេលព្រឹក', 'កុំបុក ឬកិនបំបែក']
                   : ['Before food (empty stomach)', 'After food', 'With food', 'Before bedtime', 'In the morning', 'Do not crush']
                 }
               />
            </div>
            <div className="flex gap-3 sm:gap-4">
               <SelectableInput 
                 placeholder={t.schedule} 
                 value={newFrequency} 
                 onChange={setNewFrequency}
                 options={isKhmer
                   ? ['រៀងរាល់ថ្ងៃ', 'ពីរដងក្នុងមួយថ្ងៃ', 'បីដងក្នុងមួយថ្ងៃ', 'រៀងរាល់ ៨ ម៉ោងម្តង', 'រៀងរាល់ ១២ ម៉ោងម្តង', 'ម្តងក្នុងមួយសប្តាហ៍', 'នៅពេលត្រូវការ (តាមការចាំបាច់)']
                   : ['Daily', 'Twice a day', 'Three times a day', 'Every 8 hours', 'Every 12 hours', 'Once a week', 'As needed (PRN)']
                 }
               />
               <SelectableInput 
                 placeholder={t.duration} 
                 value={newDuration} 
                 onChange={setNewDuration}
                 options={isKhmer
                   ? ['៣ ថ្ងៃ', '៥ ថ្ងៃ', '៧ ថ្ងៃ', '១០ ថ្ងៃ', '១៤ ថ្ងៃ', '៣០ ថ្ងៃ', 'រហូតអស់ថ្នាំ']
                   : ['3 days', '5 days', '7 days', '10 days', '14 days', '30 days', 'Until finished']
                 }
               />
            </div>

            <div className="space-y-3 pt-1">
               <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="font-bold text-slate-600 dark:text-slate-300">{t.timeLabel}s</span>
               </div>
               {newTimes.map((pt, idx) => (
                  <div key={pt.id} className="flex gap-2 sm:gap-3">
                     <input 
                       type="time" value={pt.time} onChange={e => updateTimeSlot(pt.id, e.target.value)}
                       className="flex-1 px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 dark:[color-scheme:dark] text-xs sm:text-sm font-medium transition-colors uppercase"
                     />
                     {newTimes.length > 1 && (
                        <button onClick={() => removeTimeSlot(pt.id)} className="w-10 sm:w-12 bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-100 dark:border-transparent rounded-xl flex justify-center items-center transition-colors">
                           <Trash2 size={16} />
                        </button>
                     )}
                  </div>
               ))}
               <button onClick={addTimeSlot} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-amber-600 dark:text-amber-400 font-bold hover:text-amber-700 dark:hover:text-amber-300 transition-colors w-fit pt-1">
                  <Plus size={16} /> {t.addTime}
               </button>
            </div>

            <button onClick={handleAdd} className="mt-2 sm:mt-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold py-3 sm:py-4 rounded-xl active:scale-[0.98] transition-all text-sm sm:text-base khmer-bold shadow-md shadow-amber-900/20">
              {t.saveReminder}
            </button>
          </div>
        )}

        {view === 'history' && (
           <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Adherence Dashboard */}
              <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm md:shadow-md border border-slate-200 dark:border-slate-700 mb-2 sm:mb-4 transition-colors">
                 <h3 className="font-bold text-slate-800 dark:text-white mb-3 sm:mb-4 khmer-bold text-sm sm:text-base">{t.history} & {t.adherence}</h3>
                 <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between mb-4 gap-4">
                    <div className="w-24 h-24 relative shrink-0">
                       <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                             <Pie data={pieData} innerRadius={30} outerRadius={45} paddingAngle={2} dataKey="value" stroke="none">
                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                             </Pie>
                          </PieChart>
                       </ResponsiveContainer>
                       <div className="absolute inset-0 flex items-center justify-center font-extrabold text-slate-800 dark:text-white text-lg">
                          {adherenceRate}%
                       </div>
                    </div>
                    <div className="w-full sm:flex-1 space-y-2 text-xs sm:text-sm font-medium">
                       <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold"><CheckCircle size={14}/> {t.taken}</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 text-base">{takenCount}</span>
                       </div>
                       <div className="flex justify-between items-center bg-rose-50 dark:bg-rose-900/20 px-3 py-2 rounded-xl border border-rose-100 dark:border-rose-900/30">
                          <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold"><XCircle size={14}/> {t.missed}</span>
                          <span className="font-bold text-rose-700 dark:text-rose-400 text-base">{missedCount}</span>
                       </div>
                    </div>
                 </div>
                 
                 {/* Streak Badge */}
                 <div className="flex items-center justify-center sm:justify-start gap-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/20 dark:to-orange-500/20 p-3 rounded-xl border border-amber-200 dark:border-amber-500/30">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-amber-500/10 rounded-full flex items-center justify-center shadow-sm text-amber-500 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                       <TrendingUp size={16} className="sm:hidden" />
                       <TrendingUp size={20} className="hidden sm:block" />
                    </div>
                    <div className="text-left">
                       <p className="text-amber-700 dark:text-amber-400 font-bold khmer-bold text-[10px] sm:text-xs uppercase tracking-wider">{t.streak}</p>
                       <p className="text-amber-600/80 dark:text-amber-500/80 text-[10px] sm:text-xs font-bold leading-tight">Consistent for 3 days!</p>
                    </div>
                 </div>
              </div>

              {/* History List */}
              <h4 className="font-bold text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs pl-1 uppercase tracking-wider">{t.recentSearches} Logs</h4>
              {history.map(item => (
                 <div key={item.id} className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-sm transition-colors">
                    <div>
                       <p className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">{item.medicineName}</p>
                       <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                          <span className="flex items-center gap-1"><CalendarIcon size={12}/> {new Date(item.takenAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Clock size={12}/> {item.scheduledTime}</span>
                       </div>
                    </div>
                    {item.status === 'taken' ? (
                       <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-emerald-200 dark:border-emerald-900/50">
                          <CheckCircle size={10} className="sm:hidden" /><CheckCircle size={12} className="hidden sm:block" /> TAKEN
                       </span>
                    ) : (
                       <span className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-rose-200 dark:border-rose-900/50">
                          <XCircle size={10} className="sm:hidden" /><XCircle size={12} className="hidden sm:block" /> MISSED
                       </span>
                    )}
                 </div>
              ))}
              {history.length === 0 && <p className="text-center font-bold text-slate-500 dark:text-slate-400 text-xs sm:text-sm p-6">{t.noLogsYet}</p>}
           </div>
        )}

        {view === 'list' && (
           <div className="flex flex-col gap-4 sm:gap-5 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
             {/* Smart Insights Summary */}
             <div className="bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm md:shadow-lg text-white relative overflow-hidden transition-colors">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex items-center justify-between">
                   <div>
                      <p className="text-indigo-50 dark:text-indigo-100 text-[10px] sm:text-xs font-bold mb-1 tracking-wider uppercase">{t.todaysSchedule}</p>
                      <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        {reminders.filter(r => r.isActive).reduce((acc, curr) => acc + curr.times.length, 0)} <span className="text-base sm:text-xl font-medium opacity-80">{t.pillsDue}</span>
                      </h3>
                   </div>
                   <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                      <PieChart className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-md" />
                   </div>
                </div>
                
                <div className="mt-4 sm:mt-5 bg-white/10 backdrop-blur-sm rounded-xl p-2.5 sm:p-3 flex justify-between items-center border border-white/10">
                   <div className="text-center flex-1 border-r border-white/20">
                      <p className="text-xl sm:text-2xl font-bold text-white">{takenCount}</p>
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-indigo-50 dark:text-indigo-100 font-bold">{t.taken}</p>
                   </div>
                   <div className="text-center flex-1">
                      <p className="text-xl sm:text-2xl font-bold text-emerald-300">{adherenceRate}%</p>
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-indigo-50 dark:text-indigo-100 font-bold">{t.healthScore}</p>
                   </div>
                </div>
             </div>

             {/* Reminders List */}
             <div>
                <h4 className="font-bold text-slate-800 dark:text-white tracking-tight text-base sm:text-lg mb-2 sm:mb-3 pl-1">{t.reminders}</h4>
                {reminders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 sm:p-10 bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 shadow-sm transition-colors">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                       <Bell size={24} className="text-indigo-500 dark:text-indigo-400 sm:hidden" />
                       <Bell size={28} className="text-indigo-500 dark:text-indigo-400 hidden sm:block" />
                    </div>
                    <p className="text-center font-bold text-slate-500 dark:text-slate-400 mb-2 text-sm sm:text-base">{t.noReminders}</p>
                    <button onClick={() => setView('add')} className="mt-2 text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold shadow-sm">{t.setupFirstTreatment}</button>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {(() => {
                      const filteredReminders = reminders.filter(rem => {
                        if (activeFilter === 'today') {
                          return rem.isActive;
                        }
                        if (activeFilter === 'ongoing') {
                          return rem.isActive;
                        }
                        return true;
                      });
                      if (filteredReminders.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center p-8 sm:p-10 bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 shadow-xs transition-colors text-center w-full">
                            <p className="font-bold text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                              {language === 'en' ? 'No reminders match this filter.' : 'គ្មានការរំលឹកថ្នាំត្រូវគ្នានឹងការចម្រោះនេះទេ។'}
                            </p>
                          </div>
                        );
                      }
                      return filteredReminders.map(rem => (
                      <div key={rem.id} className={`bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl border shadow-sm sm:shadow-lg transition-all group ${rem.isActive ? 'border-slate-200 dark:border-slate-700/80' : 'border-slate-100 dark:border-slate-800/50 opacity-60 grayscale-[0.5]'} overflow-hidden`}>
                        <div className="p-4 sm:p-5 flex gap-3 sm:gap-4">
                           {rem.photoUrl ? (
                              <img src={rem.photoUrl} alt="" className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm shrink-0" />
                           ) : (
                              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl shrink-0 flex items-center justify-center shadow-inner transition-colors ${rem.isActive ? 'bg-indigo-50 dark:bg-gradient-to-br dark:from-indigo-900/50 dark:to-purple-900/50 text-indigo-500 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20' : 'bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                                 <Pill size={24} className={rem.isActive ? 'drop-shadow-sm sm:hidden' : 'sm:hidden'} />
                                 <Pill size={26} className={rem.isActive ? 'drop-shadow-sm hidden sm:block' : 'hidden sm:block'} />
                              </div>
                           )}
                           
                           <div className="flex-1 min-w-0">
                              <h4 className="font-extrabold text-slate-800 dark:text-white truncate text-base sm:text-lg tracking-tight leading-tight mb-1 sm:mb-1.5">{rem.medicineName}</h4>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md font-bold text-[9px] sm:text-[10px] uppercase tracking-wide">{rem.dosage || '1 unit'}</span>
                                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md">{rem.frequency}</span>
                              </div>
                           </div>
                           
                           <div className="flex flex-col items-end gap-3 shrink-0">
                              <button onClick={() => deleteReminder(rem.id)} className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-2 sm:p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 border border-transparent hover:border-rose-100 dark:hover:border-slate-600 transition-colors rounded-xl shadow-sm">
                                <Trash2 size={16} className="sm:hidden" />
                                <Trash2 size={18} className="hidden sm:block" />
                              </button>
                           </div>
                        </div>

                        {/* Timetable schedule row */}
                        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 sm:pt-1">
                           {rem.instruction && (
                              <div className="flex items-start sm:items-center gap-2 sm:gap-2.5 text-[10px] sm:text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/20 p-2.5 sm:p-3 rounded-xl mb-3 sm:mb-4 border border-indigo-100/50 dark:border-indigo-800/40 font-bold leading-relaxed">
                                 <Info size={14} className="shrink-0 text-indigo-500 dark:text-indigo-400 mt-0.5 sm:mt-0" /> {rem.instruction}
                              </div>
                           )}
                           
                           <div className="space-y-2.5 sm:space-y-3">
                              {rem.times.map((pt, i) => {
                                 const status = getSlotStatus(rem.id, pt.time);
                                 return (
                                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-sm dark:shadow-inner transition-colors">
                                       <div className="flex items-center gap-2.5 sm:gap-3 pl-1">
                                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold font-mono tracking-tight text-xs sm:text-sm shadow-sm transition-colors ${status.state === 'taken' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' : status.state === 'missed' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'}`}>
                                             {pt.time}
                                          </div>
                                           <div>
                                             <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                {status.state === 'taken' ? t.completed : status.state === 'missed' ? t.missed : t.scheduled}
                                             </p>
                                          </div>
                                       </div>
                                       {(!status.state || status.state === 'due' || status.state === 'upcoming') ? (
                                             <div className="flex gap-2 w-full sm:w-auto">
                                                <button onClick={() => logPill(rem.id, rem.medicineName, pt.time, 'taken')} className="flex-1 sm:flex-none px-4 sm:px-5 py-2 text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all border border-emerald-400/50">{t.take}</button>
                                                <button onClick={() => logPill(rem.id, rem.medicineName, pt.time, 'missed')} className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">{t.skip}</button>
                                             </div>
                                       ) : (
                                          <div className="hidden sm:block">
                                             {status.state === 'taken' ? <CheckCircle className="text-emerald-500 dark:text-emerald-400 w-5 h-5 sm:w-6 sm:h-6 mr-1 sm:mr-2 drop-shadow-sm" /> : <XCircle className="text-rose-500 dark:text-rose-400 w-5 h-5 sm:w-6 sm:h-6 mr-1 sm:mr-2" />}
                                          </div>
                                       )}
                                    </div>
                                 );
                              })}
                           </div>
                        </div>

                      </div>
                    ))
                  })()}
                  </div>
                )}
             </div>
           </div>
        )}

      </div>

      {/* Dynamic Pop-up Alarm Modal */}
      {activePillAlert && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-indigo-100 dark:border-indigo-900/40 text-center animate-in zoom-in-95 duration-200">
               <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md animate-bounce">
                  <Bell className="text-white w-8 h-8" />
               </div>
               
               <h3 className="font-extrabold text-slate-900 dark:text-white text-lg sm:text-xl tracking-tight leading-snug mb-1">
                  {language === 'en' ? 'Pill Reminder Due!' : 'ដល់ម៉ោងលេបថ្នាំហើយ!'}
               </h3>
               <p className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-4 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 rounded-full inline-block mt-1">
                  {activePillAlert.time}
               </p>
               
               <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 mb-5 text-left">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{language === 'en' ? 'Medicine' : 'ឈ្មោះថ្នាំ'}</p>
                  <p className="text-slate-800 dark:text-white font-extrabold text-base truncate mb-3">{activePillAlert.medicineName}</p>
                  
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{language === 'en' ? 'Dosage' : 'កម្រិតថ្នាំ'}</p>
                  <p className="text-slate-800 dark:text-white font-bold text-sm mb-3 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md inline-block">{translateOption(activePillAlert.dosage, language) || '1 unit'}</p>
                  
                  {activePillAlert.instruction && (
                     <>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{t.instruction || 'Instructions'}</p>
                        <p className="text-slate-600 dark:text-slate-300 text-xs font-medium bg-indigo-50/50 dark:bg-indigo-950/20 p-2 rounded-lg border border-indigo-100/30">{translateOption(activePillAlert.instruction, language)}</p>
                     </>
                  )}
               </div>
               
               <div className="flex gap-2.5">
                  <button 
                     onClick={() => {
                        logPill(Date.now().toString(), activePillAlert.medicineName, activePillAlert.time, 'taken');
                        setActivePillAlert(null);
                     }}
                     className="flex-1 py-3 text-white font-bold text-xs uppercase tracking-wider rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all border border-emerald-400/40"
                  >
                     {language === 'en' ? 'I Took It' : 'ខ្ញុំបានលេបរួច'}
                  </button>
                  <button 
                     onClick={() => setActivePillAlert(null)}
                     className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-200 dark:border-slate-600 transition-colors"
                  >
                     {language === 'en' ? 'Skip' : 'រំលង'}
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
