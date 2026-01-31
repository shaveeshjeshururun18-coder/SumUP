
import React, { useState } from 'react';
import { CategoryInfo, Entry, Status } from '../types';
import Button from './Button';

interface CategoryBillProps {
  category: CategoryInfo;
  entries: Entry[];
  onBack: () => void;
  onUpdateStatus: (id: string, status: Status) => void;
  onUpdateEntry: (entry: Partial<Entry>) => void;
  onDeleteEntry: (id: string) => void;
  onEditEntry: (entry: Entry) => void;
}

const CategoryBill: React.FC<CategoryBillProps> = ({ 
  category, 
  entries, 
  onBack, 
  onUpdateStatus, 
  onUpdateEntry,
  onDeleteEntry,
  onEditEntry
}) => {
  const [partialPayId, setPartialPayId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<string>('');

  const total = entries.reduce((sum, e) => sum + e.amount, 0);
  const unpaid = entries.reduce((sum, e) => sum + (e.amount - e.paidAmount), 0);
  const paid = entries.reduce((sum, e) => sum + e.paidAmount, 0);

  const getUPILink = (amount: number, note: string) => {
    if (!category.vpa) return null;
    return `upi://pay?pa=${category.vpa}&pn=${encodeURIComponent(category.name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
  };

  const handlePayViaUPI = (amount: number, note: string) => {
    const link = getUPILink(amount, note);
    if (link) {
      window.location.href = link;
    } else {
      alert("Please set a UPI ID in Account Settings first.");
    }
  };

  const handlePartialPay = (e: React.FormEvent, entry: Entry) => {
    e.preventDefault();
    const pay = Number(payAmount);
    if (!pay || isNaN(pay)) return;

    const newPaidAmount = entry.paidAmount + pay;
    let newStatus = Status.PARTIAL;
    if (newPaidAmount >= entry.amount) newStatus = Status.PAID;

    onUpdateEntry({
      id: entry.id,
      paidAmount: Math.min(newPaidAmount, entry.amount),
      status: newStatus
    });
    
    setPartialPayId(null);
    setPayAmount('');
  };

  return (
    <div className="animate-slide-up pb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white rounded-xl shadow-sm text-slate-500 active:scale-90 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-lg ${category.color} text-white flex items-center justify-center shadow-inner`}>
              {category.icon}
            </span>
            <div className="flex flex-col">
              <h2 className="text-xl font-black text-slate-800 leading-none">{category.name}</h2>
              {category.vpa && <span className="text-[7px] font-black uppercase text-emerald-500 mt-0.5 tracking-tighter">GPay Enabled: {category.vpa}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden border-t-8 border-slate-900">
        <div className="p-8 text-center border-b-2 border-dashed border-slate-100">
          <h3 className="text-2xl font-black uppercase tracking-widest text-slate-900 mb-1">Receipt</h3>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Digital Ledger</p>
        </div>

        <div className="p-4 sm:p-8 space-y-4 max-h-[45vh] overflow-y-auto scrollbar-hide">
          {entries.length === 0 ? (
            <div className="text-center py-10"><p className="text-slate-300 italic text-sm font-bold uppercase">No records found</p></div>
          ) : (
            entries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => {
              const remaining = entry.amount - entry.paidAmount;
              const isPaying = partialPayId === entry.id;

              return (
                <div key={entry.id} className="flex flex-col gap-2 py-4 border-b border-slate-50 last:border-0 group">
                  <div className="flex justify-between items-baseline gap-2">
                    <p className="font-bold text-slate-800 capitalize leading-none truncate">{entry.name || 'Expense'}</p>
                    <p className="font-mono text-lg font-bold text-slate-900">₹{entry.amount}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] px-2 py-0.5 rounded font-black uppercase ${
                        entry.status === Status.PAID ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {entry.status}
                      </span>
                      {entry.status !== Status.PAID && (
                        <p className="text-[9px] font-black text-rose-400 uppercase tracking-tighter">₹{remaining} Due</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {entry.status !== Status.PAID && category.vpa && (
                        <button 
                          onClick={() => handlePayViaUPI(remaining, `Payment for ${entry.name}`)}
                          className="flex items-center gap-1.5 text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.82v-1.91c-1.62-.12-3.15-.65-4.41-1.49l1.41-2.03c1.02.66 2.16 1.05 3.32 1.08.77 0 1.54-.18 2.1-.51.48-.27.77-.69.77-1.2 0-.69-.48-1.14-1.68-1.5l-1.32-.39c-2.01-.6-3.3-1.65-3.3-3.6 0-1.89 1.35-3.39 3.51-3.78V3h2.82v1.92c1.47.12 2.76.54 3.84 1.14l-1.26 2.1c-.81-.48-1.74-.81-2.73-.84-.75 0-1.41.15-1.89.42-.36.21-.57.54-.57.96 0 .66.6 1.05 1.77 1.41l1.32.39c2.19.63 3.39 1.74 3.39 3.72 0 2.25-1.68 3.66-3.99 4.08z"/></svg>
                          GPay
                        </button>
                      )}
                      {entry.status !== Status.PAID && !isPaying && (
                        <button 
                          onClick={() => setPartialPayId(entry.id)}
                          className="text-[9px] font-black uppercase text-indigo-600 hover:underline"
                        >
                          + Manual
                        </button>
                      )}
                    </div>
                  </div>

                  {isPaying && (
                    <form onSubmit={(e) => handlePartialPay(e, entry)} className="mt-2 flex gap-2 animate-slide-up">
                      <input 
                        type="number" 
                        autoFocus
                        placeholder="Amount"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border-2 border-indigo-100 rounded-xl text-xs font-bold outline-none"
                      />
                      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">Save</button>
                    </form>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="bg-slate-50 p-8 space-y-3 border-t-2 border-dashed border-slate-200">
          <div className="flex justify-between text-slate-500 font-bold text-xs uppercase tracking-widest">
            <span>Total Paid</span>
            <span>₹{paid.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-rose-500 font-black text-xs uppercase tracking-widest pt-1 border-t border-slate-100">
            <span>Total Outstanding</span>
            <span className="text-lg">₹{unpaid.toLocaleString()}</span>
          </div>
          
          {unpaid > 0 && category.vpa && (
            <button 
              onClick={() => handlePayViaUPI(unpaid, `Full settlement for ${category.name}`)}
              className="w-full mt-4 bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm uppercase shadow-xl shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Settle via UPI (GPay/Paytm)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryBill;
