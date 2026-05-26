import { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../lib/LanguageContext';
import { Send, Bot, User, Loader2, Mic, Volume2, Trash2, History, X, Plus, ClipboardList, VolumeX, Check } from 'lucide-react';
import Markdown from 'react-markdown';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: Message[];
}

let cachedCurrentSessionId: string | null = null;

export default function SymptomChecker({ isActiveTab = true }: { isActiveTab?: boolean }) {
  const { t, language } = useLanguage();
  const [input, setInput] = useState('');
  
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
     if (typeof window === 'undefined') return [];
     const savedSessions = localStorage.getItem('camhealth_chat_sessions');
     if (savedSessions) {
        try { return JSON.parse(savedSessions); } catch(e) {}
     }
     const savedMessages = localStorage.getItem('camhealth_chat_messages');
     if (savedMessages) {
        try {
           const parsed = JSON.parse(savedMessages);
           if (parsed.length > 1) {
              return [{
                 id: Date.now().toString(),
                 title: parsed[1].text.substring(0, 30),
                 date: new Date().toISOString(),
                 messages: parsed
              }];
           }
        } catch(e) {}
     }
     return [];
  });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(cachedCurrentSessionId);
  const [showHistory, setShowHistory] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAudioRef = useRef<any>(null);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [isConfirmingClearHistory, setIsConfirmingClearHistory] = useState<boolean>(false);
  const stopRequestedRef = useRef<boolean>(false);

  useEffect(() => {
    cachedCurrentSessionId = currentSessionId;
  }, [currentSessionId]);

  useEffect(() => {
     if (deletingSessionId) {
        const timer = setTimeout(() => setDeletingSessionId(null), 3500);
        return () => clearTimeout(timer);
     }
  }, [deletingSessionId]);

  useEffect(() => {
     if (isConfirmingClearHistory) {
        const timer = setTimeout(() => setIsConfirmingClearHistory(false), 3500);
        return () => clearTimeout(timer);
     }
  }, [isConfirmingClearHistory]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
         setVoices(window.speechSynthesis.getVoices());
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
      return () => {
         window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('camhealth_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const activeMessages = useMemo(() => {
    if (currentSessionId) {
      return sessions.find(s => s.id === currentSessionId)?.messages || [];
    }
    return [{ id: '1', sender: 'bot' as const, text: t.greeting }];
  }, [currentSessionId, sessions, t.greeting]);

  const clearHistory = () => {
     if (isConfirmingClearHistory) {
        setSessions([]);
        setCurrentSessionId(null);
        localStorage.removeItem('camhealth_chat_messages');
        setIsConfirmingClearHistory(false);
     } else {
        setIsConfirmingClearHistory(true);
     }
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
     e.preventDefault();
     e.stopPropagation();
     if (deletingSessionId === id) {
        setSessions(prev => prev.filter(s => s.id !== id));
        if (currentSessionId === id) setCurrentSessionId(null);
        setDeletingSessionId(null);
     } else {
        setDeletingSessionId(id);
     }
  };

  const handleSummarize = async () => {
     if (activeMessages.length <= 1) return;
     setIsSummarizing(true);
     setSummaryModalOpen(true);
     setSummaryText("");

     try {
       const historyPayload = activeMessages.slice(1).map((m: Message) => ({ role: m.sender, content: m.text }));
       const response = await fetch('/api/summarize', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ 
            history: historyPayload,
            language: language === 'en' ? 'English' : 'Khmer' 
         })
       });
       
       const contentType = response.headers.get("content-type");
       if (!contentType || !contentType.includes("application/json")) {
         throw new Error(`Server returned non-JSON response (${response.status})`);
       }

       const data = await response.json();
       if (data.result) {
          setSummaryText(data.result);
       } else {
          setSummaryText("Failed to generate summary.");
       }
     } catch (e) {
       console.error(e);
       setSummaryText("Network error. Could not generate summary.");
     } finally {
       setIsSummarizing(false);
     }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages]);

  useEffect(() => {
    if (!isActiveTab) {
      if ('speechSynthesis' in window && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
         window.speechSynthesis.pause();
         setIsPaused(true);
      }
      if (currentAudioRef.current && !currentAudioRef.current.paused) {
         currentAudioRef.current.pause();
         setIsPaused(true);
      }
    } else {
      if (speakingMessageId && isPaused) {
         if ('speechSynthesis' in window && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
         }
         if (currentAudioRef.current && currentAudioRef.current.paused) {
            currentAudioRef.current.play().catch(() => {});
            setIsPaused(false);
         }
      }
    }
  }, [isActiveTab]);

  const stopSpeech = () => {
    if (currentAudioRef.current) {
      try { currentAudioRef.current.pause(); } catch(e){}
      currentAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch(e){}
    }
    stopRequestedRef.current = true;
    setSpeakingMessageId(null);
    setIsPaused(false);
  };

  const handleSpeakToggle = (text: string, msgId: string) => {
    if (speakingMessageId === msgId) {
       if (isPaused) {
          // Resume
          if ('speechSynthesis' in window && window.speechSynthesis.paused) {
             window.speechSynthesis.resume();
          }
          if (currentAudioRef.current && currentAudioRef.current.paused) {
             currentAudioRef.current.play().catch(() => {});
          }
          setIsPaused(false);
       } else {
          // Pause
          if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
             window.speechSynthesis.pause();
          }
          if (currentAudioRef.current && !currentAudioRef.current.paused) {
             currentAudioRef.current.pause();
          }
          setIsPaused(true);
       }
       return;
    }

    speakText(text, msgId);
  };

  const speakText = async (text: string, msgId: string) => {
    try {
      // Stop any existing playback first
      stopSpeech();
      stopRequestedRef.current = false;
      setSpeakingMessageId(msgId);
      setIsPaused(false);
      
      // 1. Synchronously prepare / unlock the Audio element to bypass iOS / Safari posture blocks
      const audio = new Audio();
      currentAudioRef.current = audio;
      // Start silent context inside user activity boundary
      audio.play().catch(() => {});

      const cleanText = text.replace(/[#*`_]/g, '');

      // Try browser SpeechSynthesis first to allow pitch (gender shift) and rate adjustments
      if ('speechSynthesis' in window) {
         const langCode = language === 'en' ? 'en' : 'km';
         const localeCode = language === 'en' ? 'en-US' : 'km-KH';
         const correctVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langCode));
         
         if (correctVoices.length > 0) {
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = localeCode;
            
            // Try to find a male voice
            const malePhrases = ['male', 'man', 'guy', 'david', 'dech', 'google dech', 'george', 'microsoft david', 'en-us-x-sfg-local', 'm'];
            const maleVoice = correctVoices.find(v => 
               malePhrases.some(phrase => v.name.toLowerCase().includes(phrase))
            );
            
            if (maleVoice) {
               utterance.voice = maleVoice;
            } else {
               utterance.voice = correctVoices[0];
            }
            
            // Set voice pitch lower to force a masculine baritone tone
            utterance.pitch = 0.7; 
            utterance.rate = 1.18; // Natural clear speaking rate
            
            utterance.onend = () => {
               setSpeakingMessageId(null);
            };
            utterance.onerror = () => {
               setSpeakingMessageId(null);
            };
            
            window.speechSynthesis.speak(utterance);
            return;
         }
      }

      // Fallback to API if speechSynthesis not supported or no Khmer voices loaded
      const response = await fetch('/api/tts', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ text: cleanText, language: 'km' }) 
      });
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
         throw new Error(`TTS API failed to return JSON (${response.status})`);
      }

      const data = await response.json();
      if (!response.ok || !data.audioUrls) {
         throw new Error(data.error || 'TTS request failed');
      }

      const urls = data.audioUrls as string[];
      if (urls.length === 0) {
         setSpeakingMessageId(null);
         return;
      }

      const playSequence = async (urlsToPlay: string[]) => {
         for (const url of urlsToPlay) {
            if (stopRequestedRef.current) break;
            await new Promise<void>((resolve, reject) => {
               audio.src = url;
               audio.playbackRate = 1.50; // Speak fast as requested
               audio.onended = () => resolve();
               audio.onerror = (err) => reject(err);
               
               if (stopRequestedRef.current) {
                  reject(new Error("Playback stopped"));
                  return;
               }
               audio.play().catch(reject);
            });
         }
         if (!stopRequestedRef.current) {
            setSpeakingMessageId(null);
         }
      };

      playSequence(urls).catch(e => {
         console.warn("Sequence playback aborted:", e);
         setSpeakingMessageId(null);
      });
      
    } catch (e) {
      console.warn("TTS playback failed:", e);
      setSpeakingMessageId(null);
    }
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(language === 'en' ? 'Speech recognition is not supported in this browser.' : 'មុខងារស្គាល់សំឡេងមិនត្រូវបានគាំទ្រនៅក្នុងកម្មវិធីរុករកនេះទេ។');
      return;
    }
    
    if (isListening) {
      setIsListening(false);
      return;
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
         console.error('Speech recognition error:', event.error);
         alert(language === 'en' ? 'Microphone access was denied. Please allow microphone permissions to use voice input.' : 'ការចូលប្រើមីក្រូហ្វូនត្រូវបានបដិសេធ។ សូមអនុញ្ញាតសិទ្ធិប្រើប្រាស់មីក្រូហ្វូនដើម្បីបញ្ចូលសំឡេង។');
      } else if (event.error === 'no-speech') {
         // Silently ignore or just debug log when no speech is detected (e.g., timeout).
         console.debug('No speech detected.');
      } else {
         console.error('Speech recognition error:', event.error);
      }
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    if ('speechSynthesis' in window) {
       // Warm up synthesis engine
       const u = new SpeechSynthesisUtterance('');
       u.volume = 0;
       window.speechSynthesis.speak(u);
    }
    
    const userMsg = input.trim();
    setInput('');
    setIsLoading(true);

    let targetSessionId = currentSessionId;
    let currentMsgs = [...activeMessages];
    
    if (!targetSessionId) {
       targetSessionId = Date.now().toString();
       setCurrentSessionId(targetSessionId);
    }
    
    const updatedMessages = [...currentMsgs, { id: Date.now().toString(), sender: 'user' as const, text: userMsg }];
    
    setSessions(prev => {
       const existingIndex = prev.findIndex(s => s.id === targetSessionId);
       let updated = [...prev];
       if (existingIndex >= 0) {
          updated[existingIndex] = { ...updated[existingIndex], messages: updatedMessages };
       } else {
          updated = [{
             id: targetSessionId!,
             title: userMsg,
             date: new Date().toISOString(),
             messages: updatedMessages
          }, ...updated];
       }
       return updated;
    });

    try {
      const historyPayload = updatedMessages.slice(1, -1).map(m => ({ role: m.sender, content: m.text }));

      const response = await fetch('/api/symptoms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
           text: userMsg, 
           history: historyPayload,
           language: language === 'en' ? 'English' : 'Khmer' 
        })
      });
      
      let data;
      try {
         const contentType = response.headers.get("content-type");
         if (contentType && contentType.includes("application/json")) {
            data = await response.json();
         } else {
            const rawText = await response.text();
            throw new Error(response.status === 504 ? "Server timeout (took too long). Please try again." : `Server returned an error (${response.status}): ${rawText.substring(0, 50)}`);
         }
      } catch (err: any) {
         throw new Error(`Failed to read response: ${err.message}`);
      }
      
      const reply = data?.result || data?.error || (response.status === 429 ? 'Rate limit exceeded. Please wait a moment.' : 'Sorry, an unexpected error occurred analyzing your symptoms.');
      
      const botMsg = { id: (Date.now() + 1).toString(), sender: 'bot' as const, text: reply };
      const finalMessages = [...updatedMessages, botMsg];
      
      setSessions(prev => {
         const existingIndex = prev.findIndex(s => s.id === targetSessionId);
         if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = { ...updated[existingIndex], messages: finalMessages };
            return updated;
         }
         return prev;
      });
      speakText(reply, botMsg.id);
    } catch (error: any) {
      console.error("Fetch error:", error);
      const errMsg = { id: (Date.now() + 1).toString(), sender: 'bot' as const, text: error?.message || 'Network error. Please try again later.' };
      const errMessages = [...updatedMessages, errMsg];
      setSessions(prev => {
         const existingIndex = prev.findIndex(s => s.id === targetSessionId);
         if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = { ...updated[existingIndex], messages: errMessages };
            return updated;
         }
         return prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showHistory) {
     return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors">
           <div className="p-3 sm:p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10 shadow-sm transition-colors">
              <h2 className="font-bold text-slate-800 dark:text-white khmer-bold text-base sm:text-lg">{t.recentSearches || 'Chat History'}</h2>
              <button onClick={() => setShowHistory(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
                 <X size={20}/>
              </button>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {sessions.length === 0 ? (
                 <div className="text-center text-slate-500 mt-10 text-sm">
                    <p>No chat history.</p>
                 </div>
              ) : (
                 sessions.map(session => (
                    <div key={session.id} 
                         onClick={() => { setCurrentSessionId(session.id); setShowHistory(false); }}
                         className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-blue-500/50 hover:shadow-md transition-all group relative">
                       <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1 truncate pr-8 tracking-tight text-sm sm:text-base">{session.title}</h3>
                       <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{new Date(session.date).toLocaleDateString()} at {new Date(session.date).toLocaleTimeString()}</span>
                       
                       <button 
                          onClick={(e) => deleteSession(e, session.id)}
                          className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all shadow-sm z-20 ${
                             deletingSessionId === session.id
                                ? 'px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 animate-pulse'
                                : 'p-2 text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100'
                          }`}
                          title={deletingSessionId === session.id ? "Confirm?" : "Delete Chat"}
                       >
                          {deletingSessionId === session.id ? (
                             <>
                                <Check size={12} /> <span className="text-[10px] sm:text-xs">Confirm?</span>
                             </>
                          ) : (
                             <Trash2 size={18} />
                          )}
                       </button>
                    </div>
                 ))
              )}
           </div>
        </div>
     );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-full overflow-hidden bg-slate-50 dark:bg-slate-900 relative transition-colors">
      <div className="p-3 sm:p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10 shadow-sm transition-colors">
         <button onClick={() => setShowHistory(true)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 rounded-full transition-colors" title="History">
            <History size={18} />
         </button>
         <h2 className="font-bold text-slate-800 dark:text-white khmer-bold text-center pl-2 flex-1 tracking-tight text-base sm:text-lg truncate py-1">{t.checkSymptoms}</h2>
         <div className="flex items-center gap-0.5 sm:gap-1">
            {activeMessages.length > 1 && (
               <button onClick={handleSummarize} className="p-2 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors flex items-center justify-center" title="Summarize for Doctor">
                  <ClipboardList size={18} />
               </button>
            )}
            <button onClick={() => setCurrentSessionId(null)} className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors" title="New Chat">
               <Plus size={18} />
            </button>
            <button 
               onClick={clearHistory} 
               className={`p-2 rounded-full transition-all flex items-center justify-center ${
                  isConfirmingClearHistory 
                     ? 'bg-rose-600 text-white font-bold text-xs px-3 py-1.5 animate-pulse rounded-full' 
                     : 'text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30'
               }`} 
               title={isConfirmingClearHistory ? "Confirm Clear All?" : "Clear All History"}
            >
               {isConfirmingClearHistory ? (
                  <span className="text-[10px] tracking-wider uppercase font-extrabold flex items-center gap-1">
                     <Check size={11} /> Confirm?
                  </span>
               ) : (
                  <Trash2 size={18} />
               )}
            </button>
         </div>
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
          <div className="bg-amber-50 dark:bg-amber-900/20 backdrop-blur-sm border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs sm:text-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-2 sm:mb-4 shadow-sm font-medium leading-relaxed">
            {t.disclaimer}
          </div>
          
          {activeMessages.map(msg => (
          <div key={msg.id} className={`flex gap-2 sm:gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 sm:w-9 sm:h-9 shadow-sm rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'bg-white border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 overflow-hidden'}`}>
              {msg.sender === 'user' ? <User size={16} /> : <img src="/bot.png" alt="Bot" className="w-full h-full object-contain bg-white" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />}
              <Bot size={16} className={msg.sender === 'user' ? "hidden" : "hidden"} />
            </div>
            
            <div className={`rounded-2xl sm:rounded-[1.25rem] max-w-[85%] sm:max-w-[80%] relative group ${
              msg.sender === 'user' 
                ? 'p-3 sm:p-4 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-[4px] shadow-sm text-sm' 
                : 'p-3 sm:p-4 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-[4px] shadow-sm markdown-body text-sm'
            }`}>
              {msg.sender === 'bot' ? (
                <>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm leading-[2] prose-p:leading-[2] prose-li:leading-[2] break-words overflow-x-hidden">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                  {msg.id !== '1' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-end">
                      <button 
                         onClick={() => handleSpeakToggle(msg.text, msg.id)} 
                         className={`p-1.5 px-3 shadow-xs rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase border ${
                            speakingMessageId === msg.id 
                               ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/45 border-indigo-200 dark:border-indigo-900 animate-pulse'
                               : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                         }`}
                         title={speakingMessageId === msg.id ? (isPaused ? "Resume" : "Pause") : t.listen || "Listen"}
                      >
                         {speakingMessageId === msg.id ? (
                            isPaused ? <Volume2 size={12} /> : <div className="w-[12px] h-[12px] flex justify-center items-center gap-[1.5px]"><div className="w-[2.5px] h-[8px] bg-current rounded-full animate-bounce" style={{animationDelay: '0s'}}/><div className="w-[2.5px] h-[8px] bg-current rounded-full animate-bounce" style={{animationDelay: '150ms'}}/><div className="w-[2.5px] h-[8px] bg-current rounded-full animate-bounce" style={{animationDelay: '300ms'}}/></div>
                         ) : <Volume2 size={12} />}
                         <span>{speakingMessageId === msg.id ? (isPaused ? "Paused" : "Speaking") : "Listen"}</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="font-medium text-sm leading-[2] break-words whitespace-pre-wrap">{msg.text}</div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 sm:gap-3">
             <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm overflow-hidden">
              <img src="/bot.png" alt="Bot" className="w-full h-full object-contain bg-white" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
              <Bot size={16} className="hidden" />
             </div>
             <div className="px-4 py-3 sm:px-5 sm:py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[1.25rem] rounded-tl-[4px] flex items-center shadow-sm h-10 w-16">
               <div className="flex gap-1.5 items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{animationDelay: '300ms'}}></div>
               </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto transition-colors shrink-0 shadow-sm z-10 relative">
        <div className="flex items-center gap-2 sm:gap-2.5 relative max-w-3xl mx-auto w-full">
          <button 
             onClick={toggleListening}
             className={`p-3 sm:p-3.5 rounded-full flex shrink-0 items-center justify-center transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-transparent'}`}
             title={t.voiceInput}
          >
             <Mic size={18} className="sm:hidden" />
             <Mic size={20} className="hidden sm:block" />
          </button>
          <input 
            type="text" 
            placeholder={t.symptomInputHint}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-full px-4 sm:px-5 py-2.5 sm:py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-sans shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex shrink-0 items-center justify-center disabled:opacity-50 disabled:bg-slate-200 dark:disabled:bg-slate-700 hover:bg-blue-500 transition-all shadow-md active:scale-95 disabled:active:scale-100"
          >
            <Send size={16} className="translate-x-[-1px] translate-y-[1px]" />
          </button>
        </div>
      </div>

      {/* Summary Modal */}
      {summaryModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors">
               <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                  <h3 className="font-bold text-slate-800 dark:text-white text-base sm:text-lg flex items-center gap-2">
                     <ClipboardList size={18} className="text-indigo-500 dark:text-indigo-400" />
                     {language === 'en' ? 'Summary for Doctor' : 'សេចក្ដីសង្ខេបសម្រាប់គ្រូពេទ្យ'}
                  </h3>
                  <button onClick={() => setSummaryModalOpen(false)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
                     <X size={18} />
                  </button>
               </div>
               <div className="p-4 sm:p-5 overflow-y-auto flex-1">
                  {isSummarizing ? (
                     <div className="flex flex-col items-center justify-center py-10 text-slate-500 dark:text-slate-400 space-y-4">
                        <Loader2 size={32} className="animate-spin text-indigo-500" />
                        <p className="text-xs sm:text-sm animate-pulse">{language === 'en' ? 'Generating summary...' : 'កំពុងបង្កើតសេចក្ដីសង្ខេប...'}</p>
                     </div>
                  ) : (
                     <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 markdown-body">
                        <Markdown>{summaryText}</Markdown>
                     </div>
                  )}
               </div>
               {(!isSummarizing && summaryText) && (
                  <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                     <button onClick={() => {
                        navigator.clipboard.writeText(summaryText);
                        alert(language === 'en' ? 'Copied to clipboard' : 'បានចម្លង');
                     }} className="w-full py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base font-semibold rounded-xl transition-colors shadow-sm">
                        {language === 'en' ? 'Copy to Clipboard' : 'ចម្លងអត្ថបទ'}
                     </button>
                  </div>
               )}
            </div>
         </div>
      )}
    </div>
  );
}

