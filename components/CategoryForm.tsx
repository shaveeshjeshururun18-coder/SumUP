
import React, { useState } from 'react';
import { CategoryInfo } from '../types';
import Button from './Button';

interface CategoryFormProps {
  initialData?: CategoryInfo;
  onSave: (cat: CategoryInfo) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const ICONS = ['🛒', '🚗', '🍲', '📄', '✨', '☕', '🔌', '🏠', '💊', '🎁', '🏋️', '📚', '🥛', '📶', '📰'];
const COLORS = [
  'bg-emerald-500', 'bg-indigo-500', 'bg-rose-500', 
  'bg-orange-500', 'bg-sky-500', 'bg-fuchsia-500', 
  'bg-slate-500', 'bg-amber-500'
];

const CategoryForm: React.FC<CategoryFormProps> = ({ initialData, onSave, onDelete, onClose }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [vpa, setVpa] = useState(initialData?.vpa || '');
  const [icon, setIcon] = useState(initialData?.icon || ICONS[0]);
  const [color, setColor] = useState(initialData?.color || COLORS[0]);
  const [frequency, setFrequency] = useState<CategoryInfo['autoReminderFrequency']>(initialData?.autoReminderFrequency || 'none');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: initialData?.id || crypto.randomUUID(),
      name: name.trim(),
      vpa: vpa.trim(),
      icon,
      color,
      autoReminderFrequency: frequency,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 animate-slide-up overflow-y-auto max-h-[90vh] scrollbar-hide">
        <h2 className="text-xl font-black text-slate-800 mb-6">
          {initialData?.id ? 'Edit Account' : 'New Account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Account Name</label>
            <input
              type="text"
              placeholder="e.g. Milkman, Gym..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 focus:border-indigo-100 rounded-2xl outline-none font-bold text-slate-800 transition-all"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">UPI ID for Payments (Optional)</label>
            <input
              type="text"
              placeholder="e.g. merchant@okaxis"
              value={vpa}
              onChange={(e) => setVpa(e.target.value)}
              className="w-full px-5 py-4 bg-emerald-50/50 border-2 border-transparent focus:border-emerald-200 rounded-2xl outline-none font-bold text-emerald-800 transition-all placeholder:text-emerald-200"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Vendor Billing Cycle</label>
            <div className="flex bg-slate-50 p-1 rounded-2xl">
              {(['none', 'weekly', 'monthly'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`flex-1 py-2 text-[9px] font-black uppercase rounded-xl transition-all ${
                    frequency === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Appearance</label>
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {ICONS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`min-w-[2.5rem] h-10 flex items-center justify-center text-xl rounded-xl transition-all ${
                    icon === i ? 'bg-indigo-600 shadow-lg scale-110' : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto pt-2 scrollbar-hide">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full flex-shrink-0 transition-all ${c} ${
                    color === c ? 'ring-4 ring-offset-2 ring-slate-300 scale-90' : 'opacity-60'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button type="submit" variant="primary" fullWidth className="rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200">
              Save Account
            </Button>
            <div className="flex gap-3">
              {initialData?.id && onDelete && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 text-rose-500 border-rose-100 hover:bg-rose-50"
                  onClick={() => {
                    if (confirm('Delete this and all its records?')) onDelete(initialData.id);
                  }}
                >
                  Delete
                </Button>
              )}
              <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
