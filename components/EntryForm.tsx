
import React, { useState, useEffect, useRef } from 'react';
import { Entry, CategoryInfo, Status } from '../types';
import Button from './Button';

interface EntryFormProps {
  onAdd: (entry: Partial<Entry>) => void;
  onClose: () => void;
  categories: CategoryInfo[];
  defaultCategoryId?: string;
  initialData?: Entry;
}

const EntryForm: React.FC<EntryFormProps> = ({ onAdd, onClose, categories, defaultCategoryId, initialData }) => {
  const [totalAmount, setTotalAmount] = useState<string>(initialData?.amount?.toString() || '');
  const [paidAmount, setPaidAmount] = useState<string>(initialData?.paidAmount?.toString() || '0');
  const [name, setName] = useState(initialData?.name || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || defaultCategoryId || (categories[0]?.id || 'general'));
  const [note, setNote] = useState(initialData?.note || '');
  const [status, setStatus] = useState<Status>(initialData?.status || Status.UNPAID);
  const [reminderDate, setReminderDate] = useState(initialData?.reminderDate?.split('T')[0] || '');
  const [attachments, setAttachments] = useState<string[]>(initialData?.attachments || []);
  
  const amountRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    amountRef.current?.focus();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setAttachments(prev => [...prev, base64]); 
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(totalAmount);
    const paid = Number(paidAmount);
    if (!totalAmount || isNaN(total)) return;

    let finalStatus = status;
    if (paid >= total) finalStatus = Status.PAID;
    else if (paid > 0) finalStatus = Status.PARTIAL;
    else finalStatus = Status.UNPAID;

    onAdd({
      amount: total,
      paidAmount: paid,
      name: name.trim() || undefined,
      categoryId,
      note: note.trim() || undefined,
      status: finalStatus,
      date: initialData?.date || new Date().toISOString(),
      reminderDate: reminderDate ? new Date(reminderDate).toISOString() : undefined,
      attachments,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-8 transform transition-all animate-slide-up overflow-y-auto max-h-[95vh] scrollbar-hide">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{initialData ? 'Update Entry' : 'New Entry'}</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">Total Due (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-rose-500">₹</span>
                <input
                  ref={amountRef}
                  type="number"
                  placeholder="0"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-4 bg-rose-50 dark:bg-rose-950/20 text-xl font-black text-slate-800 dark:text-white rounded-2xl focus:ring-4 focus:ring-rose-100 dark:focus:ring-rose-900/40 outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">Amount Paid (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-emerald-500">₹</span>
                <input
                  type="number"
                  placeholder="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-4 bg-emerald-50 dark:bg-emerald-950/20 text-xl font-black text-slate-800 dark:text-white rounded-2xl focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/40 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">Title / Item</label>
            <input
              type="text"
              placeholder="What is this for?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-bold rounded-2xl outline-none border-2 border-transparent focus:border-indigo-200 dark:focus:border-indigo-800 transition-all placeholder:dark:text-slate-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Ledger Attachments</label>
              <span className="text-[8px] font-bold text-slate-300 dark:text-slate-600 uppercase">{attachments.length} Photos</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {attachments.map((img, i) => (
                <div key={i} className="relative group flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img src={img} className="w-full h-full object-cover" alt="Proof" />
                  <button 
                    type="button"
                    onClick={() => removeAttachment(i)}
                    className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 flex-shrink-0 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-[7px] font-black uppercase mt-1">Add Photo</span>
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" multiple />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 block">Choose Category</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all min-w-[4.5rem] ${
                    categoryId === cat.id 
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 shadow-sm scale-105' 
                      : 'border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 bg-white dark:bg-slate-800'
                  }`}
                >
                  <span className="text-xl mb-1">{cat.icon}</span>
                  <span className="text-[8px] font-black uppercase truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white dark:bg-slate-900 pb-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-2xl dark:border-slate-800 dark:text-slate-400">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-[2] rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white shadow-xl shadow-slate-200 dark:shadow-none">
              Save Record
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntryForm;