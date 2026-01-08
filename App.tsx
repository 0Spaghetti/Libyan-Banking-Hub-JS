import React, { useState, useEffect } from 'react';
import { Bank, Branch, LiquidityStatus, ViewState } from './types';
import { BANKS, MOCK_BRANCHES } from './constants';
import StatusBadge from './components/StatusBadge';
import BranchMap, { MiniBranchMap } from './components/BranchMap';
import Toast from './components/Toast';
import { 
  IconBank, IconMapPin, IconSearch, IconBack, 
  IconRefresh, IconSparkles, IconSun, IconMoon, IconFilter, IconPlus, IconLoader, IconClose, IconChevronDown, IconChevronUp, IconHeart
} from './components/Icons';
import { analyzeLiquidity } from './services/geminiService';

// --- Sub-components for better organization ---

interface HeaderProps {
  title: string;
  showBack: boolean;
  onBack: () => void;
  onViewMap: (view: ViewState) => void;
  onAddData: () => void;
  currentView: ViewState;
  isDark: boolean;
  toggleTheme: () => void;
}

const Header = ({ title, showBack, onBack, onViewMap, onAddData, currentView, isDark, toggleTheme }: HeaderProps) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:border-gray-700 transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={onBack} className="p-2 -mr-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
              <IconBack className="w-6 h-6 rotate-180" />
            </button>
          )}
          <h1 className="text-xl font-bold text-primary-800 dark:text-primary-400 tracking-tight">{title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            title={isDark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
          >
            {isDark ? <IconSun className="w-5 h-5" /> : <IconMoon className="w-5 h-5" />}
          </button>

          {currentView !== 'AUTH' && currentView !== 'SPLASH' && (
             <>
               <button 
                 onClick={onAddData}
                 className="p-2 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors hidden md:block"
                 title="إضافة بيانات (مسؤول)"
               >
                 <IconPlus className="w-6 h-6" />
               </button>
               <button 
                 onClick={() => onViewMap(currentView === 'MAP' ? 'HOME' : 'MAP')} 
                 className="p-2 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors hidden md:block"
               >
                 {currentView === 'MAP' ? <IconBank className="w-6 h-6" /> : <IconMapPin className="w-6 h-6" />}
               </button>
             </>
          )}
        </div>
      </div>
    </header>
  );
};

const BottomNav = ({ view, setView, onResetSelection }: { view: ViewState, setView: (v: ViewState) => void, onResetSelection: () => void }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 pb-6 pt-2 px-6 flex justify-between items-center md:hidden z-[60] transition-all duration-300 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
      <button 
        onClick={() => { setView('HOME'); onResetSelection(); }} 
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
          view === 'HOME' || view === 'BANK_DETAILS'
            ? 'text-primary-600 dark:text-primary-400 -translate-y-2' 
            : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
        }`}
      >
        <div className={`p-1.5 rounded-full transition-all ${view === 'HOME' || view === 'BANK_DETAILS' ? 'bg-primary-50 dark:bg-primary-900/30 ring-4 ring-white dark:ring-gray-800 shadow-sm' : ''}`}>
          <IconBank className={`w-6 h-6 transition-transform ${view === 'HOME' || view === 'BANK_DETAILS' ? 'scale-110' : ''}`} />
        </div>
        <span className="text-[10px] font-bold">المصارف</span>
      </button>

      <button 
        onClick={() => setView('MAP')} 
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
          view === 'MAP'
            ? 'text-primary-600 dark:text-primary-400 -translate-y-2' 
            : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
        }`}
      >
        <div className={`p-1.5 rounded-full transition-all ${view === 'MAP' ? 'bg-primary-50 dark:bg-primary-900/30 ring-4 ring-white dark:ring-gray-800 shadow-sm' : ''}`}>
          <IconMapPin className={`w-6 h-6 transition-transform ${view === 'MAP' ? 'scale-110' : ''}`} />
        </div>
        <span className="text-[10px] font-bold">الخريطة</span>
      </button>

      <button 
        onClick={() => setView('ADD_DATA')} 
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
          view === 'ADD_DATA' 
            ? 'text-primary-600 dark:text-primary-400 -translate-y-2' 
            : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
        }`}
      >
        <div className={`p-1.5 rounded-full transition-all ${view === 'ADD_DATA' ? 'bg-primary-50 dark:bg-primary-900/30 ring-4 ring-white dark:ring-gray-800 shadow-sm' : ''}`}>
          <IconPlus className={`w-6 h-6 transition-transform ${view === 'ADD_DATA' ? 'scale-110' : ''}`} />
        </div>
        <span className="text-[10px] font-bold">إضافة</span>
      </button>
    </div>
  );
};

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-600 to-primary-800 flex flex-col items-center justify-center text-white z-50">
      <div className="animate-bounce mb-6 bg-white p-6 rounded-3xl shadow-2xl bg-opacity-10 backdrop-blur-md">
        <IconBank className="w-24 h-24 text-white" />
      </div>
      <h1 className="text-4xl font-bold mb-2">دليلي المصرفي</h1>
      <p className="text-primary-100 text-lg opacity-80 animate-pulse">رفيقك المالي في ليبيا</p>
    </div>
  );
};

const AuthScreen = ({ onLogin, onGuest }: { onLogin: () => void; onGuest: () => void }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
            <IconBank className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">تسجيل الدخول</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">قم بتسجيل الدخول للإبلاغ عن حالة السيولة</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
            <input type="email" className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-left" dir="ltr" placeholder="user@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كلمة المرور</label>
            <input type="password" className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-left" dir="ltr" placeholder="••••••••" />
          </div>
          
          <button onClick={onLogin} className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30">
            دخول
          </button>
          
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">أو</span></div>
          </div>

          <button onClick={onGuest} className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            تصفح كزائر
          </button>
        </div>
      </div>
    </div>
  );
};

interface BranchCardProps {
  branch: Branch;
  onReport: (b: Branch) => void;
}

const BranchCard = ({ branch, onReport }: BranchCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const showMap = expanded || hovered;

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex-1 cursor-pointer" onClick={() => setExpanded(!expanded)}>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {branch.name}
              </h3>
              {branch.isAtm && (
                <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-blue-100 dark:border-blue-800">
                  ATM
                </span>
              )}
            </div>
            
            <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1.5 mb-4">
              <IconMapPin className="w-4 h-4 text-gray-400" />
              {branch.address}
            </p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            {expanded ? <IconChevronUp className="w-5 h-5" /> : <IconChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Map Preview Area */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showMap ? 'max-h-40 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
           {showMap && <MiniBranchMap branch={branch} />}
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl mb-4 border border-gray-100 dark:border-gray-700/50">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">الحالة</span>
            <StatusBadge status={branch.status} />
          </div>
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
          <div className="flex flex-col gap-1 items-end">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">آخر تحديث</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-mono">
              {branch.lastUpdate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onReport(branch); }}
          className="w-full py-2.5 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-400 hover:border-primary-200 dark:hover:border-primary-800 transition-all flex items-center justify-center gap-2 font-bold text-sm shadow-sm hover:shadow"
        >
          <IconRefresh className="w-4 h-4" />
          <span>إبلاغ عن الحالة</span>
        </button>
      </div>
    </div>
  );
};

interface AddDataScreenProps {
  banks: Bank[];
  onAddBank: (b: Bank) => void;
  onAddBranch: (b: Branch) => void;
}

const AddDataScreen = ({ banks, onAddBank, onAddBranch }: AddDataScreenProps) => {
  const [activeTab, setActiveTab] = useState<'BANK' | 'BRANCH'>('BANK');
  
  // Bank Form State
  const [bankName, setBankName] = useState('');
  const [bankCity, setBankCity] = useState('');
  
  // Branch Form State
  const [selectedBankId, setSelectedBankId] = useState(banks[0]?.id || '');
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [isAtm, setIsAtm] = useState(false);
  
  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !bankCity) return;
    
    // Create new bank object
    onAddBank({
      id: Date.now().toString(),
      name: bankName,
      city: bankCity,
      // Generate a placeholder logo using ui-avatars
      logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(bankName)}&background=random&color=fff`
    });
    
    // Reset form
    setBankName('');
    setBankCity('');
  };

  const handleBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName || !selectedBankId) return;
    
    // Create new branch object
    onAddBranch({
      id: `new-${Date.now()}`,
      bankId: selectedBankId,
      name: branchName,
      address: branchAddress || bankCity,
      // Simulate random coordinates around Tripoli for demo purposes
      lat: 32.88 + (Math.random() * 0.1), 
      lng: 13.19 + (Math.random() * 0.1),
      isAtm,
      status: LiquidityStatus.UNKNOWN,
      lastUpdate: new Date(),
      crowdLevel: 0
    });

    // Reset form
    setBranchName('');
    setBranchAddress('');
    setIsAtm(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-700">
        <button 
          onClick={() => setActiveTab('BANK')}
          className={`flex-1 py-4 font-bold text-sm transition-colors ${activeTab === 'BANK' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
        >
          إضافة مصرف
        </button>
        <button 
          onClick={() => setActiveTab('BRANCH')}
          className={`flex-1 py-4 font-bold text-sm transition-colors ${activeTab === 'BRANCH' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
        >
          إضافة فرع
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'BANK' ? (
          <form onSubmit={handleBankSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم المصرف</label>
              <input 
                type="text" 
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
                placeholder="مثال: مصرف الجمهورية"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المدينة الرئيسية</label>
              <input 
                type="text" 
                value={bankCity}
                onChange={e => setBankCity(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
                placeholder="مثال: طرابلس"
                required
              />
            </div>
            <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30">
              حفظ المصرف
            </button>
          </form>
        ) : (
          <form onSubmit={handleBranchSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اختر المصرف</label>
              <select 
                value={selectedBankId}
                onChange={e => setSelectedBankId(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
              >
                {banks.map(bank => (
                  <option key={bank.id} value={bank.id}>{bank.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم الفرع</label>
              <input 
                type="text" 
                value={branchName}
                onChange={e => setBranchName(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
                placeholder="مثال: فرع ذات العماد"
                required
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العنوان</label>
              <input 
                type="text" 
                value={branchAddress}
                onChange={e => setBranchAddress(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
                placeholder="مثال: طريق الشط"
              />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="isAtm"
                checked={isAtm}
                onChange={e => setIsAtm(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="isAtm" className="text-sm font-medium text-gray-700 dark:text-gray-300">يحتوي على صراف آلي (ATM)</label>
            </div>
             <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900">
               ملاحظة: سيتم تحديد موقع الفرع تلقائياً بشكل تقريبي على الخريطة في هذه النسخة التجريبية.
             </div>
            <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30">
              حفظ الفرع
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

interface ReportModalProps {
  branch: Branch | null;
  onClose: () => void;
  onSubmit: (id: string, status: LiquidityStatus) => void;
}

const ReportModal = ({ branch, onClose, onSubmit }: ReportModalProps) => {
  if (!branch) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">تحديث الحالة</h3>
          <p className="text-gray-500 dark:text-gray-400">{branch.name}</p>
        </div>
        
        <div className="grid grid-cols-1 gap-3 mb-6">
          <button onClick={() => onSubmit(branch.id, LiquidityStatus.AVAILABLE)} className="p-4 rounded-xl border-2 border-green-100 dark:border-green-800 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-800 dark:text-green-200 flex items-center justify-center gap-3 font-bold transition-all">
            <span className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></span> سيولة متوفرة
          </button>
          <button onClick={() => onSubmit(branch.id, LiquidityStatus.CROWDED)} className="p-4 rounded-xl border-2 border-yellow-100 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 flex items-center justify-center gap-3 font-bold transition-all">
            <span className="w-4 h-4 rounded-full bg-yellow-500 shadow-sm"></span> مزدحم جداً
          </button>
          <button onClick={() => onSubmit(branch.id, LiquidityStatus.EMPTY)} className="p-4 rounded-xl border-2 border-red-100 dark:border-red-800 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-800 dark:text-red-200 flex items-center justify-center gap-3 font-bold transition-all">
            <span className="w-4 h-4 rounded-full bg-red-500 shadow-sm"></span> لا توجد سيولة
          </button>
        </div>
        
        <button onClick={onClose} className="w-full py-3 text-gray-500 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">إلغاء</button>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [view, setView] = useState<ViewState>('SPLASH');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  
  // Search & Favorites State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [favoriteBanks, setFavoriteBanks] = useState<Set<string>>(new Set());
  const [homeTab, setHomeTab] = useState<'ALL' | 'FAVORITES'>('ALL');
  
  // State for data
  const [banks, setBanks] = useState<Bank[]>(BANKS);
  const [branches, setBranches] = useState<Branch[]>(MOCK_BRANCHES);
  
  const [reportBranch, setReportBranch] = useState<Branch | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Theme State
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference on mount
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Debounce effect
  useEffect(() => {
    if (searchTerm === debouncedSearchTerm) return;

    setIsSearching(true);
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, debouncedSearchTerm]);

  const toggleTheme = () => setIsDark(!isDark);

  // Splash logic handled by SplashScreen component

  const handleAuth = () => setView('HOME');

  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
    setView('BANK_DETAILS');
    setAiAnalysis(null); // Reset analysis when changing context
  };

  const handleBack = () => {
    if (view === 'BANK_DETAILS') {
      setSelectedBank(null);
      setView('HOME');
    } else if (view === 'MAP') {
      setView('HOME');
    } else if (view === 'ADD_DATA') {
      setView('HOME');
    }
  };

  const toggleFavorite = (e: React.MouseEvent, bankId: string) => {
    e.stopPropagation();
    setFavoriteBanks(prev => {
      const newSet = new Set(Array.from(prev));
      if (newSet.has(bankId)) {
        newSet.delete(bankId);
      } else {
        newSet.add(bankId);
      }
      return newSet;
    });
  };

  const submitReport = (branchId: string, status: LiquidityStatus) => {
    setBranches(prev => prev.map(b => 
      b.id === branchId ? { ...b, status, lastUpdate: new Date(), crowdLevel: status === LiquidityStatus.CROWDED ? 90 : status === LiquidityStatus.EMPTY ? 0 : 40 } : b
    ));
    setReportBranch(null);
    setNotification({ message: 'تم تحديث الحالة بنجاح، شكراً لمساهمتك!', type: 'success' });
  };

  // Logic for adding data
  const handleAddBank = (newBank: Bank) => {
    setBanks(prev => [...prev, newBank]);
    setNotification({ message: 'تم إضافة المصرف بنجاح!', type: 'success' });
    setView('HOME');
  };

  const handleAddBranch = (newBranch: Branch) => {
    setBranches(prev => [...prev, newBranch]);
    setNotification({ message: 'تم إضافة الفرع بنجاح!', type: 'success' });
    setView('HOME');
  };

  const runAnalysis = async () => {
    if (!selectedBank) return;
    setIsAnalyzing(true);
    const bankBranches = branches.filter(b => b.bankId === selectedBank.id);
    const result = await analyzeLiquidity(bankBranches, selectedBank.city);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const filteredBanks = banks.filter(bank => {
    // 1. Tab Filter
    if (homeTab === 'FAVORITES' && !favoriteBanks.has(bank.id)) {
      return false;
    }

    // 2. Search Filter
    let matchesSearch = true;
    const term = debouncedSearchTerm.trim().toLowerCase();
    
    if (term) {
       // Check bank details
       const nameMatch = bank.name.toLowerCase().includes(term) || bank.city.toLowerCase().includes(term);
       // Check branch details
       const bankBranches = branches.filter(b => b.bankId === bank.id);
       const branchMatch = bankBranches.some(branch => 
         branch.name.toLowerCase().includes(term) || 
         branch.address.toLowerCase().includes(term)
       );
       matchesSearch = nameMatch || branchMatch;
    }

    if (!matchesSearch) return false;

    // 3. Availability Filter
    if (showAvailableOnly) {
      const bankBranches = branches.filter(b => b.bankId === bank.id);
      const hasAvailableBranch = bankBranches.some(b => b.status === LiquidityStatus.AVAILABLE);
      if (!hasAvailableBranch) return false;
    }

    return true;
  });
  
  const currentBranches = selectedBank ? branches.filter(b => b.bankId === selectedBank.id) : [];

  if (view === 'SPLASH') return <SplashScreen onComplete={() => setView('AUTH')} />;
  if (view === 'AUTH') return <AuthScreen onLogin={handleAuth} onGuest={handleAuth} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans transition-colors relative">
      <Header 
        title={view === 'BANK_DETAILS' ? selectedBank?.name || '' : (view === 'MAP' ? 'خريطة الفروع' : (view === 'ADD_DATA' ? 'إضافة بيانات' : 'دليلي المصرفي'))}
        showBack={view !== 'HOME'}
        onBack={handleBack}
        onViewMap={setView}
        onAddData={() => setView('ADD_DATA')}
        currentView={view}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 pb-28 md:pb-4">
        
        {view === 'HOME' && (
          <div className="animate-in fade-in duration-300">
            {/* Tabs */}
            <div className="flex p-1 bg-gray-200 dark:bg-gray-700 rounded-xl mb-6">
              <button
                onClick={() => setHomeTab('ALL')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  homeTab === 'ALL' 
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                جميع المصارف
              </button>
              <button
                onClick={() => setHomeTab('FAVORITES')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  homeTab === 'FAVORITES' 
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                المفضلة
              </button>
            </div>

            <div className="flex gap-2 mb-6">
              <div className="relative flex-1 group">
                {isSearching ? (
                  <IconLoader className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-500 w-5 h-5 animate-spin pointer-events-none" />
                ) : (
                  <IconSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 pointer-events-none" />
                )}
                <input 
                  type="text" 
                  placeholder="ابحث عن مصرف أو مدينة..." 
                  className="w-full p-4 pr-12 pl-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all duration-300 focus:shadow-lg focus:scale-[1.01]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="مسح البحث"
                  >
                    <IconClose className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button 
                onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                className={`p-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  showAvailableOnly 
                    ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200 dark:shadow-none' 
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                title="إظهار المصارف المتوفرة بها سيولة فقط"
              >
                <IconFilter className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-bold">سيولة متوفرة</span>
              </button>
            </div>

            {filteredBanks.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredBanks.map(bank => (
                  <button 
                    key={bank.id}
                    onClick={() => handleBankSelect(bank)}
                    className="relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center gap-4 group"
                  >
                    {/* Favorite Toggle Button */}
                    <div 
                      onClick={(e) => toggleFavorite(e, bank.id)}
                      className="absolute top-3 left-3 p-2 rounded-full bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500 transition-colors z-10"
                      title={favoriteBanks.has(bank.id) ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                    >
                      <IconHeart 
                        className={`w-5 h-5 transition-all ${favoriteBanks.has(bank.id) ? 'text-red-500' : ''}`} 
                        filled={favoriteBanks.has(bank.id)}
                      />
                    </div>

                    <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-700 overflow-hidden flex items-center justify-center border dark:border-gray-600 group-hover:border-primary-200 dark:group-hover:border-primary-500/50 transition-colors">
                      <img src={bank.logoUrl} alt={bank.name} className="w-full h-full object-cover opacity-90 hover:opacity-100" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-100">{bank.name}</h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full mt-2 inline-block">{bank.city}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 opacity-60">
                {homeTab === 'FAVORITES' ? (
                  <>
                    <IconHeart className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">قائمة المفضلة فارغة</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">اضغط على رمز القلب لإضافة مصارفك المفضلة هنا</p>
                  </>
                ) : (
                  <>
                    <IconBank className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">لا توجد مصارف تطابق بحثك</p>
                    {showAvailableOnly && <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">جرب إلغاء تصفية "سيولة متوفرة"</p>}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {view === 'ADD_DATA' && (
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-300">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">إضافة بيانات جديدة</h2>
            <AddDataScreen 
              banks={banks} 
              onAddBank={handleAddBank} 
              onAddBranch={handleAddBranch} 
            />
          </div>
        )}

        {view === 'BANK_DETAILS' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            
            {/* AI Insight Section */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 rounded-xl p-5 border border-primary-200 dark:border-primary-800/50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-primary-800 dark:text-primary-300 font-bold">
                  <IconSparkles className="w-5 h-5" />
                  <span>تحليل الذكاء الاصطناعي</span>
                </div>
                {!aiAnalysis && (
                  <button 
                    onClick={runAnalysis} 
                    disabled={isAnalyzing}
                    className={`text-xs bg-white dark:bg-gray-800 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-70 transition-colors flex items-center gap-2 ${isAnalyzing ? 'pl-2' : ''}`}
                  >
                    {isAnalyzing && <IconLoader className="w-3 h-3 animate-spin" />}
                    {isAnalyzing ? 'جاري التحليل...' : 'تحليل السيولة'}
                  </button>
                )}
              </div>
              
              {aiAnalysis ? (
                 <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed animate-in fade-in">{aiAnalysis}</p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isAnalyzing 
                    ? 'يقوم النظام الآن بتحليل البيانات الفروع لتقديم أفضل نصيحة لك...' 
                    : `اضغط على زر التحليل للحصول على ملخص ذكي لحالة السيولة في فروع ${selectedBank?.name}.`
                  }
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                 <h2 className="text-lg font-bold text-gray-800 dark:text-white">الفروع ({currentBranches.length})</h2>
                 <button 
                   onClick={() => setView('ADD_DATA')}
                   className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                 >
                   + إضافة فرع
                 </button>
              </div>
              
              {currentBranches.length > 0 ? (
                currentBranches.map(branch => (
                  <BranchCard key={branch.id} branch={branch} onReport={setReportBranch} />
                ))
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-400 dark:text-gray-500">لا توجد فروع مسجلة حالياً</p>
                  <button onClick={() => setView('ADD_DATA')} className="mt-2 text-primary-600 dark:text-primary-400 font-bold">أضف أول فرع</button>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'MAP' && (
           <div className="space-y-4 animate-in zoom-in-95 duration-300">
             <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
               <h2 className="font-bold mb-2 text-gray-900 dark:text-white">توزيع الفروع وحالة السيولة</h2>
               <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">خريطة توضيحية للفروع (بيانات تجريبية)</p>
               <BranchMap 
                 branches={branches} 
                 onSelectBranch={(b) => {
                    const bank = banks.find(bk => bk.id === b.bankId);
                    if (bank) {
                      setSelectedBank(bank);
                      setView('BANK_DETAILS');
                    }
                 }} 
                 onReport={setReportBranch}
               />
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-green-500 dark:border-green-600">
                 <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400">أفضل فرع حالياً</h3>
                 <p className="font-bold text-lg mt-1 text-gray-800 dark:text-white">فرع حي الأندلس</p>
                 <span className="text-xs text-green-600 dark:text-green-400">سيولة متوفرة • ازدحام منخفض</span>
               </div>
               <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-red-500 dark:border-red-600">
                 <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400">مناطق تجنبها</h3>
                 <p className="font-bold text-lg mt-1 text-gray-800 dark:text-white">وسط المدينة</p>
                 <span className="text-xs text-red-600 dark:text-red-400">ازدحام شديد في معظم المصارف</span>
               </div>
             </div>
           </div>
        )}

      </main>
      
      {/* Toast Notification */}
      {notification && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      {/* Report Modal */}
      {reportBranch && (
        <ReportModal 
          branch={reportBranch} 
          onClose={() => setReportBranch(null)} 
          onSubmit={submitReport} 
        />
      )}

      {/* Mobile Bottom Navigation */}
      <BottomNav view={view} setView={setView} onResetSelection={() => setSelectedBank(null)} />
    </div>
  );
};

export default App;