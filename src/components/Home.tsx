import { useLanguage } from '../lib/LanguageContext';
import { HeartPulse, Stethoscope, MapPin, Pill, Activity } from 'lucide-react';
import { Tab } from '../types';

interface HomeProps {
  onTabChange: (tab: Tab) => void;
}

export default function Home({ onTabChange }: HomeProps) {
  const { t } = useLanguage();

  const ActionCard = ({ title, icon: Icon, onClick, color }: any) => (
    <button 
      onClick={onClick}
      className={`p-4 sm:p-6 rounded-2xl flex flex-col items-center justify-center gap-3 sm:gap-4 shadow-sm border border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600 transition-transform active:scale-95 bg-white dark:bg-slate-800 w-full text-center group`}
    >
      <div className="p-3 sm:p-4 bg-blue-50 dark:bg-slate-700/50 rounded-full group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
      </div>
      <span className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm">{title}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-slate-900 pb-6 transition-colors">
      <div className="px-5 sm:px-8 pt-8 sm:pt-12 pb-10 sm:pb-14 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 rounded-b-[2.5rem] sm:rounded-b-[3rem] shadow-lg relative overflow-hidden border-b border-transparent dark:border-slate-800 transition-colors">
        {/* Decorative background circles */}
        <div className="absolute -top-12 -right-12 w-40 h-40 sm:w-48 sm:h-48 bg-white/10 dark:bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 -left-12 w-28 h-28 sm:w-32 sm:h-32 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex flex-col gap-4 sm:gap-6 max-w-3xl mx-auto w-full">
           <div>
             <span className="bg-white/20 text-white/95 text-[10px] sm:text-xs px-3 py-1 rounded-full font-bold tracking-wider backdrop-blur-md shadow-sm inline-block mb-3 sm:mb-4 border border-white/10 uppercase">
               {new Date().getHours() < 12 ? t.goodMorning : new Date().getHours() < 18 ? t.goodAfternoon : t.goodEvening}
             </span>
             <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight drop-shadow-md tracking-tight">{t.greeting}</h2>
           </div>
           <div className="bg-white/15 dark:bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-2xl flex items-start gap-3 shadow-sm">
             <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300 shrink-0 mt-0.5" />
             <p className="text-blue-50 text-[10px] sm:text-xs leading-relaxed font-medium">{t.disclaimer}</p>
           </div>
        </div>
      </div>

      <div className="px-5 sm:px-8 mt-6 sm:mt-8 max-w-3xl mx-auto w-full">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-4 sm:mb-5 tracking-tight uppercase text-[10px] opacity-80">{t.quickActions}</h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <ActionCard 
            title={t.checkSymptoms} 
            icon={Stethoscope} 
            onClick={() => onTabChange('symptoms')} 
          />
          <ActionCard 
            title={t.findHospital} 
            icon={MapPin} 
            onClick={() => onTabChange('map')} 
          />
          <button 
             onClick={() => onTabChange('reminders')}
             className="col-span-2 p-4 sm:p-5 rounded-2xl sm:rounded-3xl flex items-center gap-4 sm:gap-5 shadow-sm border border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600 transition-transform active:scale-[0.98] bg-white dark:bg-slate-800 w-full text-left group"
          >
             <div className="p-3 sm:p-4 bg-amber-50 dark:bg-slate-700/50 rounded-xl sm:rounded-2xl shadow-sm group-hover:scale-105 transition-transform">
               <Pill className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500 dark:text-amber-400" />
             </div>
             <div>
               <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm mb-0.5">{t.addReminder}</h4>
               <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-medium leading-snug">Manage your daily medication schedules and stay healthy.</p>
             </div>
          </button>
        </div>
      </div>
    </div>
  );
}
