
export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
}

export interface BankAccount {
  id: string;
  provider: 'gpay' | 'phonepe' | 'paytm' | 'bank';
  name: string;
  accountNumber?: string;
  balance: number;
  color: string;
  type: 'upi' | 'savings' | 'credit';
}

export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  vpa?: string; // UPI ID for payments
  autoReminderFrequency?: 'none' | 'weekly' | 'monthly';
}

export enum Status {
  PAID = 'paid',
  UNPAID = 'unpaid',
  PARTIAL = 'partial'
}

export interface Entry {
  id: string;
  amount: number;
  paidAmount: number;
  name?: string;
  categoryId: string;
  note?: string;
  date: string;
  status: Status;
  reminderDate?: string;
  attachments?: string[];
  linkedAccountId?: string; // If paid from a linked bank account
}

export interface SummaryData {
  todayTotal: number;
  monthTotal: number;
  unpaidTotal: number;
  paidTotal: number;
  bankBalance: number;
  netPosition: number;
}

export interface HistoryViewPrefs {
  showIcon: boolean;
  showTime: boolean;
  showStatus: boolean;
  showNote: boolean;
  showCategoryName: boolean;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline';
