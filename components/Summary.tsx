
import React from 'react';
import { SummaryData } from '../types';

interface SummaryProps {
  data: SummaryData;
  activeMonth: number;
  activeYear: number;
  onSelectMonth: () => void;
}

const Summary: React.FC<SummaryProps> = ({ data, activeMonth, activeYear, onSelectMonth }) => {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const totalMonthlyDebt = data.unpaidTotal + data.paidTotal;
  const settlementProgress = totalMonthlyDebt > 0 ? Math.round((data.paidTotal / totalMonthlyDebt) * 100) : 0;

  return (
    <div className="space-y-4 mb-8">
      {/* Primary Balance Display (Bank Balance vs Debt) */}
      <div className="bg-slate-900 dark:bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200 dark:shadow-none relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 group-hover:scale-125 transition-transform duration-700"></div>
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Bank Balance</p>
              <p className="text-4xl font-black tracking-tight text-emerald-400">₹{data.bankBalance.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-500/20 p-3 rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
             <div>
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-0.5">Total Unpaid</p>
                <p className="text-lg font-bold text-rose-400">₹{data.unpaidTotal.toLocaleString()}</p>
             </div>
             <div>
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-0.5">Net Position</p>
                <p className={`text-lg font-bold ${data.netPosition >= 0 ? 'text-indigo-400' : 'text-rose-600'}`}>
                  ₹{data.netPosition.toLocaleString()}
                </p>
             </div>
          </div>
          
          {/* Progress to Settlement */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Settlement Health</p>
              <p className="text-xs font-black text-emerald-400">{settlementProgress}% Debt Cleared</p>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out" 
                style={{ width: `${settlementProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-24 transition-colors">
          <p className="text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-wider">Today Spent</p>
          <p className="text-lg font-black text-slate-900 dark:text-white leading-none">₹{data.todayTotal.toLocaleString()}</p>
        </div>
        <button 
          onClick={onSelectMonth}
          className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-3xl border border-indigo-100 dark:border-indigo-900/40 shadow-sm flex flex-col justify-between h-24 text-left group active:scale-95 transition-all"
        >
          <div className="flex justify-between items-center">
            <p className="text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-wider">{monthNames[activeMonth].slice(0, 3)} Spend</p>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-indigo-400 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <p className="text-lg font-black text-indigo-700 dark:text-indigo-300 leading-none">₹{data.monthTotal.toLocaleString()}</p>
        </button>
        <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-3xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm flex flex-col justify-between h-24 transition-colors">
          <p className="text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-wider">Net Savings</p>
          <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 leading-none">₹{data.paidTotal.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Summary;