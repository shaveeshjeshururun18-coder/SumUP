
import React, { useState, useMemo } from 'react';
import { Entry, Status, CategoryInfo, HistoryViewPrefs } from '../types';

interface HistoryListProps {
  title?: string;
  entries: Entry[];
  categories: CategoryInfo[];
  prefs: HistoryViewPrefs;
  onUpdateStatus: (ids: string[], status: Status) => void;
  onDelete: (id: string) => void;
  onEdit: (entry: Entry) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onUpdatePrefs: (prefs: HistoryViewPrefs) => void;
  hideStatusFilter?: boolean;
}

type FilterMode = 'month' | 'single' | 'range' | 'all';

const HistoryList: React.FC<HistoryListProps> = ({ 
  entries, 
  categories, 
  onEdit,
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const entryDate = new Date(e.date);
      const entryDateStr = entryDate.toISOString().split('T')[0];

      // Temporal Filters
      if (filterMode === 'single' && entryDateStr !== selectedDate) return false;
      if (filterMode === 'range') {
        if (startDate && entryDateStr < startDate) return false;
        if (endDate && entryDateStr > endDate) return false;
      }
      if (filterMode === 'month') {
        const now = new Date();
        if (entryDate.getMonth() !== now.getMonth() || entryDate.getFullYear() !== now.getFullYear()) return false;
      }

      // Money/Search Filters
      if (minAmount && e.amount < Number(minAmount)) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = e.name?.toLowerCase().includes(query);
        const matchesCategory = categories.find(c => c.id === e.categoryId)?.name.toLowerCase().includes(query);
        const matchesAmount = e.amount.toString().includes(query);
        if (!matchesName && !matchesCategory && !matchesAmount) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, filterMode, selectedDate, startDate, endDate, minAmount, searchQuery, categories]);

  const groupedByDate = useMemo(() => {
    const groups: Record<string, Entry[]> = {};
    filteredEntries.forEach(e => {
      const dateStr = new Date(e.date).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(e);
    });
    return groups;
  }, [filteredEntries]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Filter Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl space-y-5">
        <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl">
          {(['all', 'month', 'single', 'range'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${
                filterMode === mode ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs opacity-40">₹</span>
            <input 
              type="number" 
              placeholder="Min Amount" 
              value={minAmount} 
              onChange={e => setMinAmount(e.target.value)} 
              className="w-full pl-8 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none transition-all focus:ring-2 ring-indigo-500/20"
            />
          </div>
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Search Diary..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none transition-all focus:ring-2 ring-indigo-500/20"
            />
          </div>
        </div>

        {filterMode === 'single' && (
          <input 
            type="date" 
            value={selectedDate} 
            onChange={e => setSelectedDate(e.target.value)} 
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none animate-fade-in"
          />
        )}

        {filterMode === 'range' && (
          <div className="flex items-center gap-3 animate-fade-in">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="flex-1 px-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[9px] font-black outline-none border-none" />
            <span className="text-slate-300">→</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="flex-1 px-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[9px] font-black outline-none border-none" />
          </div>
        )}
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 space-y-10">
        <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800"></div>
        
        {Object.keys(groupedByDate).length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-slate-300 dark:text-slate-700 text-[10px] font-black uppercase tracking-[0.4em]">No matching records</p>
          </div>
        ) : (
          (Object.entries(groupedByDate) as [string, Entry[]][]).map(([date, items]) => (
            <div key={date} className="relative">
              <div className="absolute -left-[1.35rem] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 z-10 shadow-[0_0_10px_rgba(79,70,229,0.4)]"></div>
              <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-6 ml-2">{date}</h4>
              
              <div className="space-y-4">
                {items.map((entry) => {
                  const category = categories.find(c => c.id === entry.categoryId);
                  const isSelected = selectedIds.has(entry.id);
                  const progress = entry.amount > 0 ? (entry.paidAmount / entry.amount) * 100 : 0;
                  
                  return (
                    <div 
                      key={entry.id}
                      className={`bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border transition-all relative overflow-hidden group cursor-pointer ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-900/20 shadow-2xl' : 'border-slate-50 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'}`}
                      onClick={() => toggleSelect(entry.id)}
                    >
                      <div className="flex items-center gap-5 relative z-10">
                        <div className={`w-14 h-14 rounded-2xl ${category?.color || 'bg-slate-200'} text-white flex items-center justify-center text-2xl shadow-inner flex-shrink-0 animate-pop`}>
                          {category?.icon || '❓'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-bold text-slate-800 dark:text-slate-200 text-base truncate tracking-tight">{entry.name || 'Untitled Entry'}</h5>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                                  entry.status === Status.PAID ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                                }`}>
                                  {entry.status}
                                </span>
                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{category?.name}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-slate-900 dark:text-white text-lg tracking-tighter">₹{entry.amount.toLocaleString()}</p>
                              {entry.paidAmount > 0 && entry.status !== Status.PAID && (
                                <p className="text-[9px] font-bold text-emerald-500 leading-none">₹{entry.paidAmount} settled</p>
                              )}
                            </div>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-indigo-500 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
                          className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all hover:scale-110 shadow-lg"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryList;
