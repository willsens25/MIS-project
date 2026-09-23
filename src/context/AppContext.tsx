import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  Divisi,
  User,
  Book,
  Promo,
  Identitas,
  Account,
  Category,
  Mutasi,
  PengajuanCetak,
  Penjualan,
  Penyaluran,
  LogisticLog,
  ProductionLog,
  ActivityLog,
  Order,
  DivisionId,
  SalesChannel,
  Expedition,
  ColorPresetId,
  BazaarEvent,
  BazaarAllocationItem,
  UserSettings
} from '../types';
import { DEFAULT_COLOR_PRESET } from '../lib/themePresets';
import {
  INITIAL_DIVISI,
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_ACCOUNTS,
  INITIAL_BOOKS,
  INITIAL_PROMOS,
  INITIAL_IDENTITAS,
  INITIAL_ORDERS,
  INITIAL_MUTASI,
  INITIAL_PENGAJUAN,
  INITIAL_PENJUALAN,
  INITIAL_PENYALURAN,
  INITIAL_LOGISTIC_LOGS,
  INITIAL_PRODUCTION_LOGS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_SALES_CHANNELS,
  INITIAL_EXPEDITIONS,
  INITIAL_BAZAAR_EVENTS,
  DEMO_USERS,
  DEMO_ACCOUNTS,
  DEMO_BOOKS,
  DEMO_PROMOS,
  DEMO_IDENTITAS,
  DEMO_ORDERS,
  DEMO_MUTASI,
  DEMO_PENGAJUAN,
  DEMO_PENJUALAN,
  DEMO_PENYALURAN,
  DEMO_LOGISTIC_LOGS,
  DEMO_PRODUCTION_LOGS,
  DEMO_ACTIVITY_LOGS,
  DEMO_BAZAAR_EVENTS
} from '../lib/initialData';
import {
  hashPasswordServer,
  verifyPasswordServer,
  isBcryptHash,
  bulkUpgradePasswordsServer
} from '../services/authService';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchDivision: (divisiId: DivisionId, targetSubTab?: string) => void;
  currentSubTab: string;
  setCurrentSubTab: (subTab: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  colorPreset: ColorPresetId;
  setColorPreset: (preset: ColorPresetId) => void;
  userSettings: UserSettings;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  toggleMascotSpeechBubble: () => void;
  
  // Auth state & methods
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string; user?: User }>;
  register: (data: { name: string; email: string; password: string; divisi_id: DivisionId; role?: string; phone?: string; createIdentitas?: boolean }) => Promise<{ success: boolean; message: string; user?: User }>;
  logout: () => void;
  quickLoginAs: (userId: number) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  openLoginModal: () => void;
  openRegisterModal: () => void;

  // Master lists
  divisiList: Divisi[];
  usersList: User[];
  categories: Category[];
  accounts: Account[];
  books: Book[];
  promos: Promo[];
  salesChannels: SalesChannel[];
  expeditions: Expedition[];
  identitasList: Identitas[];
  orders: Order[];
  mutasis: Mutasi[];
  pengajuans: PengajuanCetak[];
  penjualans: Penjualan[];
  penyalurans: Penyaluran[];
  logisticLogs: LogisticLog[];
  productionLogs: ProductionLog[];
  activityLogs: ActivityLog[];
  bazaarEvents: BazaarEvent[];

  // AI & App Task Reactive State
  aiAppState: 'idle' | 'thinking' | 'success';
  setAiAppState: React.Dispatch<React.SetStateAction<'idle' | 'thinking' | 'success'>>;
  triggerTaskSuccess: (customMessage?: string) => void;
  lastCompletedTaskMessage: string;

  // Helper & Mutation Actions
  recordActivity: (aksi: string, model: string, keterangan: string, customDivisiId?: DivisionId, customUserName?: string) => void;
  
  // Book actions
  addBook: (judul: string, penulis: string, harga_jual: number, stok?: number, biaya_pokok?: number, kategori?: string, isbn?: string) => Book;
  updateBook: (id: number, judul: string, penulis: string, harga_jual: number, biaya_pokok?: number, kategori?: string, isbn?: string) => void;
  updateBookCost: (id: number, biaya_pokok: number) => void;
  adjustBookStock: (id: number, qty: number, mode: 'add' | 'set', catatan?: string) => { success: boolean; message: string; newStock?: number };
  deleteBook: (id: number) => void;
  bulkDeleteBooks: (ids: number[]) => void;
  ajukanCetak: (bookId: number, jumlah: number) => void;

  // Order & Marketing actions
  createOrder: (orderData: Omit<Order, 'id' | 'created_at'>, targetAccountId?: number) => { success: boolean; message: string; invoice?: string; orderId?: number; order?: Order };
  tandaiLunasOrder: (orderId: number, targetAccountId?: number) => { success: boolean; message: string };
  cancelOrder: (orderId: number) => void;
  bulkDeleteOrders: (ids: number[]) => void;
  checkPromoCode: (code: string, bookId?: number, orderDate?: string, identitasId?: number, subtotal?: number) => { valid: boolean; type?: 'percentage' | 'nominal'; value?: number; message?: string; promo?: Promo };
  lookupEligiblePromos: (params: { orderDate?: string; bookId?: number; identitasId?: number; subtotal?: number }) => Promo[];
  addPromo: (promo: Omit<Promo, 'id' | 'used_count' | 'created_at'>) => void;
  updatePromo: (id: number, promo: Partial<Promo>) => void;
  deletePromo: (id: number) => void;
  bulkDeletePromos: (ids: number[]) => void;
  addSalesChannel: (channel: Omit<SalesChannel, 'id'>) => { success: boolean; message: string; channel?: SalesChannel };
  updateSalesChannel: (id: number, channel: Partial<SalesChannel>) => void;
  deleteSalesChannel: (id: number) => void;
  addExpedition: (expedition: Omit<Expedition, 'id'>) => { success: boolean; message: string; expedition?: Expedition };
  updateExpedition: (id: number, expedition: Partial<Expedition>) => void;
  deleteExpedition: (id: number) => void;

  // Bazaar & Consignment Event actions
  addBazaarEvent: (event: Omit<BazaarEvent, 'id' | 'created_at' | 'total_buku_dibawa' | 'total_buku_terjual' | 'total_buku_kembali' | 'total_omzet' | 'stok_gudang_dipotong'>) => BazaarEvent;
  updateBazaarEvent: (id: number, updates: Partial<BazaarEvent>) => void;
  deleteBazaarEvent: (id: number) => { success: boolean; message: string };
  allocateBazaarBooks: (eventId: number, items: BazaarAllocationItem[]) => { success: boolean; message: string };
  reconcileBazaarEvent: (eventId: number, items: BazaarAllocationItem[], notes?: string) => { success: boolean; message: string };

  // Finance actions
  addMutasi: (account_id: number, nama_kategori: string, tipe: 'Masuk' | 'Keluar', nominal: number, keterangan: string, tanggal?: string) => void;
  updateMutasi: (id: number, nama_kategori: string, tipe: 'Masuk' | 'Keluar', nominal: number, keterangan: string) => void;
  deleteMutasi: (id: number) => void;
  bulkDeleteMutasi: (ids: number[]) => void;
  addAccount: (nama_akun: string) => void;
  updateAccount: (id: number, nama_akun: string) => void;
  deleteAccount: (id: number) => { success: boolean; message: string };
  approvePengajuanCetak: (pengajuanId: number, accountId: number) => void;
  rejectPengajuanCetak: (pengajuanId: number, catatan: string) => void;
  bulkDeletePengajuanCetak: (ids: number[]) => void;

  // Production actions
  addProductionOutput: (bookId: number, jumlah: number) => void;
  bulkDeleteProductionLogs: (ids: number[]) => void;

  // Logistics actions
  dispatchShipment: (no_invoice: string, noResi?: string) => { success: boolean; message: string };
  addManualLogisticLog: (bookId: number, jumlah: number, tujuan: string, keterangan?: string) => { success: boolean; message: string };
  bulkDeleteLogisticLogs: (ids: number[]) => void;
  bulkDeletePenyalurans: (ids: number[]) => void;

  // Identitas / Anggota actions
  addIdentitas: (identitas: Omit<Identitas, 'id' | 'created_at'>) => Identitas;
  updateIdentitas: (id: number, identitas: Partial<Identitas>) => void;
  deleteIdentitas: (id: number) => void;
  bulkDeleteIdentitas: (ids: number[]) => void;

  // User management
  addUser: (name: string, email: string, divisi_id: DivisionId, role?: string, password?: string, phone?: string) => Promise<void> | void;
  updateUser: (id: number, name: string, email: string, divisi_id: DivisionId, role?: string, password?: string, phone?: string) => Promise<void> | void;
  updateUserProfile: (data: { name: string; avatar?: string; phone?: string }) => void;
  deleteUser: (id: number) => void;
  bulkDeleteUsers: (ids: number[]) => void;

  // Reset and demo state operations
  resetToDefault: () => void;
  clearAllData: () => void;
  loadDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Clean-slate check for published release: ensures previous mock seed data in browser's localStorage is wiped cleanly
const CLEAN_STORAGE_VERSION = 'v4_clean_start_register_first';
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const currentVer = localStorage.getItem('mis_data_version');
    if (currentVer !== CLEAN_STORAGE_VERSION) {
      localStorage.removeItem('mis_books');
      localStorage.removeItem('mis_orders');
      localStorage.removeItem('mis_mutasis');
      localStorage.removeItem('mis_promos');
      localStorage.removeItem('mis_identitas');
      localStorage.removeItem('mis_pengajuans');
      localStorage.removeItem('mis_penjualans');
      localStorage.removeItem('mis_penyalurans');
      localStorage.removeItem('mis_logistic_logs');
      localStorage.removeItem('mis_production_logs');
      localStorage.removeItem('mis_activity_logs');
      localStorage.removeItem('mis_wa_logs');
      localStorage.removeItem('mis_accounts');
      localStorage.removeItem('mis_users');
      localStorage.removeItem('mis_current_user');
      localStorage.removeItem('mis_is_auth');
      localStorage.setItem('mis_data_version', CLEAN_STORAGE_VERSION);
    }
  }
} catch (e) {
  console.warn('Storage migration check error:', e);
}

function getStoredItem<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStoredItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Storage quota exceeded or error:', e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('mis_theme');
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      console.warn('Error reading theme from storage:', e);
    }
    return 'light';
  });

  const [colorPreset, setColorPresetState] = useState<ColorPresetId>(() => {
    try {
      const stored = localStorage.getItem('mis_color_preset');
      if (stored && ['corporate-blue', 'deep-forest', 'royal-indigo', 'crimson-dharma', 'ocean-teal', 'sunset-amber'].includes(stored)) {
        return stored as ColorPresetId;
      }
    } catch (e) {
      console.warn('Error reading color preset from storage:', e);
    }
    return DEFAULT_COLOR_PRESET;
  });

  const DEFAULT_USER_SETTINGS: UserSettings = {
    mascotSpeechBubbleEnabled: true,
    mascotSoundEffectsEnabled: true,
    mascotParticleBurstEnabled: true,
    mascotShortcutHintsEnabled: true,
  };

  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem('mis_user_settings');
      if (stored) {
        return { ...DEFAULT_USER_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Error reading user settings from storage:', e);
    }
    return DEFAULT_USER_SETTINGS;
  });

  const updateUserSettings = (newSettings: Partial<UserSettings>) => {
    setUserSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('mis_user_settings', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving user settings to storage:', e);
      }
      return updated;
    });
  };

  const toggleMascotSpeechBubble = () => {
    updateUserSettings({ mascotSpeechBubbleEnabled: !userSettings.mascotSpeechBubbleEnabled });
  };

  const [divisiList] = useState<Divisi[]>(INITIAL_DIVISI);
  const [usersList, setUsersList] = useState<User[]>(() => getStoredItem('mis_users', INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = getStoredItem<User | null>('mis_current_user', null);
    return saved || INITIAL_USERS[0];
  });

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const stored = localStorage.getItem('mis_is_auth');
    return stored === 'true';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');

  const openLoginModal = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  const [categories, setCategories] = useState<Category[]>(() => getStoredItem('mis_categories', INITIAL_CATEGORIES));
  const [accounts, setAccounts] = useState<Account[]>(() => getStoredItem('mis_accounts', INITIAL_ACCOUNTS));
  const [books, setBooks] = useState<Book[]>(() => getStoredItem('mis_books', INITIAL_BOOKS));
  const [promos, setPromos] = useState<Promo[]>(() => getStoredItem('mis_promos', INITIAL_PROMOS));
  const [salesChannels, setSalesChannels] = useState<SalesChannel[]>(() => getStoredItem('mis_sales_channels', INITIAL_SALES_CHANNELS));
  const [expeditions, setExpeditions] = useState<Expedition[]>(() => getStoredItem('mis_expeditions', INITIAL_EXPEDITIONS));
  const [identitasList, setIdentitasList] = useState<Identitas[]>(() => getStoredItem('mis_identitas', INITIAL_IDENTITAS));
  const [orders, setOrders] = useState<Order[]>(() => getStoredItem('mis_orders', INITIAL_ORDERS));
  const [mutasis, setMutasis] = useState<Mutasi[]>(() => getStoredItem('mis_mutasis', INITIAL_MUTASI));
  const [pengajuans, setPengajuans] = useState<PengajuanCetak[]>(() => getStoredItem('mis_pengajuans', INITIAL_PENGAJUAN));
  const [penjualans, setPenjualans] = useState<Penjualan[]>(() => getStoredItem('mis_penjualans', INITIAL_PENJUALAN));
  const [penyalurans, setPenyalurans] = useState<Penyaluran[]>(() => getStoredItem('mis_penyalurans', INITIAL_PENYALURAN));
  const [logisticLogs, setLogisticLogs] = useState<LogisticLog[]>(() => getStoredItem('mis_logistic_logs', INITIAL_LOGISTIC_LOGS));
  const [productionLogs, setProductionLogs] = useState<ProductionLog[]>(() => getStoredItem('mis_production_logs', INITIAL_PRODUCTION_LOGS));
  const [bazaarEvents, setBazaarEvents] = useState<BazaarEvent[]>(() => {
    const stored = getStoredItem<BazaarEvent[]>('mis_bazaar_events', INITIAL_BAZAAR_EVENTS);
    if (!stored || stored.length === 0) {
      return INITIAL_BAZAAR_EVENTS;
    }
    return stored;
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const stored = getStoredItem<ActivityLog[]>('mis_activity_logs', INITIAL_ACTIVITY_LOGS);
    if (!stored || stored.length === 0) {
      return INITIAL_ACTIVITY_LOGS;
    }
    // Ensure all stored logs have divisi_id populated
    const fixedStored = stored.map(log => {
      if (!log.divisi_id && log.divisi_name) {
        const matchedDiv = INITIAL_DIVISI.find(d => d.nama_divisi.toLowerCase() === log.divisi_name?.toLowerCase());
        if (matchedDiv) return { ...log, divisi_id: matchedDiv.id };
      }
      return log;
    });
    // If stored items are fewer than our default rich set (e.g. from previous run), merge non-duplicated initial logs
    const existingIds = new Set(fixedStored.map(l => l.id));
    const missingInitials = INITIAL_ACTIVITY_LOGS.filter(l => !existingIds.has(l.id));
    return [...fixedStored, ...missingInitials];
  });

  // Sync to localStorage
  useEffect(() => { setStoredItem('mis_users', usersList); }, [usersList]);
  useEffect(() => { setStoredItem('mis_current_user', currentUser); }, [currentUser]);

  // Transparently upgrade any legacy plain-text passwords to bcrypt hashes in background
  useEffect(() => {
    const autoUpgradeLegacyPasswords = async () => {
      const hasUnhashed = usersList.some(u => u.password && !isBcryptHash(u.password));
      if (!hasUnhashed) return;
      try {
        const upgraded = await bulkUpgradePasswordsServer(usersList);
        if (upgraded && upgraded.length > 0) {
          setUsersList(prev => prev.map(u => {
            const match = upgraded.find(m => m.id === u.id);
            return (match && match.hash) ? { ...u, password: match.hash } : u;
          }));
        }
      } catch (err) {
        console.warn('Auto upgrade passwords to bcrypt failed:', err);
      }
    };
    autoUpgradeLegacyPasswords();
  }, []);
  useEffect(() => { setStoredItem('mis_categories', categories); }, [categories]);
  useEffect(() => { setStoredItem('mis_accounts', accounts); }, [accounts]);
  useEffect(() => { setStoredItem('mis_books', books); }, [books]);
  useEffect(() => { setStoredItem('mis_promos', promos); }, [promos]);
  useEffect(() => { setStoredItem('mis_sales_channels', salesChannels); }, [salesChannels]);
  useEffect(() => { setStoredItem('mis_expeditions', expeditions); }, [expeditions]);
  useEffect(() => { setStoredItem('mis_identitas', identitasList); }, [identitasList]);
  useEffect(() => { setStoredItem('mis_orders', orders); }, [orders]);
  useEffect(() => { setStoredItem('mis_mutasis', mutasis); }, [mutasis]);
  useEffect(() => { setStoredItem('mis_pengajuans', pengajuans); }, [pengajuans]);
  useEffect(() => { setStoredItem('mis_penjualans', penjualans); }, [penjualans]);
  useEffect(() => { setStoredItem('mis_penyalurans', penyalurans); }, [penyalurans]);
  useEffect(() => { setStoredItem('mis_logistic_logs', logisticLogs); }, [logisticLogs]);
  useEffect(() => { setStoredItem('mis_production_logs', productionLogs); }, [productionLogs]);
  useEffect(() => { setStoredItem('mis_activity_logs', activityLogs); }, [activityLogs]);
  useEffect(() => { setStoredItem('mis_bazaar_events', bazaarEvents); }, [bazaarEvents]);

  // Synchronize theme to DOM and localStorage
  useEffect(() => {
    try {
      const root = document.documentElement;
      root.setAttribute('data-theme', theme);
      root.style.colorScheme = theme;
      if (theme === 'dark') {
        root.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        document.body.classList.remove('dark');
      }
      localStorage.setItem('mis_theme', theme);
    } catch (e) {
      console.warn('Error saving theme to localStorage:', e);
    }
  }, [theme]);

  // Synchronize color preset to DOM and localStorage
  useEffect(() => {
    try {
      const root = document.documentElement;
      root.setAttribute('data-color-preset', colorPreset);
      localStorage.setItem('mis_color_preset', colorPreset);
    } catch (e) {
      console.warn('Error saving color preset to localStorage:', e);
    }
  }, [colorPreset]);

  // Listen to external theme and color preset changes across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mis_theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
        setTheme(e.newValue);
      }
      if (e.key === 'mis_color_preset' && e.newValue) {
        if (['corporate-blue', 'deep-forest', 'royal-indigo', 'crimson-dharma', 'ocean-teal', 'sunset-amber'].includes(e.newValue)) {
          setColorPresetState(e.newValue as ColorPresetId);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSetColorPreset = (preset: ColorPresetId) => {
    try {
      localStorage.setItem('mis_color_preset', preset);
      document.documentElement.setAttribute('data-color-preset', preset);
    } catch (e) {
      console.warn('Error persisting color preset:', e);
    }
    setColorPresetState(preset);
  };

  const handleSetTheme = (newTheme: 'light' | 'dark') => {
    try {
      localStorage.setItem('mis_theme', newTheme);
      const root = document.documentElement;
      root.setAttribute('data-theme', newTheme);
      root.style.colorScheme = newTheme;
      if (newTheme === 'dark') {
        root.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    } catch (e) {
      console.warn('Error persisting theme:', e);
    }
    setTheme(newTheme);
  };

  const toggleTheme = () => {
    setTheme(prev => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('mis_theme', nextTheme);
        const root = document.documentElement;
        root.setAttribute('data-theme', nextTheme);
        root.style.colorScheme = nextTheme;
        if (nextTheme === 'dark') {
          root.classList.add('dark');
          document.body.classList.add('dark');
        } else {
          root.classList.remove('dark');
          document.body.classList.remove('dark');
        }
      } catch (e) {
        console.warn('Error persisting theme toggle:', e);
      }
      return nextTheme;
    });
  };

  const DEFAULT_SUBTABS: Record<number, string> = {
    1: 'overview',
    2: 'grafik',
    3: 'katalog',
    4: 'pos',
    5: 'overview',
    6: 'antrean'
  };

  const [divisionSubTabs, setDivisionSubTabs] = useState<Record<number, string>>(() => {
    return getStoredItem<Record<number, string>>('mis_subtabs', DEFAULT_SUBTABS);
  });

  useEffect(() => {
    try {
      localStorage.setItem('mis_subtabs', JSON.stringify(divisionSubTabs));
    } catch (e) {
      console.error('Failed to store subtabs', e);
    }
  }, [divisionSubTabs]);

  const currentSubTab = divisionSubTabs[currentUser.divisi_id] || DEFAULT_SUBTABS[currentUser.divisi_id] || 'overview';

  const setCurrentSubTab = (subTab: string) => {
    setDivisionSubTabs(prev => ({
      ...prev,
      [currentUser.divisi_id]: subTab
    }));
  };

  const switchDivision = (divisiId: DivisionId, targetSubTab?: string) => {
    const userForDivisi = usersList.find(u => u.divisi_id === divisiId) || {
      id: 99,
      name: `User ${divisiList.find(d => d.id === divisiId)?.nama_divisi || 'Divisi'}`,
      email: `user.${divisiId}@lamrimnesia.org`,
      divisi_id: divisiId,
      role: 'Staff'
    };
    setCurrentUser(userForDivisi);
    if (targetSubTab) {
      setDivisionSubTabs(prev => ({
        ...prev,
        [divisiId]: targetSubTab
      }));
    }
    recordActivity('Ganti Divisi', 'User', `Beralih ke divisi: ${divisiList.find(d => d.id === divisiId)?.nama_divisi}`);
  };

  // AI & App Task Reactive State
  const [aiAppState, setAiAppState] = useState<'idle' | 'thinking' | 'success'>('idle');
  const [lastCompletedTaskMessage, setLastCompletedTaskMessage] = useState<string>('');
  const successTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerTaskSuccess = useCallback((customMessage?: string) => {
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
    }
    setLastCompletedTaskMessage(customMessage || 'Tugas selesai!');
    setAiAppState('success');
    successTimerRef.current = setTimeout(() => {
      setAiAppState('idle');
      setLastCompletedTaskMessage('');
    }, 2800);
  }, []);

  const recordActivity = (aksi: string, model: string, keterangan: string, customDivisiId?: DivisionId, customUserName?: string) => {
    const targetDivisiId = customDivisiId || currentUser.divisi_id;
    const currentDivisi = divisiList.find(d => d.id === targetDivisiId);
    const currentDivisiName = currentDivisi?.nama_divisi || 'Umum';
    const newLog: ActivityLog = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      user_id: currentUser.id,
      user_name: customUserName || currentUser.name,
      divisi_id: targetDivisiId,
      divisi_name: currentDivisiName,
      aksi,
      model,
      keterangan,
      ip_address: '127.0.0.1 (Local AI Studio)',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setActivityLogs(prev => [newLog, ...prev]);

    // Reactive mascot feedback on completed operational tasks
    if (aksi !== 'Ganti Divisi' && aksi !== 'Auto-Logout Sesi' && aksi !== 'Muat Data Sampel') {
      triggerTaskSuccess(`${aksi} Berhasil!`);
    }
  };

  // Book CRUD
  const addBook = (
    judul: string,
    penulis: string,
    harga_jual: number,
    stok: number = 0,
    biaya_pokok?: number,
    kategori?: string,
    isbn?: string
  ): Book => {
    const calculatedHpp = biaya_pokok !== undefined && biaya_pokok >= 0
      ? biaya_pokok
      : Math.round(harga_jual * 0.4);
    const newBook: Book = {
      id: Date.now(),
      judul,
      penulis,
      harga_jual,
      biaya_pokok: calculatedHpp,
      stok_gudang: stok,
      kategori: kategori || 'Umum',
      isbn: isbn || '',
      created_at: new Date().toISOString()
    };
    setBooks(prev => [newBook, ...prev]);
    recordActivity(
      'Tambah Buku',
      'Book',
      `Mendaftarkan buku baru: "${judul}" karya ${penulis} (Harga: Rp ${harga_jual.toLocaleString('id-ID')}, HPP: Rp ${calculatedHpp.toLocaleString('id-ID')})`
    );
    return newBook;
  };

  const updateBook = (
    id: number,
    judul: string,
    penulis: string,
    harga_jual: number,
    biaya_pokok?: number,
    kategori?: string,
    isbn?: string
  ) => {
    setBooks(prev =>
      prev.map(b => {
        if (b.id !== id) return b;
        const newHpp = biaya_pokok !== undefined ? biaya_pokok : (b.biaya_pokok || Math.round(harga_jual * 0.4));
        return {
          ...b,
          judul,
          penulis,
          harga_jual,
          biaya_pokok: newHpp,
          kategori: kategori !== undefined ? kategori : b.kategori,
          isbn: isbn !== undefined ? isbn : b.isbn,
          updated_at: new Date().toISOString()
        };
      })
    );
    recordActivity('Update Informasi Buku', 'Book', `Mengubah informasi buku ID #${id}: "${judul}" (${penulis}) - Harga: Rp ${harga_jual.toLocaleString('id-ID')}`);
  };

  const updateBookCost = (id: number, biaya_pokok: number) => {
    const book = books.find(b => b.id === id);
    setBooks(prev =>
      prev.map(b => (b.id === id ? { ...b, biaya_pokok, updated_at: new Date().toISOString() } : b))
    );
    recordActivity(
      'Update HPP Buku',
      'Book',
      `Memperbarui HPP / Biaya Cetak Satuan buku "${book?.judul || id}" menjadi Rp ${biaya_pokok.toLocaleString('id-ID')}`
    );
  };

  const adjustBookStock = (id: number, qty: number, mode: 'add' | 'set', catatan?: string) => {
    const book = books.find(b => b.id === id);
    if (!book) return { success: false, message: 'Buku tidak ditemukan.' };

    const newStock = mode === 'add' ? Math.max(0, book.stok_gudang + qty) : Math.max(0, qty);
    const selisih = newStock - book.stok_gudang;

    setBooks(prev =>
      prev.map(b => (b.id === id ? { ...b, stok_gudang: newStock, updated_at: new Date().toISOString() } : b))
    );

    const aksiDesc = mode === 'add'
      ? `Penambahan stok buku "${book.judul}" sebanyak +${qty} eksemplar (Stok kini: ${newStock} eks). ${catatan ? `[${catatan}]` : ''}`
      : `Penyesuaian stok opname buku "${book.judul}" menjadi ${newStock} eksemplar (Perubahan: ${selisih >= 0 ? `+${selisih}` : selisih} eks). ${catatan ? `[${catatan}]` : ''}`;

    recordActivity(mode === 'add' ? 'Tambah Stok Buku' : 'Stock Opname', 'Book', aksiDesc);

    return {
      success: true,
      message: `Stok buku "${book.judul}" berhasil diperbarui menjadi ${newStock} eksemplar.`,
      newStock
    };
  };

  const deleteBook = (id: number) => {
    const target = books.find(b => b.id === id);
    setBooks(prev => prev.filter(b => b.id !== id));
    setPengajuans(prev => prev.filter(p => p.buku_id !== id));
    recordActivity('Hapus Buku', 'Book', `Menghapus buku "${target?.judul || id}" dari katalog penerbitan.`);
  };

  const bulkDeleteBooks = (ids: number[]) => {
    const deletedNames = books.filter(b => ids.includes(b.id)).map(b => b.judul).join(', ');
    setBooks(prev => prev.filter(b => !ids.includes(b.id)));
    setPengajuans(prev => prev.filter(p => !ids.includes(p.buku_id)));
    recordActivity('Hapus Massal Buku', 'Book', `Menghapus ${ids.length} buku massal: [${deletedNames}]`);
  };

  const ajukanCetak = (bookId: number, jumlah: number) => {
    const book = books.find(b => b.id === bookId);
    const newPengajuan: PengajuanCetak = {
      id: Date.now(),
      buku_id: bookId,
      buku: book,
      jumlah_pengajuan: jumlah,
      status: 'pending',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setPengajuans(prev => [newPengajuan, ...prev]);
    recordActivity('Ajukan Cetak Buku', 'PengajuanCetak', `Mengajukan cetak ulang buku "${book?.judul}" sebanyak ${jumlah} Eks. Menunggu persetujuan Finance.`);
  };

  // Promo Check with date range, target book, buyer category & minimum order validation
  const checkPromoCode = (
    code: string,
    bookId?: number,
    orderDate?: string,
    identitasId?: number,
    subtotal?: number
  ) => {
    const cleanCode = code.trim().toUpperCase();
    const promo = promos.find(p => p.code.toUpperCase() === cleanCode);
    if (!promo) {
      return { valid: false, message: 'Kode promo tidak ditemukan.' };
    }
    const checkDate = orderDate ? new Date(orderDate) : new Date();
    if (promo.start_date && new Date(promo.start_date) > checkDate) {
      return { valid: false, message: `Promo belum aktif (Mulai berlaku: ${promo.start_date}).`, promo };
    }
    if (promo.expiry_date && new Date(promo.expiry_date) < checkDate) {
      return { valid: false, message: `Kode promo telah kedaluwarsa (${promo.expiry_date}).`, promo };
    }
    if (promo.used_count >= promo.max_uses) {
      return { valid: false, message: `Kuota pemakaian kode promo telah habis (${promo.max_uses}/${promo.max_uses}).`, promo };
    }
    if (promo.buku_id_khusus && bookId && promo.buku_id_khusus !== bookId) {
      const b = books.find(item => item.id === promo.buku_id_khusus);
      return { valid: false, message: `Kode promo hanya berlaku untuk buku "${b?.judul || promo.buku_id_khusus}".`, promo };
    }
    if (promo.khusus_identitas_id && identitasId && promo.khusus_identitas_id !== identitasId) {
      return { valid: false, message: 'Promo khusus untuk pembeli / anggota tertentu.', promo };
    }
    if (promo.khusus_kategori_pembeli && promo.khusus_kategori_pembeli !== 'Semua') {
      const buyer = identitasId ? identitasList.find(i => i.id === identitasId) : null;
      if (!buyer || buyer.jenis_umat !== promo.khusus_kategori_pembeli) {
        return { valid: false, message: `Promo khusus untuk kategori ${promo.khusus_kategori_pembeli}.`, promo };
      }
    }
    if (promo.min_order && subtotal !== undefined && subtotal < promo.min_order) {
      return { valid: false, message: `Minimal belanja Rp ${promo.min_order.toLocaleString('id-ID')} (Subtotal saat ini: Rp ${subtotal.toLocaleString('id-ID')}).`, promo };
    }
    return { valid: true, type: promo.type, value: promo.reward_value, promo };
  };

  const lookupEligiblePromos = (params: { orderDate?: string; bookId?: number; identitasId?: number; subtotal?: number }) => {
    return promos.filter(p => {
      const res = checkPromoCode(p.code, params.bookId, params.orderDate, params.identitasId, params.subtotal);
      return res.valid;
    });
  };

  const addPromo = (promoData: Omit<Promo, 'id' | 'used_count' | 'created_at'>) => {
    const newPromo: Promo = {
      ...promoData,
      id: Date.now(),
      code: promoData.code.trim().toUpperCase(),
      used_count: 0,
      created_at: new Date().toISOString()
    };
    setPromos(prev => [newPromo, ...prev]);
    recordActivity('Tambah Promo', 'Promo', `Membuat kode promo baru: ${newPromo.code} (${newPromo.type === 'percentage' ? `${newPromo.reward_value}%` : `Rp ${newPromo.reward_value.toLocaleString('id-ID')}`})`);
  };

  const updatePromo = (id: number, promoData: Partial<Promo>) => {
    setPromos(prev => prev.map(p => p.id === id ? { ...p, ...promoData } : p));
    recordActivity('Update Promo', 'Promo', `Memperbarui data kode promo ID #${id}`);
  };

  const deletePromo = (id: number) => {
    const promo = promos.find(p => p.id === id);
    setPromos(prev => prev.filter(p => p.id !== id));
    recordActivity('Hapus Promo', 'Promo', `Menghapus kode promo: ${promo?.code}`);
  };

  const bulkDeletePromos = (ids: number[]) => {
    if (ids.length === 0) return;
    const codes = promos.filter(p => ids.includes(p.id)).map(p => p.code).join(', ');
    setPromos(prev => prev.filter(p => !ids.includes(p.id)));
    recordActivity('Hapus Massal Promo', 'Promo', `Menghapus ${ids.length} kode promo: [${codes}]`);
  };

  // Sales Channels Management
  const addSalesChannel = (channelData: Omit<SalesChannel, 'id'>) => {
    const exists = salesChannels.some(c => c.nama_channel.toLowerCase() === channelData.nama_channel.trim().toLowerCase());
    if (exists) {
      return { success: false, message: `Saluran "${channelData.nama_channel}" sudah ada di database.` };
    }
    const newChannel: SalesChannel = {
      ...channelData,
      id: Date.now(),
      nama_channel: channelData.nama_channel.trim()
    };
    setSalesChannels(prev => [...prev, newChannel]);
    recordActivity('Tambah Saluran Penjualan', 'SalesChannel', `Menambahkan saluran penjualan: ${newChannel.nama_channel} (${newChannel.kategori || 'Marketplace'})`);
    return { success: true, message: `Saluran penjualan "${newChannel.nama_channel}" berhasil ditambahkan!`, channel: newChannel };
  };

  const updateSalesChannel = (id: number, channelData: Partial<SalesChannel>) => {
    setSalesChannels(prev => prev.map(c => c.id === id ? { ...c, ...channelData } : c));
    recordActivity('Update Saluran Penjualan', 'SalesChannel', `Memperbarui saluran penjualan ID #${id}`);
  };

  const deleteSalesChannel = (id: number) => {
    const channel = salesChannels.find(c => c.id === id);
    setSalesChannels(prev => prev.filter(c => c.id !== id));
    recordActivity('Hapus Saluran Penjualan', 'SalesChannel', `Menghapus saluran penjualan: ${channel?.nama_channel}`);
  };

  // Expeditions Management
  const addExpedition = (expData: Omit<Expedition, 'id'>) => {
    const exists = expeditions.some(e => e.nama_ekspedisi.toLowerCase() === expData.nama_ekspedisi.trim().toLowerCase());
    if (exists) {
      return { success: false, message: `Jenis ekspedisi "${expData.nama_ekspedisi}" sudah ada di database.` };
    }
    const newExp: Expedition = {
      ...expData,
      id: Date.now(),
      nama_ekspedisi: expData.nama_ekspedisi.trim()
    };
    setExpeditions(prev => [...prev, newExp]);
    recordActivity('Tambah Ekspedisi', 'Expedition', `Menambahkan jenis ekspedisi: ${newExp.nama_ekspedisi} (${newExp.estimasi || '-'})`);
    return { success: true, message: `Ekspedisi "${newExp.nama_ekspedisi}" berhasil ditambahkan!`, expedition: newExp };
  };

  const updateExpedition = (id: number, expData: Partial<Expedition>) => {
    setExpeditions(prev => prev.map(e => e.id === id ? { ...e, ...expData } : e));
    recordActivity('Update Ekspedisi', 'Expedition', `Memperbarui opsi ekspedisi ID #${id}`);
  };

  const deleteExpedition = (id: number) => {
    const exp = expeditions.find(e => e.id === id);
    setExpeditions(prev => prev.filter(e => e.id !== id));
    recordActivity('Hapus Ekspedisi', 'Expedition', `Menghapus ekspedisi: ${exp?.nama_ekspedisi}`);
  };

  // Bazaar & Consignment Event Operations
  const addBazaarEvent = (eventData: Omit<BazaarEvent, 'id' | 'created_at' | 'total_buku_dibawa' | 'total_buku_terjual' | 'total_buku_kembali' | 'total_omzet' | 'stok_gudang_dipotong'>): BazaarEvent => {
    const totalDibawa = (eventData.items || []).reduce((sum, item) => sum + (item.qty_dibawa || 0), 0);
    const totalTerjual = (eventData.items || []).reduce((sum, item) => sum + (item.qty_terjual || 0), 0);
    const totalKembali = (eventData.items || []).reduce((sum, item) => sum + (item.qty_kembali || 0), 0);
    const newEvent: BazaarEvent = {
      ...eventData,
      id: Date.now(),
      total_buku_dibawa: totalDibawa,
      total_buku_terjual: totalTerjual,
      total_buku_kembali: totalKembali,
      total_omzet: 0,
      stok_gudang_dipotong: false,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setBazaarEvents(prev => [newEvent, ...prev]);
    recordActivity('Tambah Agenda Bazaar', 'BazaarEvent', `Mendaftarkan agenda bazaar "${newEvent.nama_event}" di ${newEvent.lokasi} (${newEvent.tanggal_mulai} s/d ${newEvent.tanggal_selesai}).`, 4);
    triggerTaskSuccess(`Agenda Bazaar "${newEvent.nama_event}" berhasil didaftarkan!`);
    return newEvent;
  };

  const updateBazaarEvent = (id: number, updates: Partial<BazaarEvent>) => {
    setBazaarEvents(prev => prev.map(ev => {
      if (ev.id === id) {
        const updated = { ...ev, ...updates };
        if (updates.items) {
          updated.total_buku_dibawa = updates.items.reduce((s, i) => s + (i.qty_dibawa || 0), 0);
          updated.total_buku_terjual = updates.items.reduce((s, i) => s + (i.qty_terjual || 0), 0);
          updated.total_buku_kembali = updates.items.reduce((s, i) => s + (i.qty_kembali || 0), 0);
          updated.total_omzet = updates.items.reduce((s, i) => s + ((i.qty_terjual || 0) * (i.harga_satuan || 0)), 0);
        }
        return updated;
      }
      return ev;
    }));
  };

  const deleteBazaarEvent = (id: number): { success: boolean; message: string } => {
    const target = bazaarEvents.find(e => e.id === id);
    if (!target) return { success: false, message: 'Acara bazaar tidak ditemukan' };
    
    // Jika buku telah dialokasikan dan belum selesai rekonsiliasi, kembalikan stok tersisa ke gudang
    if (target.stok_gudang_dipotong && target.status !== 'Selesai Rekonsiliasi') {
      target.items.forEach(item => {
        const remainingToReturn = (item.qty_dibawa || 0) - (item.qty_terjual || 0);
        if (remainingToReturn > 0) {
          setBooks(prev => prev.map(b => b.id === item.buku_id ? { ...b, stok_gudang: b.stok_gudang + remainingToReturn } : b));
        }
      });
    }

    setBazaarEvents(prev => prev.filter(e => e.id !== id));
    recordActivity('Hapus Agenda Bazaar', 'BazaarEvent', `Menghapus agenda bazaar "${target.nama_event}".`, 4);
    triggerTaskSuccess(`Agenda Bazaar "${target.nama_event}" telah dihapus.`);
    return { success: true, message: 'Agenda bazaar berhasil dihapus' };
  };

  const allocateBazaarBooks = (eventId: number, items: BazaarAllocationItem[]): { success: boolean; message: string } => {
    const target = bazaarEvents.find(e => e.id === eventId);
    if (!target) return { success: false, message: 'Acara bazaar tidak ditemukan' };

    // Validasi ketersediaan stok buku di gudang
    for (const item of items) {
      const b = books.find(book => book.id === item.buku_id);
      if (b && b.stok_gudang < item.qty_dibawa) {
        return {
          success: false,
          message: `Stok gudang tidak mencukupi untuk "${b.judul}". Tersedia: ${b.stok_gudang}, diminta: ${item.qty_dibawa}.`
        };
      }
    }

    // Potong stok riil di gudang dan catat ke Logistic Logs
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    items.forEach(item => {
      setBooks(prev => prev.map(b => b.id === item.buku_id ? { ...b, stok_gudang: Math.max(0, b.stok_gudang - item.qty_dibawa) } : b));
      
      const b = books.find(book => book.id === item.buku_id);
      const newLogisticLog: LogisticLog = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        buku_id: item.buku_id,
        qty_keluar: item.qty_dibawa,
        tujuan: `Alokasi Stan: ${target.nama_event}`,
        keterangan: `Pengeluaran stok konsinyasi bazaar (${item.qty_dibawa} eks - ${b?.judul || 'Buku'})`,
        created_at: timestamp
      };
      setLogisticLogs(prev => [newLogisticLog, ...prev]);
    });

    const totalDibawa = items.reduce((s, i) => s + (i.qty_dibawa || 0), 0);
    setBazaarEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          items,
          status: 'Sedang Berlangsung',
          stok_gudang_dipotong: true,
          total_buku_dibawa: totalDibawa,
          total_buku_kembali: totalDibawa
        };
      }
      return e;
    }));

    recordActivity('Alokasi Buku Bazaar', 'BazaarEvent', `Mengeluarkan ${totalDibawa} eksemplar buku dari gudang untuk stan "${target.nama_event}".`, 4);
    triggerTaskSuccess(`Berhasil mengalokasikan ${totalDibawa} buku ke ${target.nama_event}! Stok gudang telah diperbarui.`);
    return { success: true, message: 'Buku berhasil dialokasikan dari gudang' };
  };

  const reconcileBazaarEvent = (eventId: number, items: BazaarAllocationItem[], notes?: string): { success: boolean; message: string } => {
    const target = bazaarEvents.find(e => e.id === eventId);
    if (!target) return { success: false, message: 'Acara bazaar tidak ditemukan' };

    let totalTerjual = 0;
    let totalKembali = 0;
    let totalOmzet = 0;

    // Kembalikan sisa buku yang kembali ke stok fisik gudang
    items.forEach(item => {
      const b = books.find(book => book.id === item.buku_id);
      const unitPrice = item.harga_satuan || b?.harga_jual || 0;
      totalTerjual += (item.qty_terjual || 0);
      totalKembali += (item.qty_kembali || 0);
      totalOmzet += (item.qty_terjual || 0) * unitPrice;

      if (item.qty_kembali > 0) {
        setBooks(prev => prev.map(book => book.id === item.buku_id ? { ...book, stok_gudang: book.stok_gudang + item.qty_kembali } : book));
      }
    });

    setBazaarEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          items,
          status: 'Selesai Rekonsiliasi',
          total_buku_terjual: totalTerjual,
          total_buku_kembali: totalKembali,
          total_omzet: totalOmzet,
          catatan: notes ? (e.catatan ? `${e.catatan} | Rekonsiliasi: ${notes}` : notes) : e.catatan
        };
      }
      return e;
    }));

    recordActivity('Rekonsiliasi Bazaar Selesai', 'BazaarEvent', `Rekonsiliasi "${target.nama_event}": ${totalTerjual} buku terjual (Omzet: Rp ${totalOmzet.toLocaleString('id-ID')}), ${totalKembali} buku kembali ke gudang.`, 4);
    triggerTaskSuccess(`Rekonsiliasi "${target.nama_event}" tuntas! ${totalKembali} buku telah dikembalikan ke stok gudang.`);
    return { success: true, message: 'Rekonsiliasi acara bazaar berhasil diselesaikan' };
  };

  // Order & POS
  const createOrder = (orderData: Omit<Order, 'id' | 'created_at'>, targetAccountId?: number) => {
    // 1. Check stocks
    for (const item of orderData.items) {
      const book = books.find(b => b.id === item.buku_id);
      if (!book) {
        return { success: false, message: `Buku dengan ID ${item.buku_id} tidak ditemukan.` };
      }
      if (book.stok_gudang < item.jumlah) {
        return { success: false, message: `Stok buku "${book.judul}" tidak mencukupi. Sisa stok: ${book.stok_gudang} pcs.` };
      }
    }

    // 2. Decrement stock
    setBooks(prev => prev.map(b => {
      const matched = orderData.items.find(it => it.buku_id === b.id);
      return matched ? { ...b, stok_gudang: Math.max(0, b.stok_gudang - matched.jumlah) } : b;
    }));

    // 3. Increment promo usages if any
    orderData.items.forEach(it => {
      if (it.kode_promo_terpakai) {
        setPromos(prev => prev.map(p => p.code === it.kode_promo_terpakai?.toUpperCase() ? { ...p, used_count: p.used_count + 1 } : p));
      }
    });

    const newOrder: Order = {
      ...orderData,
      id: Date.now(),
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    setOrders(prev => [newOrder, ...prev]);

    // If order is created directly with status 'Lunas' (e.g. Kasir Event POS instant checkout)
    if (newOrder.status === 'Lunas') {
      // 1. Mutasi Kas Masuk di Finance
      const selectedAcc = targetAccountId ? accounts.find(a => a.id === targetAccountId) : undefined;
      const kasAccount = selectedAcc || accounts.find(a => a.nama_akun.toLowerCase().includes('kas')) || accounts.find(a => a.nama_akun.toLowerCase().includes('qris')) || accounts[0] || {
        id: 1,
        nama_akun: 'Kas Operasional (Tunai)',
        kode_akun: 'ACC-CASH-01',
        saldo_awal: 0
      };
      const categoryPenjualan = categories.find(c => c.nama_kategori.toLowerCase().includes('penjualan')) || categories[0] || {
        id: 1,
        nama_kategori: 'Penjualan Buku / POS',
        jenis: 'Masuk'
      };

      const newMutasi: Mutasi = {
        id: Date.now() + 100,
        account_id: kasAccount.id,
        account: kasAccount,
        category_id: categoryPenjualan.id,
        category: categoryPenjualan,
        user_id: currentUser?.id || 1,
        tipe: 'Masuk',
        nominal: newOrder.total_tagihan,
        keterangan: `POS Event: Pembayaran #${newOrder.no_invoice} (${newOrder.nama_pembeli} - ${newOrder.via})${newOrder.donasi ? ` [Termasuk Donasi Rp ${newOrder.donasi.toLocaleString('id-ID')}]` : ''}`,
        tanggal: new Date().toISOString().substring(0, 10),
        jenis: 'INVOICE'
      };
      setMutasis(prev => [newMutasi, ...prev]);

      // 2. Rekap Penjualan
      const totalItems = newOrder.items.reduce((sum, it) => sum + it.jumlah, 0);
      const newPenjualan: Penjualan = {
        id: Date.now() + 200,
        no_invoice: newOrder.no_invoice,
        nama_pelanggan: newOrder.nama_pembeli,
        total_item: totalItems,
        total_bayar: newOrder.total_tagihan,
        tanggal_penjualan: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      setPenjualans(prev => [newPenjualan, ...prev]);
    }

    recordActivity('Tambah Pesanan', 'Order', `Membuat pesanan baru ${newOrder.no_invoice} untuk ${newOrder.nama_pembeli} via ${newOrder.via} (Total: Rp ${newOrder.total_tagihan.toLocaleString('id-ID')})`);
    return { success: true, message: `Invoice #${newOrder.no_invoice} berhasil disimpan dan stok gudang terpotong!`, invoice: newOrder.no_invoice, orderId: newOrder.id, order: newOrder };
  };

  const tandaiLunasOrder = (orderId: number, targetAccountId?: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Invoice tidak ditemukan.' };
    if (order.status === 'Lunas') return { success: false, message: 'Invoice sudah berstatus Lunas.' };

    // 1. Update Order status
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Lunas', tercatat_finance: 1 } : o));

    // 2. Push items to Penyaluran (Logistik packing queue)
    const newPenyalurans: Penyaluran[] = order.items.map((it, idx) => ({
      id: Date.now() + idx + Math.floor(Math.random() * 1000),
      no_invoice: order.no_invoice,
      buku_id: it.buku_id,
      book: books.find(b => b.id === it.buku_id),
      qty: it.jumlah,
      nama_agen: order.nama_penerima || order.nama_pembeli,
      status: 'proses packing',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }));
    setPenyalurans(prev => [...newPenyalurans, ...prev]);

    // 3. Mutasi Kas Masuk di Finance
    const selectedAcc = targetAccountId ? accounts.find(a => a.id === targetAccountId) : undefined;
    const kasAccount = selectedAcc || accounts.find(a => a.nama_akun.toLowerCase().includes('bca')) || accounts.find(a => a.nama_akun.toLowerCase().includes('kas')) || accounts[0] || {
      id: 1,
      nama_akun: 'Bank BCA - Yayasan Lamrimnesia',
      kode_akun: 'ACC-BCA-789',
      saldo_awal: 0
    };
    const categoryPenjualan = categories.find(c => c.nama_kategori.toLowerCase().includes('penjualan')) || categories[0] || {
      id: 1,
      nama_kategori: 'Penjualan Buku',
      jenis: 'Masuk'
    };

    const newMutasi: Mutasi = {
      id: Date.now() + 100,
      account_id: kasAccount.id,
      account: kasAccount,
      category_id: categoryPenjualan.id,
      category: categoryPenjualan,
      user_id: currentUser?.id || 1,
      tipe: 'Masuk',
      nominal: order.total_tagihan,
      keterangan: `Otomatis: Pelunasan #${order.no_invoice} (${order.nama_pembeli})${order.donasi ? ` [Termasuk Donasi Rp ${order.donasi.toLocaleString('id-ID')}${order.keterangan_donasi ? ` - ${order.keterangan_donasi}` : ''}]` : ''}`,
      tanggal: new Date().toISOString().substring(0, 10),
      jenis: 'INVOICE'
    };
    setMutasis(prev => [newMutasi, ...prev]);

    // 4. Rekap Penjualan
    const totalItems = order.items.reduce((sum, it) => sum + it.jumlah, 0);
    const newPenjualan: Penjualan = {
      id: Date.now() + 200,
      no_invoice: order.no_invoice,
      nama_pelanggan: order.nama_pembeli,
      total_item: totalItems,
      total_bayar: order.total_tagihan,
      tanggal_penjualan: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setPenjualans(prev => [newPenjualan, ...prev]);

    recordActivity('Konfirmasi Lunas', 'Order', `Mengubah status invoice ${order.no_invoice} menjadi LUNAS. Sinkron otomatis ke Finance & antrean Logistik.`);
    return { success: true, message: `Invoice #${order.no_invoice} berhasil ditandai LUNAS!` };
  };

  const cancelOrder = (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.status === 'Cancelled') return;

    // 1. Restore book stocks
    setBooks(prev => prev.map(b => {
      const match = order.items.find(it => it.buku_id === b.id);
      return match ? { ...b, stok_gudang: b.stok_gudang + match.jumlah } : b;
    }));

    // 2. Delete linked Mutasi & Penjualan if previously paid
    if (order.tercatat_finance || order.status === 'Lunas') {
      setMutasis(prev => prev.filter(m => !m.keterangan.includes(order.no_invoice)));
      setPenjualans(prev => prev.filter(p => p.no_invoice !== order.no_invoice));
      setPenyalurans(prev => prev.filter(p => p.no_invoice !== order.no_invoice));
    }

    // 3. Mark status as Cancelled
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled', tercatat_finance: 0 } : o));
    recordActivity('Batalkan Invoice', 'Order', `Membatalkan (Cancel) Invoice ${order.no_invoice}. Stok buku otomatis dikembalikan ke gudang.`);
  };

  const bulkDeleteOrders = (ids: number[]) => {
    if (ids.length === 0) return;
    const targetOrders = orders.filter(o => ids.includes(o.id));
    const invoiceNos = targetOrders.map(o => o.no_invoice);
    
    // Clean up related mutasi & packing items
    setMutasis(prev => prev.filter(m => !invoiceNos.some(inv => m.keterangan.includes(inv))));
    setPenjualans(prev => prev.filter(p => !invoiceNos.includes(p.no_invoice)));
    setPenyalurans(prev => prev.filter(p => !invoiceNos.includes(p.no_invoice)));
    
    setOrders(prev => prev.filter(o => !ids.includes(o.id)));
    recordActivity('Hapus Massal Invoice', 'Order', `Menghapus ${ids.length} invoice/pesanan massal: [${invoiceNos.join(', ')}]`);
  };

  // Finance Mutasi & Accounts
  const addMutasi = (account_id: number, nama_kategori: string, tipe: 'Masuk' | 'Keluar', nominal: number, keterangan: string, tanggal?: string) => {
    let cat = categories.find(c => c.nama_kategori.toLowerCase() === nama_kategori.trim().toLowerCase());
    if (!cat) {
      cat = { id: Date.now() + Math.floor(Math.random() * 100), nama_kategori: nama_kategori.trim(), jenis: tipe };
      setCategories(prev => [...prev, cat!]);
    }
    const acc = accounts.find(a => a.id === account_id);
    const newMutasi: Mutasi = {
      id: Date.now(),
      account_id,
      account: acc,
      category_id: cat.id,
      category: cat,
      user_id: currentUser.id,
      tipe,
      nominal,
      keterangan,
      tanggal: tanggal || new Date().toISOString().substring(0, 10),
      jenis: 'MANUAL'
    };
    setMutasis(prev => [newMutasi, ...prev]);
    recordActivity('Tambah Transaksi', 'Mutasi', `Membuat transaksi ${tipe}: "${keterangan}" (Rp ${nominal.toLocaleString('id-ID')}) pada akun ${acc?.nama_akun}`);
  };

  const updateMutasi = (id: number, nama_kategori: string, tipe: 'Masuk' | 'Keluar', nominal: number, keterangan: string) => {
    let cat = categories.find(c => c.nama_kategori.toLowerCase() === nama_kategori.trim().toLowerCase());
    if (!cat) {
      cat = { id: Date.now() + Math.floor(Math.random() * 100), nama_kategori: nama_kategori.trim(), jenis: tipe };
      setCategories(prev => [...prev, cat!]);
    }
    setMutasis(prev => prev.map(m => m.id === id ? { ...m, category_id: cat!.id, category: cat, tipe, nominal, keterangan } : m));
    recordActivity('Update Transaksi', 'Mutasi', `Mengubah data mutasi ID #${id}: "${keterangan}" (Rp ${nominal.toLocaleString('id-ID')})`);
  };

  const deleteMutasi = (id: number) => {
    const mut = mutasis.find(m => m.id === id);
    setMutasis(prev => prev.filter(m => m.id !== id));
    recordActivity('Hapus Transaksi', 'Mutasi', `Menghapus transaksi ${mut?.tipe}: ${mut?.keterangan} sebesar Rp ${(mut?.nominal || 0).toLocaleString('id-ID')}`);
  };

  const bulkDeleteMutasi = (ids: number[]) => {
    if (ids.length === 0) return;
    setMutasis(prev => prev.filter(m => !ids.includes(m.id)));
    recordActivity('Hapus Massal Mutasi', 'Mutasi', `Menghapus ${ids.length} transaksi mutasi kas & bank secara massal.`);
  };

  const addAccount = (nama_akun: string) => {
    const newAcc: Account = {
      id: Date.now(),
      nama_akun,
      kode_akun: `ACC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      saldo_awal: 0
    };
    setAccounts(prev => [...prev, newAcc]);
    recordActivity('Tambah Akun', 'Account', `Menambahkan akun keuangan: ${nama_akun} (${newAcc.kode_akun})`);
  };

  const updateAccount = (id: number, nama_akun: string) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, nama_akun } : a));
    recordActivity('Update Akun', 'Account', `Mengubah nama akun ID #${id} menjadi "${nama_akun}"`);
  };

  const deleteAccount = (id: number) => {
    const isUsed = mutasis.some(m => m.account_id === id);
    if (isUsed) {
      return { success: false, message: 'Gagal! Akun ini sudah memiliki riwayat mutasi transaksi keuangan.' };
    }
    const acc = accounts.find(a => a.id === id);
    setAccounts(prev => prev.filter(a => a.id !== id));
    recordActivity('Hapus Akun', 'Account', `Menghapus akun keuangan: ${acc?.nama_akun}`);
    return { success: true, message: 'Akun kas/bank berhasil dihapus!' };
  };

  const approvePengajuanCetak = (pengajuanId: number, accountId: number) => {
    const pengajuan = pengajuans.find(p => p.id === pengajuanId);
    if (!pengajuan) return;
    const book = books.find(b => b.id === pengajuan.buku_id);
    if (!book) return;

    const biayaCetak = pengajuan.jumlah_pengajuan * 20000;
    const acc = accounts.find(a => a.id === accountId) || accounts[0];

    // 1. Mutasi Kas Keluar
    const newMutasi: Mutasi = {
      id: Date.now(),
      account_id: acc.id,
      account: acc,
      category_id: 6, // Biaya Cetak Buku
      category: categories.find(c => c.id === 6),
      user_id: currentUser.id,
      tipe: 'Keluar',
      nominal: biayaCetak,
      keterangan: `Biaya Cetak Ulang: ${book.judul} (${pengajuan.jumlah_pengajuan} Eks)`,
      tanggal: new Date().toISOString().substring(0, 10),
      jenis: 'MANUAL'
    };
    setMutasis(prev => [newMutasi, ...prev]);

    // 2. Increment Book Warehouse Stock
    setBooks(prev => prev.map(b => b.id === book.id ? { ...b, stok_gudang: b.stok_gudang + pengajuan.jumlah_pengajuan } : b));

    // 3. Mark pengajuan approved
    setPengajuans(prev => prev.map(p => p.id === pengajuanId ? { ...p, status: 'approved' } : p));

    // 4. Log production
    setProductionLogs(prev => [{
      id: Date.now(),
      buku_id: book.id,
      book,
      qty_produksi: pengajuan.jumlah_pengajuan,
      tanggal_produksi: new Date().toISOString().substring(0, 10)
    }, ...prev]);

    recordActivity('Setujui Cetak Buku', 'PengajuanCetak', `Menyetujui cetak ulang "${book.judul}" (${pengajuan.jumlah_pengajuan} Eks). Biaya Rp ${biayaCetak.toLocaleString('id-ID')} dicairkan dari ${acc.nama_akun} & stok bertambah!`);
  };

  const rejectPengajuanCetak = (pengajuanId: number, catatan: string) => {
    const pengajuan = pengajuans.find(p => p.id === pengajuanId);
    const book = books.find(b => b.id === pengajuan?.buku_id);
    setPengajuans(prev => prev.map(p => p.id === pengajuanId ? { ...p, status: 'rejected', catatan_bendahara: catatan } : p));
    recordActivity('Tolak Cetak Buku', 'PengajuanCetak', `Menolak pengajuan cetak buku "${book?.judul}" dengan catatan: "${catatan}"`);
  };

  const bulkDeletePengajuanCetak = (ids: number[]) => {
    if (ids.length === 0) return;
    setPengajuans(prev => prev.filter(p => !ids.includes(p.id)));
    recordActivity('Hapus Massal Pengajuan', 'PengajuanCetak', `Menghapus ${ids.length} pengajuan cetak buku secara massal.`);
  };

  // Production Output
  const addProductionOutput = (bookId: number, jumlah: number) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, stok_gudang: b.stok_gudang + jumlah } : b));
    setProductionLogs(prev => [{
      id: Date.now(),
      buku_id: bookId,
      book,
      qty_produksi: jumlah,
      tanggal_produksi: new Date().toISOString().substring(0, 10)
    }, ...prev]);

    recordActivity('Tambah Hasil Produksi', 'ProductionLog', `Mencatat penyelesaian produksi buku "${book.judul}" sebanyak ${jumlah} Eks ke gudang.`);
  };

  const bulkDeleteProductionLogs = (ids: number[]) => {
    if (ids.length === 0) return;
    setProductionLogs(prev => prev.filter(p => !ids.includes(p.id)));
    recordActivity('Hapus Massal Log Produksi', 'ProductionLog', `Menghapus ${ids.length} riwayat hasil cetak produksi massal.`);
  };

  // Logistics Dispatch
  const dispatchShipment = (no_invoice: string, noResi?: string) => {
    const invClean = (no_invoice || '').trim().toUpperCase();
    let items = penyalurans.filter(
      p => (p.no_invoice || '').trim().toUpperCase() === invClean &&
           (p.status?.toLowerCase() === 'proses packing' || !p.status)
    );

    const linkedOrder = orders.find(
      o => (o.no_invoice || '').trim().toUpperCase() === invClean
    );

    // If no existing packing items found in state but linkedOrder exists, generate them
    if (items.length === 0 && linkedOrder && linkedOrder.items && linkedOrder.items.length > 0) {
      items = linkedOrder.items.map((it, idx) => ({
        id: Date.now() + idx + Math.floor(Math.random() * 1000),
        no_invoice: linkedOrder.no_invoice,
        buku_id: it.buku_id,
        book: books.find(b => b.id === it.buku_id),
        qty: it.jumlah,
        nama_agen: linkedOrder.nama_penerima || linkedOrder.nama_pembeli,
        status: 'dikirim',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }));
      setPenyalurans(prev => [...items, ...prev]);
    } else if (items.length === 0) {
      return { success: false, message: `Tidak ada item antrean yang perlu dikirim untuk invoice #${no_invoice}.` };
    }

    // Mark items as 'dikirim'
    setPenyalurans(prev =>
      prev.map(p =>
        (p.no_invoice || '').trim().toUpperCase() === invClean
          ? { ...p, status: 'dikirim' }
          : p
      )
    );

    // Update order status to 'Dikirim'
    setOrders(prev =>
      prev.map(o => {
        if ((o.no_invoice || '').trim().toUpperCase() === invClean) {
          const resiTag = noResi?.trim() ? ` [Resi: ${noResi.trim()}]` : '';
          return {
            ...o,
            status: 'Dikirim',
            keterangan: o.keterangan ? `${o.keterangan}${resiTag}` : (noResi?.trim() ? `Resi: ${noResi.trim()}` : o.keterangan)
          };
        }
        return o;
      })
    );

    // Create LogisticLogs for warehouse history
    const recipientName = items[0]?.nama_agen || linkedOrder?.nama_penerima || linkedOrder?.nama_pembeli || 'Pelanggan / Agen';
    const newLogs: LogisticLog[] = items.map((it, idx) => {
      const bookObj = it.book || books.find(b => b.id === it.buku_id);
      return {
        id: Date.now() + idx + Math.floor(Math.random() * 1000),
        buku_id: it.buku_id,
        book: bookObj,
        qty_keluar: it.qty,
        tujuan: recipientName,
        keterangan: noResi?.trim()
          ? `Pengiriman Invoice #${no_invoice} (Resi: ${noResi.trim()})`
          : `Pengiriman Invoice #${no_invoice}`,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
    });

    setLogisticLogs(prev => [...newLogs, ...prev]);
    recordActivity(
      'Kirim Pesanan Logistik',
      'LogisticLog',
      `Memproses pengiriman pesanan #${no_invoice} (${items.length} jenis buku) ke ${recipientName}${noResi ? ` (Resi: ${noResi})` : ''}.`
    );

    return { success: true, message: `Seluruh barang untuk Invoice #${no_invoice} berhasil dikirim!` };
  };

  const addManualLogisticLog = (bookId: number, jumlah: number, tujuan: string, keterangan?: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return { success: false, message: 'Buku tidak ditemukan.' };
    if (book.stok_gudang < jumlah) {
      return { success: false, message: `Stok gudang tidak mencukupi! Sisa stok buku "${book.judul}" adalah ${book.stok_gudang} pcs.` };
    }

    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, stok_gudang: b.stok_gudang - jumlah } : b));
    const newLog: LogisticLog = {
      id: Date.now(),
      buku_id: bookId,
      book,
      qty_keluar: jumlah,
      tujuan,
      keterangan: keterangan || 'Pengeluaran Manual Gudang',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setLogisticLogs(prev => [newLog, ...prev]);
    recordActivity('Pengeluaran Manual Gudang', 'LogisticLog', `Mengeluarkan stok buku "${book.judul}" sebanyak ${jumlah} pcs untuk tujuan: ${tujuan}`);
    return { success: true, message: 'Pengeluaran manual gudang berhasil dicatat!' };
  };

  const bulkDeleteLogisticLogs = (ids: number[]) => {
    if (ids.length === 0) return;
    setLogisticLogs(prev => prev.filter(l => !ids.includes(l.id)));
    recordActivity('Hapus Massal Log Logistik', 'LogisticLog', `Menghapus ${ids.length} riwayat pengeluaran gudang logistik.`);
  };

  const bulkDeletePenyalurans = (ids: number[]) => {
    if (ids.length === 0) return;
    setPenyalurans(prev => prev.filter(p => !ids.includes(p.id)));
    recordActivity('Hapus Massal Antrean Packing', 'Penyaluran', `Menghapus ${ids.length} antrean paket penyaluran gudang.`);
  };

  // Identitas / Anggota
  const addIdentitas = (data: Omit<Identitas, 'id' | 'created_at'>): Identitas => {
    const newIdentitas: Identitas = {
      ...data,
      id: Date.now(),
      nama_lengkap: data.nama_lengkap.toUpperCase(),
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setIdentitasList(prev => [newIdentitas, ...prev]);
    recordActivity('Tambah Identitas', 'Identitas', `Mendaftarkan anggota/umat baru: "${newIdentitas.nama_lengkap}" (${newIdentitas.jenis_identitas}: ${newIdentitas.nomor_identitas})`);
    return newIdentitas;
  };

  const updateIdentitas = (id: number, data: Partial<Identitas>) => {
    setIdentitasList(prev => prev.map(i => i.id === id ? { ...i, ...data, nama_lengkap: data.nama_lengkap ? data.nama_lengkap.toUpperCase() : i.nama_lengkap } : i));
    recordActivity('Update Identitas', 'Identitas', `Memperbarui profil anggota ID #${id}: "${data.nama_lengkap || id}"`);
  };

  const deleteIdentitas = (id: number) => {
    const target = identitasList.find(i => i.id === id);
    setIdentitasList(prev => prev.filter(i => i.id !== id));
    recordActivity('Hapus Identitas', 'Identitas', `Menghapus anggota "${target?.nama_lengkap || id}" dari sistem database.`);
  };

  const bulkDeleteIdentitas = (ids: number[]) => {
    const names = identitasList.filter(i => ids.includes(i.id)).map(i => i.nama_lengkap).join(', ');
    setIdentitasList(prev => prev.filter(i => !ids.includes(i.id)));
    recordActivity('Hapus Massal Identitas', 'Identitas', `Menghapus ${ids.length} anggota secara massal: [${names}]`);
  };

  // Authentication Handlers
  const login = async (email: string, password?: string): Promise<{ success: boolean; message: string; user?: User }> => {
    const cleanEmail = email.trim().toLowerCase();
    const user = usersList.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, message: 'Email tidak ditemukan dalam sistem. Pastikan email terdaftar.' };
    }

    if (user.password && password) {
      // Verify password via server-side bcrypt endpoint
      const verification = await verifyPasswordServer(password, user.password);
      if (!verification.valid) {
        return { success: false, message: 'Password salah. Silakan periksa kembali kata sandi Anda.' };
      }

      // If user had a legacy unhashed password and server provided an upgraded bcrypt hash, persist it
      if (verification.upgradedHash) {
        setUsersList(prev => prev.map(u => u.id === user.id ? { ...u, password: verification.upgradedHash } : u));
      }
    }

    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('mis_is_auth', 'true');
    recordActivity('Login User', 'Auth', `Pengguna "${user.name}" (${user.email}) berhasil terverifikasi dan masuk ke sistem SAPA-ALL.`);
    return { success: true, message: `Selamat datang kembali, ${user.name}!`, user };
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    divisi_id: DivisionId;
    role?: string;
    phone?: string;
    createIdentitas?: boolean;
  }): Promise<{ success: boolean; message: string; user?: User }> => {
    const cleanEmail = data.email.trim().toLowerCase();
    if (usersList.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Email sudah terdaftar. Silakan login menggunakan akun tersebut.' };
    }

    // Hash password securely via server-side bcrypt before storing
    const hashedPassword = await hashPasswordServer(data.password);

    let linkedIdentitasId: number | undefined = undefined;
    if (data.createIdentitas) {
      const newIdentitas = addIdentitas({
        nama_lengkap: data.name,
        jenis_identitas: 'KTP',
        nomor_identitas: `ID-${Date.now().toString().slice(-8)}`,
        nomor_hp_primary: data.phone || '0812' + Math.floor(10000000 + Math.random() * 90000000),
        email: data.email,
        status_keamanan: 'Normal',
        jenis_umat: 'Anggota',
        divisi_id: data.divisi_id
      });
      linkedIdentitasId = newIdentitas.id;
    }

    const newUser: User = {
      id: Date.now(),
      name: data.name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      divisi_id: data.divisi_id,
      role: data.role || divisiList.find(d => d.id === data.divisi_id)?.nama_divisi || 'Staff',
      phone: data.phone,
      identitas_id: linkedIdentitasId,
      created_at: new Date().toISOString()
    };

    setUsersList(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('mis_is_auth', 'true');
    recordActivity('Registrasi User', 'Auth', `Akun baru terdaftar: "${newUser.name}" (${newUser.email}) pada divisi ${divisiList.find(d => d.id === data.divisi_id)?.nama_divisi} dengan enkripsi bcrypt.`);
    return { success: true, message: `Akun berhasil didaftarkan dengan proteksi bcrypt! Selamat bertugas, ${newUser.name}.`, user: newUser };
  };

  const logout = () => {
    recordActivity('Logout User', 'Auth', `Pengguna "${currentUser.name}" keluar dari sesi aplikasi.`);
    setIsAuthenticated(false);
    setAuthModalMode('login');
    localStorage.setItem('mis_is_auth', 'false');
  };

  const quickLoginAs = (userId: number) => {
    const user = usersList.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('mis_is_auth', 'true');
      recordActivity('Quick Login', 'Auth', `Beralih akun ke: "${user.name}" (${user.email})`);
    }
  };

  // Users
  const addUser = async (name: string, email: string, divisi_id: DivisionId, role?: string, password?: string, phone?: string): Promise<void> => {
    const plainPass = password || 'password123';
    const hashedPassword = await hashPasswordServer(plainPass);

    const newUser: User = {
      id: Date.now(),
      name,
      email,
      divisi_id,
      password: hashedPassword,
      phone,
      role: role || divisiList.find(d => d.id === divisi_id)?.nama_divisi || 'Staff',
      created_at: new Date().toISOString()
    };
    setUsersList(prev => [...prev, newUser]);
    recordActivity('Tambah User', 'User', `Menambahkan user baru: "${name}" (${email}) pada divisi ${divisiList.find(d => d.id === divisi_id)?.nama_divisi} [Password Bcrypt Protected]`);
  };

  const updateUser = async (id: number, name: string, email: string, divisi_id: DivisionId, role?: string, password?: string, phone?: string): Promise<void> => {
    let hashedPassword: string | undefined = undefined;
    if (password && password.trim()) {
      hashedPassword = await hashPasswordServer(password.trim());
    }

    setUsersList(prev => prev.map(u => {
      if (u.id === id) {
        return {
          ...u,
          name,
          email,
          divisi_id,
          role: role !== undefined ? role : u.role,
          password: hashedPassword !== undefined ? hashedPassword : u.password,
          phone: phone !== undefined ? phone : u.phone
        };
      }
      return u;
    }));
    recordActivity('Update User', 'User', `Mengubah data user ID #${id}: "${name}" (${email})${hashedPassword ? ' (Password diperbarui & di-hash bcrypt)' : ''}`);
  };

  const updateUserProfile = (data: { name: string; avatar?: string; phone?: string }) => {
    const updatedUser: User = {
      ...currentUser,
      name: data.name.trim() || currentUser.name,
      avatar: data.avatar !== undefined ? data.avatar : currentUser.avatar,
      phone: data.phone !== undefined ? data.phone : currentUser.phone
    };

    setCurrentUser(updatedUser);
    setUsersList(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));
    recordActivity('Update Profil', 'User', `Pengguna "${updatedUser.name}" memperbarui nama tampilan / foto profil.`);
  };

  const deleteUser = (id: number) => {
    if (id === currentUser.id) return;
    const target = usersList.find(u => u.id === id);
    setUsersList(prev => prev.filter(u => u.id !== id));
    recordActivity('Hapus User', 'User', `Menghapus user "${target?.name}"`);
  };

  const bulkDeleteUsers = (ids: number[]) => {
    const safeIds = ids.filter(id => id !== currentUser.id && id !== 1);
    if (safeIds.length === 0) return;
    const names = usersList.filter(u => safeIds.includes(u.id)).map(u => u.name).join(', ');
    setUsersList(prev => prev.filter(u => !safeIds.includes(u.id)));
    recordActivity('Hapus Massal User', 'User', `Menghapus ${safeIds.length} pengguna sistem: [${names}]`);
  };

  const clearAllData = () => {
    setBooks([]);
    setPromos([]);
    setIdentitasList([]);
    setOrders([]);
    setMutasis([]);
    setPengajuans([]);
    setPenjualans([]);
    setPenyalurans([]);
    setLogisticLogs([]);
    setProductionLogs([]);
    setActivityLogs([]);
    setAccounts(INITIAL_ACCOUNTS);
    setUsersList(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setIsAuthenticated(false);
    setAuthModalMode('register');
    
    try {
      localStorage.removeItem('mis_books');
      localStorage.removeItem('mis_promos');
      localStorage.removeItem('mis_identitas');
      localStorage.removeItem('mis_orders');
      localStorage.removeItem('mis_mutasis');
      localStorage.removeItem('mis_pengajuans');
      localStorage.removeItem('mis_penjualans');
      localStorage.removeItem('mis_penyalurans');
      localStorage.removeItem('mis_logistic_logs');
      localStorage.removeItem('mis_production_logs');
      localStorage.removeItem('mis_activity_logs');
      localStorage.removeItem('mis_wa_logs');
      localStorage.removeItem('mis_accounts');
      localStorage.removeItem('mis_users');
      localStorage.removeItem('mis_bazaar_events');
      localStorage.removeItem('mis_current_user');
      localStorage.setItem('mis_is_auth', 'false');
      localStorage.setItem('mis_data_version', CLEAN_STORAGE_VERSION);
    } catch (e) {
      console.warn('Storage clear error:', e);
    }
  };

  const loadDemoData = () => {
    setBooks(DEMO_BOOKS);
    setPromos(DEMO_PROMOS);
    setIdentitasList(DEMO_IDENTITAS);
    setOrders(DEMO_ORDERS);
    setMutasis(DEMO_MUTASI);
    setPengajuans(DEMO_PENGAJUAN);
    setPenjualans(DEMO_PENJUALAN);
    setPenyalurans(DEMO_PENYALURAN);
    setLogisticLogs(DEMO_LOGISTIC_LOGS);
    setProductionLogs(DEMO_PRODUCTION_LOGS);
    setActivityLogs(DEMO_ACTIVITY_LOGS);
    setAccounts(DEMO_ACCOUNTS);
    setUsersList(DEMO_USERS);
    setBazaarEvents(DEMO_BAZAAR_EVENTS);
    setCurrentUser(DEMO_USERS[0]);
    setIsAuthenticated(true);
    setAuthModalMode('login');

    try {
      localStorage.setItem('mis_books', JSON.stringify(DEMO_BOOKS));
      localStorage.setItem('mis_promos', JSON.stringify(DEMO_PROMOS));
      localStorage.setItem('mis_identitas', JSON.stringify(DEMO_IDENTITAS));
      localStorage.setItem('mis_orders', JSON.stringify(DEMO_ORDERS));
      localStorage.setItem('mis_mutasis', JSON.stringify(DEMO_MUTASI));
      localStorage.setItem('mis_pengajuans', JSON.stringify(DEMO_PENGAJUAN));
      localStorage.setItem('mis_penjualans', JSON.stringify(DEMO_PENJUALAN));
      localStorage.setItem('mis_penyalurans', JSON.stringify(DEMO_PENYALURAN));
      localStorage.setItem('mis_logistic_logs', JSON.stringify(DEMO_LOGISTIC_LOGS));
      localStorage.setItem('mis_production_logs', JSON.stringify(DEMO_PRODUCTION_LOGS));
      localStorage.setItem('mis_activity_logs', JSON.stringify(DEMO_ACTIVITY_LOGS));
      localStorage.setItem('mis_accounts', JSON.stringify(DEMO_ACCOUNTS));
      localStorage.setItem('mis_users', JSON.stringify(DEMO_USERS));
      localStorage.setItem('mis_bazaar_events', JSON.stringify(DEMO_BAZAAR_EVENTS));
      localStorage.setItem('mis_current_user', JSON.stringify(DEMO_USERS[0]));
      localStorage.setItem('mis_is_auth', 'true');
      localStorage.setItem('mis_data_version', CLEAN_STORAGE_VERSION);
    } catch (e) {
      console.warn('Storage sync demo data error:', e);
    }

    recordActivity('Muat Data Sampel', 'System', 'Memuat seluruh data demo/sampel MIS untuk evaluasi fitur.', 1, DEMO_USERS[0].name);
  };

  const resetToDefault = () => {
    clearAllData();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchDivision,
        currentSubTab,
        setCurrentSubTab,
        theme,
        setTheme: handleSetTheme,
        toggleTheme,
        colorPreset,
        setColorPreset: handleSetColorPreset,
        userSettings,
        updateUserSettings,
        toggleMascotSpeechBubble,
        isAuthenticated,
        setIsAuthenticated,
        login,
        register,
        logout,
        quickLoginAs,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openLoginModal,
        openRegisterModal,
        divisiList,
        usersList,
        categories,
        accounts,
        books,
        promos,
        salesChannels,
        expeditions,
        identitasList,
        orders,
        mutasis,
        pengajuans,
        penjualans,
        penyalurans,
        logisticLogs,
        productionLogs,
        activityLogs,
        aiAppState,
        setAiAppState,
        triggerTaskSuccess,
        lastCompletedTaskMessage,
        recordActivity,
        addBook,
        updateBook,
        updateBookCost,
        adjustBookStock,
        deleteBook,
        bulkDeleteBooks,
        ajukanCetak,
        createOrder,
        tandaiLunasOrder,
        cancelOrder,
        bulkDeleteOrders,
        checkPromoCode,
        lookupEligiblePromos,
        addPromo,
        updatePromo,
        deletePromo,
        bulkDeletePromos,
        addSalesChannel,
        updateSalesChannel,
        deleteSalesChannel,
        addExpedition,
        updateExpedition,
        deleteExpedition,
        bazaarEvents,
        addBazaarEvent,
        updateBazaarEvent,
        deleteBazaarEvent,
        allocateBazaarBooks,
        reconcileBazaarEvent,
        addMutasi,
        updateMutasi,
        deleteMutasi,
        bulkDeleteMutasi,
        addAccount,
        updateAccount,
        deleteAccount,
        approvePengajuanCetak,
        rejectPengajuanCetak,
        bulkDeletePengajuanCetak,
        addProductionOutput,
        bulkDeleteProductionLogs,
        dispatchShipment,
        addManualLogisticLog,
        bulkDeleteLogisticLogs,
        bulkDeletePenyalurans,
        addIdentitas,
        updateIdentitas,
        deleteIdentitas,
        bulkDeleteIdentitas,
        addUser,
        updateUser,
        updateUserProfile,
        deleteUser,
        bulkDeleteUsers,
        resetToDefault,
        clearAllData,
        loadDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
