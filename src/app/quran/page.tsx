
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BookOpen, Sun, Moon, Radio, Settings, Search, Heart, List, Target, Compass, Shield, PieChart, Cpu, Info, RefreshCw, Download as DownloadIcon, X, CheckCircle, Plus, ChevronsRight, ChevronsLeft, Bookmark, Loader2, Play, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Send, Check, MessageSquare, AlertTriangle, EyeOff, Angry, Edit
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Chart from 'chart.js/auto';
import html2canvas from 'html2canvas';

// Main App Component
export default function QuranPage() {
    const [activeTab, setActiveTab] = useState('surahsView');
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        if (localStorage.getItem('quranSettings.theme') === 'light') {
            document.documentElement.classList.remove('dark');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        }
    }, []);

    const switchTab = (tabId: string) => {
        setActiveTab(tabId);
    };

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('quranSettings.theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('quranSettings.theme', 'dark');
        }
        setIsDark(!isDark);
    };

    return (
        <div className={cn(isDark ? 'dark' : '')}>
            <div className="text-foreground pt-32 pb-40 md:pt-36">

                <Header onSwitchTab={switchTab} onToggleTheme={toggleTheme} isDark={isDark} />
                <MobileNav onSwitchTab={switchTab} activeTab={activeTab} />
                
                <main className="container mx-auto px-4">
                    <div id="surahsView" className={cn('tab-content', activeTab === 'surahsView' && 'active')}>
                        <SurahsView />
                    </div>
                    <div id="searchView" className={cn('tab-content', activeTab === 'searchView' && 'active')}>
                        <SearchView />
                    </div>
                     <div id="memorizeView" className={cn('tab-content', activeTab === 'memorizeView' && 'active')}>
                        <MemorizeView />
                    </div>
                    <div id="playlistsView" className={cn('tab-content', activeTab === 'playlistsView' && 'active')}>
                        <PlaylistsView />
                    </div>
                    <div id="mushafView" className={cn('tab-content', activeTab === 'mushafView' && 'active')}>
                        <MushafView />
                    </div>
                    <div id="khatmaView" className={cn('tab-content', activeTab === 'khatmaView' && 'active')}>
                        <KhatmaView />
                    </div>
                    <div id="prayerView" className={cn('tab-content', activeTab === 'prayerView' && 'active')}>
                        <PrayerTimesView />
                    </div>
                    <div id="adhkarView" className={cn('tab-content', activeTab === 'adhkarView' && 'active')}>
                        <AdhkarView />
                    </div>
                    <div id="analyticsView" className={cn('tab-content', activeTab === 'analyticsView' && 'active')}>
                        <AnalyticsView />
                    </div>
                     <div id="aiView" className={cn('tab-content', activeTab === 'aiView' && 'active')}>
                        <AIView />
                    </div>
                </main>
                
                <AudioPlayer />
                <Modals />
            </div>
        </div>
    );
}


// Sub-components for each section
const Header = ({ onSwitchTab, onToggleTheme, isDark }: { onSwitchTab: (id: string) => void, onToggleTheme: () => void, isDark: boolean }) => {
    return (
        <header className="fixed top-0 w-full z-40 glass-panel border-b border-gray-200/20 dark:border-white/10 transition-colors">
             <div class="container mx-auto px-4 h-16 flex items-center justify-between">
            <div class="flex items-center gap-4">
                <h1 class="text-2xl font-bold text-primary font-amiri flex items-center gap-2">
                    <BookOpen />
                    المصحف الذكي
                </h1>
            </div>

            <div class="flex items-center gap-2 md:gap-4">
                <button title="إذاعة القرآن الكريم" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition text-emerald-500">
                    <Radio />
                </button>
                <button onClick={onToggleTheme} class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition">
                    {isDark ? <Sun /> : <Moon />}
                </button>
                <button title="Settings" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition">
                    <Settings />
                </button>
            </div>
        </div>
        </header>
    );
}

const MobileNav = ({ onSwitchTab, activeTab }: { onSwitchTab: (id: string) => void, activeTab: string }) => {
    const navItems = [
        { id: 'surahsView', label: 'السور', icon: List },
        { id: 'playlistsView', label: 'القوائم', icon: List },
        { id: 'mushafView', label: 'المصحف', icon: BookOpen },
        { id: 'khatmaView', label: 'الختمة', icon: Target },
        { id: 'prayerView', label: 'الصلاة', icon: Compass },
        { id: 'adhkarView', label: 'الأذكار', icon: Shield },
        { id: 'analyticsView', label: 'إحصائيات', icon: PieChart },
        { id: 'aiView', label: 'AI', icon: Cpu },
    ];
    return (
         <nav class="md:hidden fixed bottom-24 w-full z-30 glass-panel border-t border-gray-200/20 dark:border-white/10 overflow-x-auto scrollbar-hide">
        <ul class="flex justify-start sm:justify-around p-3 text-xs w-max sm:w-full gap-5 px-4">
           {navItems.map(item => (
                <li key={item.id}>
                    <button onClick={() => onSwitchTab(item.id)} className={cn("flex flex-col items-center gap-1", activeTab === item.id ? "text-primary" : "opacity-70")}>
                        <item.icon className="w-5 h-5" />
                        {item.label}
                    </button>
                </li>
           ))}
        </ul>
    </nav>
    );
}

const SurahsView = () => {
    const [surahs, setSurahs] = useState<any[]>([]);
    const [filteredSurahs, setFilteredSurahs] = useState<any[]>([]);
    const [reciters, setReciters] = useState<any[]>([]);
    const [dailyAyah, setDailyAyah] = useState<any>(null);
    const [dailyTafsir, setDailyTafsir] = useState<string>('');
    const [showTafsir, setShowTafsir] = useState(false);
    
    useEffect(() => {
        const fetchAll = async () => {
            // Fetch surahs
            try {
                const res = await fetch('https://api.alquran.cloud/v1/meta');
                const data = await res.json();
                setSurahs(data.data.surahs.references);
                setFilteredSurahs(data.data.surahs.references);
            } catch (error) {
                console.error("Error fetching surahs", error);
            }

            // Fetch reciters
            try {
                const res = await fetch('https://www.mp3quran.net/api/v3/reciters?language=ar');
                const data = await res.json();
                 data.reciters.sort((a:any, b:any) => a.name.localeCompare(b.name, 'ar'));
                setReciters(data.reciters);
            } catch (error) {
                console.error("Error fetching reciters", error);
            }
            
            fetchDailyAyah();
        }
        fetchAll();
    }, []);

    const fetchDailyAyah = async () => {
        setShowTafsir(false);
        setDailyTafsir('');
        try {
            const randomNum = Math.floor(Math.random() * 6236) + 1;
            const res = await fetch(`https://api.alquran.cloud/v1/ayah/${randomNum}/ar.alafasy`);
            const data = await res.json();
            setDailyAyah(data.data);
        } catch (error) {
            console.error("Error fetching daily ayah", error);
        }
    }
    
    const showTafsirHandler = async () => {
        if (showTafsir) {
            setShowTafsir(false);
            return;
        }
        setShowTafsir(true);
        if (dailyAyah && !dailyTafsir) {
             try {
                const res = await fetch(`https://api.alquran.cloud/v1/ayah/${dailyAyah.number}/ar.muyassar`);
                const data = await res.json();
                setDailyTafsir(data.data.text);
            } catch(e) {
                setDailyTafsir("تعذر تحميل التفسير.");
            }
        }
    }
    
    const filterSurahs = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value.toLowerCase().replace(/[أإآ]/g, 'ا');
        const filtered = surahs.filter(s => 
            s.name.replace(/[أإآ]/g, 'ا').toLowerCase().includes(term) ||
            s.englishName.toLowerCase().includes(term)
        );
        setFilteredSurahs(filtered);
    }
    
    return (
        <section>
            {/* Daily Ayah */}
             <div id="dailyAyahCard" className="glass-panel rounded-2xl p-6 mb-8 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <h2 className="text-xl font-bold mb-4 opacity-80">✨ آية اليوم</h2>
                <div className="font-amiri text-3xl leading-relaxed mb-4">{dailyAyah ? `"${dailyAyah.text}"` : "جاري التحميل..."}</div>
                <div className="text-sm opacity-70 mb-4">{dailyAyah && `[سورة ${dailyAyah.surah.name} - آية ${dailyAyah.numberInSurah}]`}</div>
                
                {showTafsir && <div className="font-sans text-sm leading-loose mb-4 bg-white/5 p-4 rounded-xl text-right">{dailyTafsir || <Loader2 className="animate-spin mx-auto"/>}</div>}

                <div className="flex flex-wrap justify-center gap-2 mt-4 relative z-10">
                    <button className="shine-effect bg-primary text-white px-4 py-2 rounded-full inline-flex items-center gap-2 hover:scale-105 transition transform text-sm">
                        <Cpu className="w-4 h-4" /> تأملات (AI)
                    </button>
                    <button onClick={showTafsirHandler} className="bg-indigo-500 text-white px-4 py-2 rounded-full inline-flex items-center gap-2 hover:scale-105 transition transform text-sm">
                        <BookOpen className="w-4 h-4" /> التفسير
                    </button>
                    <button onClick={fetchDailyAyah} className="bg-gray-500 text-white px-4 py-2 rounded-full inline-flex items-center gap-2 hover:scale-105 transition transform text-sm">
                        <RefreshCw className="w-4 h-4" /> تجديد الآية
                    </button>
                    <button className="bg-emerald-600 text-white px-4 py-2 rounded-full inline-flex items-center gap-2 hover:scale-105 transition transform text-sm">
                        <DownloadIcon className="w-4 h-4" /> حفظ كصورة
                    </button>
                </div>
            </div>

            {/* Controls */}
             <div className="glass-panel rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute right-3 top-3 text-gray-400" />
                    <input type="text" placeholder="ابحث عن سورة (بدون همزات)..." className="w-full bg-white/5 border border-gray-300 dark:border-white/20 rounded-xl py-2 pr-10 pl-4 focus:outline-none focus:border-primary transition dark:text-white" onChange={filterSurahs} />
                </div>
                
                <div className="flex gap-2 md:gap-4 w-full md:w-auto">
                    <button className="bg-white/5 border border-gray-300 dark:border-white/20 rounded-xl p-2 px-3 focus:outline-none hover:text-red-500 transition shrink-0" title="عرض المفضلة فقط">
                        <Heart className="w-5 h-5" />
                    </button>
                    
                    <select className="bg-white/5 border border-gray-300 dark:border-white/20 rounded-xl py-2 px-4 focus:outline-none dark:text-white flex-1 md:w-64 text-sm">
                       {reciters.length > 0 ? reciters.map(r => {
                           const mushaf = r.moshaf.find((m:any) => m.moshaf_type === 1) || r.moshaf[0];
                           if (!mushaf) return null;
                           return <option key={r.id} value={r.id}>{r.name}</option>
                       }) : <option>جاري التحميل...</option>}
                    </select>
                </div>
            </div>

            {/* Surahs Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {filteredSurahs.length > 0 ? filteredSurahs.map(s => <SurahCard key={s.number} surah={s} />) : <p>جاري تحميل السور...</p>}
            </div>
        </section>
    );
};

const SurahCard = ({ surah }: { surah: any }) => {
    const isMakki = surah.revelationType === 'Meccan';
    const borderColor = isMakki ? 'border-blue-500/50' : 'border-emerald-500/50';

    return (
        <div className={`glass-panel rounded-xl p-5 border-t-4 ${borderColor} hover:-translate-y-1 transition transform duration-300 relative group cursor-pointer`}>
            <div className="absolute top-3 right-3 z-10 flex gap-2">
                <button className="p-1 transition text-gray-400 hover:text-primary"><Plus className="w-5 h-5" /></button>
                <button className="p-1 transition text-gray-400 hover:text-red-500"><Heart className="w-5 h-5" /></button>
            </div>
            <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold border border-white/20">{surah.number}</div>
            
            <h3 className="text-2xl font-amiri font-bold mb-1 text-primary mt-2">{surah.name}</h3>
            <p className="text-sm opacity-70 mb-4">{surah.englishName} • {surah.numberOfAyahs} آية</p>
            
            <div className="flex items-center justify-between mt-4">
                 <span className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10">{isMakki ? 'مكية' : 'مدنية'}</span>
                <div className="flex gap-2">
                    <button title="حفظ للاستماع بدون إنترنت" className="p-1.5 rounded-full hover:bg-white/20 transition text-gray-500 dark:text-gray-300"><DownloadIcon className="w-4 h-4" /></button>
                    <button title="معلومات وتأملات السورة" className="p-1.5 rounded-full hover:bg-white/20 transition text-gray-500 dark:text-gray-300"><Info className="w-4 h-4" /></button>
                    <button className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:scale-110 transition shadow"><Play className="w-4 h-4 translate-x-[1px]" /></button>
                </div>
            </div>
        </div>
    )
}

const SearchView = () => {
    // ... SearchView JSX and logic
    return (
         <div className="glass-panel rounded-2xl p-8 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Search /> البحث المتقدم في الآيات</h2>
                <div className="flex gap-4 mb-6">
                    <input type="text" id="ayahSearchInput" placeholder="اكتب كلمة أو جملة من آية للبحث عنها..." className="w-full bg-white/5 border border-gray-300 dark:border-white/20 rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition dark:text-white" />
                    <button className="bg-primary text-white px-6 py-2 rounded-xl hover:opacity-90 transition flex items-center gap-2">
                        <Search className="w-4 h-4" /> بحث
                    </button>
                </div>
                <div id="searchLoader" className="hidden text-center text-primary py-4"><Loader2 className="animate-spin w-6 h-6 mx-auto" /></div>
                <div id="searchResults" className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    <div className="opacity-70 text-center py-10 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl">نتائج البحث في الآيات ستظهر هنا</div>
                </div>
            </div>
    )
}
const MemorizeView = () => {
    // ... MemorizeView JSX and logic
     return (
        <div className="glass-panel rounded-2xl p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Repeat /> مساعد الحفظ التكراري</h2>
                
                <div className="space-y-6">
                    <div>
                        <label className="block mb-2 text-sm opacity-80">اختر السورة</label>
                        <select id="memSurahSelect" className="w-full bg-white/5 border border-gray-300 dark:border-white/20 rounded-xl py-3 px-4 focus:outline-none">
                        </select>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block mb-2 text-sm opacity-80">من آية</label>
                            <input type="number" id="memStartAyah" min="1" defaultValue="1" className="w-full bg-white/5 border border-gray-300 dark:border-white/20 rounded-xl py-3 px-4 focus:outline-none"/>
                        </div>
                        <div className="flex-1">
                            <label className="block mb-2 text-sm opacity-80">إلى آية</label>
                            <input type="number" id="memEndAyah" min="1" defaultValue="5" className="w-full bg-white/5 border border-gray-300 dark:border-white/20 rounded-xl py-3 px-4 focus:outline-none"/>
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm opacity-80">عدد مرات التكرار لكل آية</label>
                        <input type="number" id="memRepeatCount" min="1" max="100" defaultValue="3" className="w-full bg-white/5 border border-gray-300 dark:border-white/20 rounded-xl py-3 px-4 focus:outline-none"/>
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                        <input type="checkbox" id="memQuizMode" className="w-5 h-5 accent-primary cursor-pointer"/>
                        <label htmlFor="memQuizMode" className="text-sm font-semibold cursor-pointer">تفعيل وضع الاختبار (إخفاء بعض الكلمات لاختبار حفظك)</label>
                    </div>

                    <button className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:opacity-90 transition shine-effect">
                        بدء جلسة الحفظ
                    </button>
                </div>

                <div id="memStatus" className="mt-6 text-center font-amiri text-2xl hidden p-4 bg-white/5 rounded-xl border border-primary/30">
                </div>
            </div>
    )
}
const PlaylistsView = () => {
    // ... PlaylistsView JSX and logic
     return (
        <div className="glass-panel rounded-2xl p-8 max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-primary"><List /> قوائم التشغيل المخصصة</h2>
                    <button className="bg-primary text-white font-bold py-2 px-6 rounded-xl hover:opacity-90 transition flex items-center gap-2">
                        <Plus /> إنشاء قائمة جديدة
                    </button>
                </div>
                <div id="playlistsGrid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="col-span-full text-center py-10 opacity-70">لم تقم بإنشاء أي قائمة تشغيل بعد.</div>
                </div>
            </div>
    )
}
const MushafView = () => {
    const [page, setPage] = useState(1);
    const [mushafImageSrc, setMushafImageSrc] = useState<string | null>(null);
    const [isMushafLoading, setIsMushafLoading] = useState(true);

    const loadPage = useCallback((pageNum: number | string) => {
        const num = Number(pageNum);
        if (num < 1 || num > 604) return;
        setPage(num);
        setIsMushafLoading(true);
        const padPage = String(num).padStart(3, '0');
        setMushafImageSrc(`https://raw.githubusercontent.com/quran/quran.com-images/master/width_1024/page${padPage}.png`);
    }, []);

    useEffect(() => {
        loadPage(1);
    }, [loadPage]);

    return (
        <section>
            <div className="flex flex-col items-center justify-center">
                <div className="glass-panel p-4 rounded-xl mb-4 flex gap-4 items-center flex-wrap justify-center">
                    <button onClick={() => loadPage(page + 1)} className="p-2 bg-white/10 rounded hover:bg-white/20"><ChevronsRight /></button>
                    <div className="flex items-center gap-2">
                        <span>صفحة</span>
                        <input type="number" value={page} min="1" max="604" onChange={(e) => loadPage(e.target.value)} className="w-16 text-center bg-transparent border-b border-gray-400 focus:outline-none dark:text-white" />
                        <span>من 604</span>
                    </div>
                    <button onClick={() => loadPage(page - 1)} className="p-2 bg-white/10 rounded hover:bg-white/20"><ChevronsLeft /></button>
                    <div className="w-px h-6 bg-gray-400/30 mx-2 hidden sm:block"></div>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 rounded hover:bg-yellow-500/20 transition text-sm">
                        <Bookmark className="w-4 h-4" /> <span>حفظ العلامة</span>
                    </button>
                </div>
                
                <div className="glass-panel p-2 rounded-xl max-w-full overflow-hidden flex justify-center min-h-[600px] w-full md:w-auto relative">
                    {isMushafLoading && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>}
                    {mushafImageSrc && <img src={mushafImageSrc} alt="صفحة المصحف" className={cn("max-w-full h-auto rounded shadow-lg", isMushafLoading && "hidden")} onLoad={() => setIsMushafLoading(false)} onError={() => setIsMushafLoading(false)} referrerPolicy="no-referrer" />}
                </div>
            </div>
        </section>
    );
}

const KhatmaView = () => {
    // ... KhatmaView JSX and logic
     return (
        <div className="glass-panel rounded-2xl p-8 max-w-2xl mx-auto text-center">
                <h2 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2 text-primary"><Target /> خطة ختم القرآن الكريم</h2>
                
                <div id="khatmaSetup" className="space-y-6">
                    <p className="opacity-80 text-lg">كم يوماً تريد أن تختم القرآن فيه؟</p>
                    <input type="number" id="khatmaDays" min="3" max="365" defaultValue="30" className="w-32 text-center bg-white/5 border border-gray-300 dark:border-white/20 rounded-xl py-3 px-4 focus:outline-none text-2xl mx-auto block font-bold"/>
                    <p className="text-sm opacity-60">المدة الافتراضية شهر (30 يوماً)</p>
                    <button className="bg-primary text-white font-bold py-3 px-10 rounded-xl hover:opacity-90 transition shine-effect mt-4">
                        إنشاء الختمة وبدء المتابعة
                    </button>
                </div>

                <div id="khatmaProgress" className="hidden space-y-8">
                    <div className="flex justify-between items-end mb-2 bg-white/5 p-6 rounded-2xl border border-white/10">
                        <div className="text-right">
                            <div className="text-sm opacity-70 mb-1">الورد اليومي المطلوب</div>
                            <div className="text-3xl font-bold text-primary" id="khatmaDailyPages">20 صفحة</div>
                        </div>
                        <div className="text-left">
                            <div className="text-sm opacity-70 mb-1">أيام متبقية</div>
                            <div className="text-3xl font-bold" id="khatmaDaysLeft">30</div>
                        </div>
                    </div>
                    
                    <div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative overflow-hidden mb-2">
                            <div id="khatmaProgressBar" className="bg-primary h-4 rounded-full transition-all duration-1000" style={{width: '0%'}}></div>
                        </div>
                        <p id="khatmaStatusText" className="text-sm opacity-80 font-semibold">لقد قرأت 0 من أصل 604 صفحة</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                        <button className="flex-1 bg-primary text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 shine-effect">
                            <CheckCircle /> أتممت ورد اليوم
                        </button>
                        <button className="sm:w-auto bg-red-500/10 text-red-500 border border-red-500/20 font-bold py-3 px-6 rounded-xl hover:bg-red-500/20 transition">
                            إلغاء الخطة
                        </button>
                    </div>
                </div>
            </div>
    )
}
const PrayerTimesView = () => {
    // ... PrayerTimesView JSX and logic
     return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel rounded-2xl p-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><i data-feather="clock"></i> مواقيت الصلاة</h2>
                    
                    <div id="locationAlert" className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 p-4 rounded-xl mb-6 text-sm flex gap-2">
                        <Info className="w-5 h-5 flex-shrink-0" />
                        <span>يرجى السماح بالوصول إلى الموقع الجغرافي لحساب مواقيت الصلاة بدقة.</span>
                    </div>

                    <div id="nextPrayerCountdown" className="text-center mb-8">
                        <div className="text-sm opacity-70 mb-2">الصلاة القادمة</div>
                        <div className="text-4xl font-bold text-primary" id="countdownTimer">--:--:--</div>
                        <div className="text-xl mt-1" id="nextPrayerName">--</div>
                    </div>

                    <div className="mb-4 bg-primary/10 text-primary p-3 rounded-xl text-center text-sm font-bold border border-primary/20">
                        <Check className="inline w-4 h-4 mr-1" /> سجل صلوات اليوم
                    </div>

                    <div className="space-y-3" id="prayerTimesList">
                    </div>
                    <button className="mt-6 w-full py-2 bg-white/10 rounded-xl hover:bg-white/20 transition text-sm">
                        تحديث الموقع والمواقيت
                    </button>
                </div>

                <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><i data-feather="navigation"></i> اتجاه القبلة</h2>
                    <div className="relative w-64 h-64 border-4 border-gray-300 dark:border-white/20 rounded-full flex items-center justify-center mb-6">
                        <div className="absolute inset-0 rounded-full bg-black/5 dark:bg-white/5"></div>
                        <span className="absolute top-2 font-bold opacity-50">N</span>
                        <span className="absolute bottom-2 font-bold opacity-50">S</span>
                        <span className="absolute right-2 font-bold opacity-50">E</span>
                        <span className="absolute left-2 font-bold opacity-50">W</span>
                        <div id="qiblaNeedle" className="compass-needle absolute w-2 h-48 flex flex-col items-center justify-start transform rotate-0 origin-center">
                            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[24px] border-b-primary -mt-4"></div>
                            <div className="w-1 h-20 bg-primary/50"></div>
                        </div>
                    </div>
                    <p className="text-sm opacity-70" id="qiblaInfo">الرجاء تفعيل الموقع لمعرفة اتجاه القبلة.</p>
                </div>
            </div>
    )
}
const AdhkarView = () => {
    // ... AdhkarView JSX and logic
    return (
        <div className="glass-panel rounded-2xl p-8 max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2"><Shield /> الأذكار والرقية الشرعية</h2>
                    <select id="adhkarCategory" className="bg-white/5 border border-gray-300 dark:border-white/20 rounded-xl py-2 px-4 focus:outline-none dark:text-white">
                        <option value="morning">أذكار الصباح</option>
                        <option value="evening">أذكار المساء</option>
                        <option value="ruqyah">الرقية الشرعية</option>
                    </select>
                </div>
                <div id="adhkarContainer" className="space-y-4">
                </div>
            </div>
    )
}
const AnalyticsView = () => {
    // ... AnalyticsView JSX and logic
     return (
        <div className="glass-panel rounded-2xl p-8 max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-primary"><PieChart /> لوحة الإحصائيات القرآنية</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/5 border border-gray-300 dark:border-white/10 p-5 rounded-xl text-center shadow-sm">
                        <div className="text-sm opacity-70 mb-2">إجمالي وقت الاستماع</div>
                        <div className="text-3xl font-bold text-primary" id="statTotalListen">0 س</div>
                    </div>
                    <div className="bg-white/5 border border-gray-300 dark:border-white/10 p-5 rounded-xl text-center shadow-sm">
                        <div className="text-sm opacity-70 mb-2">الصفحات المقروءة</div>
                        <div className="text-3xl font-bold text-emerald-500" id="statTotalPages">0</div>
                    </div>
                    <div className="bg-white/5 border border-gray-300 dark:border-white/10 p-5 rounded-xl text-center shadow-sm">
                        <div className="text-sm opacity-70 mb-2">قارئك المفضل</div>
                        <div className="text-xl font-bold text-blue-500 truncate" id="statFavReciter">-</div>
                    </div>
                    <div className="bg-white/5 border border-gray-300 dark:border-white/10 p-5 rounded-xl text-center shadow-sm">
                        <div className="text-sm opacity-70 mb-2">تقدم الختمة الحالية</div>
                        <div className="text-3xl font-bold text-yellow-500" id="statKhatmaProgress">0%</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/5 border border-gray-300 dark:border-white/10 p-5 rounded-xl shadow-sm">
                        <h3 className="font-bold mb-4 text-sm opacity-80 text-center">نشاطك في آخر 7 أيام</h3>
                        <div className="relative h-64">
                            <canvas id="activityChart"></canvas>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-gray-300 dark:border-white/10 p-5 rounded-xl shadow-sm flex flex-col items-center">
                        <h3 className="font-bold mb-4 text-sm opacity-80 text-center">القراء الأكثر استماعاً</h3>
                        <div className="relative w-full max-w-[250px] flex-1">
                            <canvas id="recitersChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
    )
}
const AIView = () => {
    // ... AIView JSX and logic
     return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="glass-panel rounded-2xl p-8">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary"><Heart /> كيف تشعر اليوم؟</h2>
                    <p className="text-sm opacity-70 mb-4">أخبرني بشعورك وسأقترح عليك آيات وسور تواسي قلبك.</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                        <button className="px-4 py-2 bg-white/10 rounded-full hover:bg-primary hover:text-white transition text-sm">حزين ومهموم</button>
                        <button className="px-4 py-2 bg-white/10 rounded-full hover:bg-primary hover:text-white transition text-sm">قلق ومتوتر</button>
                        <button className="px-4 py-2 bg-white/10 rounded-full hover:bg-primary hover:text-white transition text-sm">أبحث عن الأمل</button>
                        <button className="px-4 py-2 bg-white/10 rounded-full hover:bg-primary hover:text-white transition text-sm">سعيد وشاكر</button>
                    </div>
                    
                    <textarea id="customFeeling" placeholder="أو اكتب شعورك هنا..." className="w-full h-24 bg-white/5 border border-gray-300 dark:border-white/20 rounded-xl p-3 mb-4 focus:outline-none focus:border-primary resize-none"></textarea>
                    
                    <button className="w-full bg-primary text-white font-bold py-2 rounded-xl hover:opacity-90 transition shine-effect flex justify-center items-center gap-2">
                        <Cpu className="w-4 h-4" /> اسأل المساعد الذكي
                    </button>
                </div>

                <div className="glass-panel rounded-2xl p-8 flex flex-col h-full">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><MessageSquare /> الإجابة الربانية</h2>
                    <div id="aiResponseArea" className="flex-1 bg-white/5 border border-white/10 rounded-xl p-6 font-amiri text-lg leading-loose overflow-y-auto max-h-[400px]">
                        <div className="opacity-50 text-center mt-10 text-sm font-sans">اختر شعورك أو اطرح سؤالاً لترى الإجابة هنا.</div>
                    </div>
                    <div id="aiLoader" className="hidden mt-4 text-center text-primary text-sm flex justify-center items-center gap-2">
                        <Loader2 className="animate-spin w-4 h-4" /> المساعد يتدبر ويستخرج الإجابة...
                    </div>
                </div>

            </div>
    )
}

const AudioPlayer = () => {
    // ... AudioPlayer JSX and logic
    return (
        <div className="fixed bottom-0 w-full z-50 glass-panel border-t border-gray-200/20 dark:border-white/10 px-4 py-3 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-4 w-full md:w-1/4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
                    <List />
                </div>
                <div className="flex-1 overflow-hidden">
                    <div id="playerSurahName" className="font-bold truncate text-sm md:text-base">لم يتم اختيار سورة</div>
                    <div id="playerReciterName" className="text-xs opacity-70 truncate">الرجاء الاختيار من القائمة</div>
                </div>
            </div>

            <div className="flex flex-col w-full md:w-2/4 items-center">
                <div className="flex items-center gap-6 mb-2">
                    <button id="btnShuffle" className="text-gray-500 hover:text-primary transition p-1 rounded-full"><Shuffle className="w-4 h-4" /></button>
                    <button className="text-gray-600 dark:text-gray-300 hover:text-primary transition"><SkipBack className="w-5 h-5" /></button>
                    
                    <button id="btnPlayPause" className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 transition shadow-lg shine-effect">
                        <Play className="w-6 h-6 translate-x-[2px]" />
                    </button>
                    
                    <button className="text-gray-600 dark:text-gray-300 hover:text-primary transition"><SkipForward className="w-5 h-5" /></button>
                    <button id="btnRepeat" className="text-gray-500 hover:text-primary transition p-1 rounded-full"><Repeat className="w-4 h-4" /></button>
                </div>
                
                <div className="w-full flex items-center gap-3 text-xs opacity-80">
                    <span id="currentTime">00:00</span>
                    <div className="flex-1 h-2 bg-gray-300 dark:bg-gray-700 rounded-full relative cursor-pointer group">
                        <div id="progressFill" className="absolute top-0 right-0 h-full bg-primary rounded-full w-0 group-hover:bg-opacity-80 transition-all"></div>
                        <div id="progressThumb" className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow border border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" style={{right: '0%'}}></div>
                    </div>
                    <span id="totalTime">00:00</span>
                </div>
            </div>

            <div className="hidden md:flex items-center gap-3 w-1/4 justify-end">
                <Volume2 className="w-4 h-4 opacity-70" />
                <input type="range" id="volumeControl" min="0" max="1" step="0.05" defaultValue="1" className="w-24 h-1 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"/>
            </div>
            
        </div>
        </div>
    );
}

const Modals = () => {
    // ... Modals JSX
    return null;
}
