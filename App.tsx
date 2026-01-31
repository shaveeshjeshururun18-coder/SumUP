
import React, { useState, useMemo, useEffect } from 'react';
import { Entry, Status, CategoryInfo, SummaryData, HistoryViewPrefs, SyncStatus, User, BankAccount } from './types';
import { loadEntries, saveEntries, loadCategories, saveCategories, loadHistoryPrefs, saveHistoryPrefs, loadBankAccounts, saveBankAccounts } from './services/storage';
import Summary from './components/Summary';
import CategoryGrid from './components/CategoryGrid';
import CategoryBill from './components/CategoryBill';
import CategoryForm from './components/CategoryForm';
import EntryForm from './components/EntryForm';
import HistoryList from './components/HistoryList';
import Button from './components/Button';

const App: React.FC = () => {
  const [currentUser] = useState<User>({ id: 'u1', name: 'Master', email: 'ledger@pro.com' });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('sumup_dark_mode') === 'true' || 
           (!('sumup_dark_mode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [entries, setEntries] = useState<Entry[]>(() => loadEntries());
  const [categories, setCategories] = useState<CategoryInfo[]>(() => loadCategories());
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => loadBankAccounts());
  const [viewPrefs, setViewPrefs] = useState<HistoryViewPrefs>(() => loadHistoryPrefs());
  
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryInfo | null>(null);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'diary' | 'profile'>('home');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [isLinkingBank, setIsLinkingBank] = useState(false);
  
  const now = new Date();
  const [activeMonth, setActiveMonth] = useState(now.getMonth());
  const [activeYear, setActiveYear] = useState(now.getFullYear());

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('sumup_dark_mode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    saveEntries(entries);
    saveCategories(categories);
    saveBankAccounts(bankAccounts);
    saveHistoryPrefs(viewPrefs);
  }, [entries, categories, bankAccounts, viewPrefs]);

  const summary = useMemo((): SummaryData => {
    let todayTotal = 0;
    let monthTotal = 0;
    let unpaidTotal = 0;
    let paidTotal = 0;
    const todayStr = now.toDateString();
    
    entries.forEach(e => {
      const eDate = new Date(e.date);
      if (eDate.toDateString() === todayStr) todayTotal += e.amount;
      if (eDate.getMonth() === activeMonth && eDate.getFullYear() === activeYear) {
        monthTotal += e.amount;
        unpaidTotal += (e.amount - e.paidAmount);
        paidTotal += e.paidAmount;
      }
    });

    const bankBalance = bankAccounts.reduce((sum, b) => sum + b.balance, 0);
    const netPosition = bankBalance - unpaidTotal;

    return { todayTotal, monthTotal, unpaidTotal, paidTotal, bankBalance, netPosition };
  }, [entries, activeMonth, activeYear, bankAccounts]);

  const handleLinkBank = (provider: BankAccount['provider']) => {
    setIsLinkingBank(true);
    setTimeout(() => {
      const newBank: BankAccount = {
        id: crypto.randomUUID(),
        provider,
        name: provider.toUpperCase() + ' Wallet',
        balance: Math.floor(Math.random() * 50000) + 5000,
        color: provider === 'gpay' ? 'bg-indigo-600' : provider === 'phonepe' ? 'bg-purple-600' : 'bg-slate-900',
        type: 'upi'
      };
      setBankAccounts(prev => [...prev, newBank]);
      setIsLinkingBank(false);
    }, 1200);
  };

  const handleAddOrUpdateEntry = (partial: Partial<Entry>) => {
    setSyncStatus('syncing');
    if (editingEntry || partial.id) {
      const idToFind = editingEntry?.id || partial.id;
      setEntries(prev => prev.map(e => e.id === idToFind ? { ...e, ...partial } : e));
      setEditingEntry(null);
    } else {
      const newEntry: Entry = {
        id: crypto.randomUUID(),
        amount: partial.amount || 0,
        paidAmount: partial.paidAmount || 0,
        name: partial.name,
        categoryId: partial.categoryId || categories[0]?.id || 'general',
        note: partial.note,
        date: partial.date || new Date().toISOString(),
        status: partial.status || Status.UNPAID,
        reminderDate: partial.reminderDate,
        attachments: partial.attachments,
      };
      setEntries(prev => [newEntry, ...prev]);
    }
    setTimeout(() => setSyncStatus('synced'), 600);
  };

  const updateEntryStatus = (id: string, status: Status) => {
    setEntries(prev => prev.map(e => {
      if (e.id === id) {
        const newPaid = status === Status.PAID ? e.amount : e.paidAmount;
        return { ...e, status, paidAmount: newPaid };
      }
      return e;
    }));
  };

  const activeCategory = categories.find(c => c.id === selectedCatId);
  const activeEntriesForCat = entries.filter(e => e.categoryId === selectedCatId);

  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-6 pt-10 pb-6 sticky top-0 z-40 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
        <div className="animate-pop cursor-pointer" onClick={() => { setActiveTab('home'); setSelectedCatId(null); }}>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Sum<span className="text-indigo-600">Up</span></h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-2 h-2 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-amber-400 animate-pulse'}`}></span>
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest">Active Ledger</p>
          </div>
        </div>
        
        <div className="flex gap-2 items-center">
          <button 
            onClick={() => handleLinkBank('gpay')}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
          >
            GPAY
          </button>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="w-full max-w-md px-6 pb-32 pt-6">
        {activeTab === 'profile' ? (
          <div className="animate-slide-up-fancy space-y-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl text-center">
              <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">👤</div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{currentUser.name}</h2>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{currentUser.email}</p>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Connected Wallets</p>
              {bankAccounts.length === 0 ? (
                <div className="p-8 text-center bg-white/50 dark:bg-slate-900/30 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400">No linked UPI accounts</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bankAccounts.map(bank => (
                    <div key={bank.id} className="p-5 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl ${bank.color} flex items-center justify-center text-white text-xs font-black`}>{bank.provider.toUpperCase()}</div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{bank.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">₹{bank.balance.toLocaleString()} Balance</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setBankAccounts(prev => prev.filter(b => b.id !== bank.id))}
                        className="p-2 text-rose-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : !selectedCatId ? (
          <div className="animate-slide-up-fancy">
            {activeTab === 'home' ? (
              <div className="space-y-8">
                <Summary data={summary} activeMonth={activeMonth} activeYear={activeYear} onSelectMonth={() => setShowMonthPicker(true)} />
                <div className="space-y-4">
                   <div className="flex justify-between items-end px-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accounts & Dues</p>
                     {summary.unpaidTotal > 0 && (
                       <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-full animate-pulse">₹{summary.unpaidTotal} Due</p>
                     )}
                   </div>
                   <CategoryGrid categories={categories} entries={entries} onSelect={setSelectedCatId} onEdit={setEditingCategory} />
                </div>
              </div>
            ) : (
              <HistoryList entries={entries} categories={categories} prefs={viewPrefs} onUpdateStatus={() => {}} onDelete={() => {}} onEdit={setEditingEntry} onDeleteMultiple={() => {}} onUpdatePrefs={setViewPrefs} />
            )}
          </div>
        ) : activeCategory && (
          <div className="animate-slide-up-fancy">
            <CategoryBill category={activeCategory} entries={activeEntriesForCat} onBack={() => setSelectedCatId(null)} onUpdateStatus={updateEntryStatus} onUpdateEntry={handleAddOrUpdateEntry} onDeleteEntry={() => {}} onEditEntry={setEditingEntry} />
          </div>
        )}
      </main>

      {/* Bottom Header (Navigation Bar) */}
      <footer className="fixed bottom-0 w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-slate-100 dark:border-slate-800 px-8 py-4 z-50 flex justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <button onClick={() => { setActiveTab('home'); setSelectedCatId(null); }} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span className="text-[9px] font-black uppercase tracking-tighter">Home</span>
        </button>
        <button onClick={() => { setActiveTab('diary'); setSelectedCatId(null); }} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'diary' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-[9px] font-black uppercase tracking-tighter">Diary</span>
        </button>
        
        {/* Floating Add Button */}
        <div className="relative -top-8">
          <button 
            onClick={() => setShowEntryForm(true)} 
            className="w-16 h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all border-4 border-white dark:border-slate-950"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </button>
        </div>

        <button onClick={() => handleLinkBank('gpay')} className="flex flex-col items-center gap-1 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <span className="text-[9px] font-black uppercase tracking-tighter">Link</span>
        </button>
        <button onClick={() => { setActiveTab('profile'); setSelectedCatId(null); }} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[9px] font-black uppercase tracking-tighter">Profile</span>
        </button>
      </footer>

      {isLinkingBank && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-2xl animate-fade-in">
           <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] text-center space-y-6 shadow-2xl animate-pop">
              <div className="w-20 h-20 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest tracking-tighter">Connecting Wallet</p>
           </div>
        </div>
      )}

      {(showEntryForm || editingEntry) && (
        <EntryForm categories={categories} defaultCategoryId={selectedCatId || undefined} initialData={editingEntry || undefined} onAdd={handleAddOrUpdateEntry} onClose={() => { setShowEntryForm(false); setEditingEntry(null); }} />
      )}

      {editingCategory && (
        <CategoryForm initialData={editingCategory.id ? editingCategory : undefined} onSave={(cat) => { setCategories(prev => { const exists = prev.find(p => p.id === cat.id); return exists ? prev.map(p => p.id === cat.id ? cat : p) : [...prev, cat]; }); setEditingCategory(null); }} onDelete={(id) => { setCategories(prev => prev.filter(c => c.id !== id)); setEntries(prev => prev.filter(e => e.categoryId !== id)); setEditingCategory(null); if (selectedCatId === id) setSelectedCatId(null); }} onClose={() => setEditingCategory(null)} />
      )}

      {showMonthPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3.5rem] shadow-2xl p-10 animate-pop">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-8 uppercase tracking-widest text-center">Calendar</h2>
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <button key={i} onClick={() => { setActiveMonth(i); setShowMonthPicker(false); }} className={`py-5 rounded-3xl text-[10px] font-black uppercase transition-all ${activeMonth === i ? 'bg-indigo-600 text-white shadow-xl scale-110' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                  {new Date(0, i).toLocaleString('default', { month: 'short' })}
                </button>
              ))}
            </div>
            <button onClick={() => setShowMonthPicker(false)} className="w-full mt-8 py-4 text-[10px] font-black uppercase text-slate-400">Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
