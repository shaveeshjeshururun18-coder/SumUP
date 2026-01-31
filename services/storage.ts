
import { Entry, CategoryInfo, HistoryViewPrefs, BankAccount } from '../types';

const ENTRIES_KEY = 'khata_fast_entries_v2';
const CATEGORIES_KEY = 'khata_fast_categories_v2';
const BANK_ACCOUNTS_KEY = 'khata_fast_banks_v2';
const PREF_KEY = 'khata_fast_preferences_v2';
const VIEW_PREFS_KEY = 'khata_fast_view_prefs_v2';

export const saveEntries = (entries: Entry[]) => {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
};

export const loadEntries = (): Entry[] => {
  const data = localStorage.getItem(ENTRIES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveCategories = (categories: CategoryInfo[]) => {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

const DEFAULT_CATEGORIES: CategoryInfo[] = [
  { id: 'general', name: 'General', icon: '💰', color: 'bg-slate-800' },
  { id: '1', name: 'Grocery', icon: '🛒', color: 'bg-emerald-500' },
  { id: '2', name: 'Bills', icon: '📄', color: 'bg-rose-500' },
  { id: '3', name: 'Food', icon: '🍲', color: 'bg-orange-500' },
  { id: '4', name: 'Travel', icon: '🚗', color: 'bg-indigo-500' },
];

export const loadCategories = (): CategoryInfo[] => {
  const data = localStorage.getItem(CATEGORIES_KEY);
  return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
};

export const saveBankAccounts = (accounts: BankAccount[]) => {
  localStorage.setItem(BANK_ACCOUNTS_KEY, JSON.stringify(accounts));
};

export const loadBankAccounts = (): BankAccount[] => {
  const data = localStorage.getItem(BANK_ACCOUNTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveHistoryPrefs = (prefs: HistoryViewPrefs) => {
  localStorage.setItem(VIEW_PREFS_KEY, JSON.stringify(prefs));
};

const DEFAULT_VIEW_PREFS: HistoryViewPrefs = {
  showIcon: true,
  showTime: true,
  showStatus: true,
  showNote: true,
  showCategoryName: true,
};

export const loadHistoryPrefs = (): HistoryViewPrefs => {
  const data = localStorage.getItem(VIEW_PREFS_KEY);
  return data ? JSON.parse(data) : DEFAULT_VIEW_PREFS;
};

export const savePreferences = (prefs: { quickAddMode: boolean }) => {
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
};

export const loadPreferences = () => {
  const data = localStorage.getItem(PREF_KEY);
  return data ? JSON.parse(data) : { quickAddMode: false };
};
