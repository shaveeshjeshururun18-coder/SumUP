
import React from 'react';
import { CategoryInfo, Entry, Status } from '../types';

interface CategoryGridProps {
  categories: CategoryInfo[];
  entries: Entry[];
  onSelect: (id: string) => void;
  onEdit: (cat: CategoryInfo) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, entries, onSelect, onEdit }) => {
  const getCategoryStats = (id: string) => {
    const catEntries = entries.filter(e => e.categoryId === id);
    const total = catEntries.reduce((sum, e) => sum + e.amount, 0);
    const unpaid = catEntries.filter(e => e.status !== Status.PAID).reduce((sum, e) => sum + (e.amount - e.paidAmount), 0);
    return { total, unpaid };
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {categories.map(cat => {
        const { total, unpaid } = getCategoryStats(cat.id);
        return (
          <div 
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className="group relative bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all active:scale-95 cursor-pointer flex flex-col h-44 overflow-hidden"
          >
            <div className="flex justify-between items-start mb-auto">
              <div className={`w-12 h-12 rounded-[1.2rem] ${cat.color} text-white flex items-center justify-center text-2xl shadow-inner`}>
                {cat.icon}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(cat); }}
                className="p-2 -mr-2 text-slate-300 dark:text-slate-600 hover:text-indigo-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
            
            <div className="mt-4 relative z-10">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 truncate tracking-tight">{cat.name}</h3>
              <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">₹{total.toLocaleString()}</p>
              {unpaid > 0 ? (
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-tighter flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse"></span>
                  ₹{unpaid.toLocaleString()} Due
                </p>
              ) : (
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Settled</p>
              )}
            </div>

            {/* Background Accent */}
            <div className={`absolute -right-4 -bottom-4 w-20 h-20 ${cat.color} opacity-[0.03] dark:opacity-[0.1] rounded-full blur-2xl group-hover:scale-150 transition-transform`}></div>
          </div>
        );
      })}
      
      {/* Add New Slot */}
      <button 
        onClick={() => onEdit({ id: '', name: '', icon: '➕', color: 'bg-slate-500' })}
        className="bg-slate-100 dark:bg-slate-800/40 border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] h-44 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all active:scale-95 group"
      >
        <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-xl mb-3 text-slate-300 group-hover:scale-110 transition-transform shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">New Account</span>
      </button>
    </div>
  );
};

export default CategoryGrid;
