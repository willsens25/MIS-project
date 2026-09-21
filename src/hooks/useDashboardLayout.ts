import { useState, useEffect, useCallback } from 'react';
import { DivisionId } from '../types';
import {
  DashboardCardConfig,
  DashboardLayoutSettings,
  LayoutPresetKey,
  DEFAULT_DASHBOARD_CARDS,
  LAYOUT_PRESETS
} from '../types/dashboardLayout';

interface UseDashboardLayoutOptions {
  userId?: number;
  userName?: string;
  userDivisiId?: DivisionId;
  initialPreset?: LayoutPresetKey;
}

const LAST_ACTIVE_KEY = 'sapa_dashboard_layout_last_active';
const LAST_ACTIVE_POINTER = 'sapa_dashboard_layout_last_active_key';
const GLOBAL_FALLBACK_KEY = 'sapa_dashboard_layout_global';

export const useDashboardLayout = (options: UseDashboardLayoutOptions = {}) => {
  const { userId, userName, userDivisiId } = options;
  const storageKey = `sapa_dashboard_layout_${userId ? `u${userId}` : 'global'}`;

  // Helper to normalize and merge cards from a parsed settings object
  const normalizeCards = (savedCards: DashboardCardConfig[]): DashboardCardConfig[] => {
    const savedCardMap = new Map(savedCards.map((c) => [c.id, c]));
    const mergedCards: DashboardCardConfig[] = [];

    // 1. Keep existing saved cards in their saved order
    savedCards.forEach((sc) => {
      const def = DEFAULT_DASHBOARD_CARDS.find((d) => d.id === sc.id);
      if (def) {
        mergedCards.push({
          ...def,
          ...sc,
          title: sc.title || def.title,
          description: sc.description || def.description,
          category: def.category,
          divisiId: def.divisiId,
          divisiName: def.divisiName,
          divisiCode: def.divisiCode
        });
      }
    });

    // 2. Append any newly introduced default cards that were missing
    DEFAULT_DASHBOARD_CARDS.forEach((def) => {
      if (!savedCardMap.has(def.id)) {
        mergedCards.push({
          ...def,
          order: mergedCards.length + 1
        });
      }
    });

    // 3. Ensure sequential order indexing (1, 2, 3...)
    return mergedCards.map((c, idx) => ({
      ...c,
      order: idx + 1
    }));
  };

  // Helper to generate division-specific preset if starting fresh
  const getDivisionPresetKey = (divId?: DivisionId): LayoutPresetKey => {
    switch (divId) {
      case 2:
        return 'keuangan';
      case 3:
        return 'penerbitan';
      case 4:
        return 'marketing';
      case 5:
        return 'produksi';
      case 6:
        return 'logistik';
      default:
        return 'default';
    }
  };

  // Load initial settings from localStorage or fallback to defaults
  const loadInitialSettings = (): DashboardLayoutSettings => {
    try {
      // 1. First priority: user-specific storage key
      let saved = localStorage.getItem(storageKey);

      // 2. Second priority: last active session layout
      if (!saved) {
        saved = localStorage.getItem(LAST_ACTIVE_KEY);
      }

      // 3. Third priority: global fallback key
      if (!saved) {
        saved = localStorage.getItem(GLOBAL_FALLBACK_KEY);
      }

      if (saved) {
        const parsed = JSON.parse(saved) as Partial<DashboardLayoutSettings>;
        if (parsed.cards && Array.isArray(parsed.cards)) {
          const normalized = normalizeCards(parsed.cards as DashboardCardConfig[]);
          return {
            columns: (parsed.columns === 2 || parsed.columns === 3 || parsed.columns === 4) ? parsed.columns : 4,
            cards: normalized,
            activePreset: parsed.activePreset,
            lastSaved: parsed.lastSaved || new Date().toISOString(),
            density: parsed.density === 'compact' ? 'compact' : 'comfortable',
            savedByUserId: parsed.savedByUserId || userId,
            savedByUserName: parsed.savedByUserName || userName
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved dashboard layout, using role/default preset:', e);
    }

    // Role-specific initial preset if available
    const initialPresetKey = getDivisionPresetKey(userDivisiId);
    const initialPreset = LAYOUT_PRESETS.find((p) => p.id === initialPresetKey);

    if (initialPreset && initialPresetKey !== 'default') {
      const cardMap = new Map(DEFAULT_DASHBOARD_CARDS.map((c) => [c.id, c]));
      const ordered: DashboardCardConfig[] = [];
      initialPreset.orderedCardIds.forEach((id) => {
        const c = cardMap.get(id);
        if (c) {
          ordered.push({ ...c, visible: true });
          cardMap.delete(id);
        }
      });
      cardMap.forEach((c) => ordered.push(c));
      const normalized = ordered.map((c, idx) => ({ ...c, order: idx + 1 }));

      return {
        columns: 4,
        cards: normalized,
        activePreset: initialPresetKey,
        lastSaved: new Date().toISOString(),
        density: 'comfortable',
        savedByUserId: userId,
        savedByUserName: userName
      };
    }

    return {
      columns: 4,
      cards: [...DEFAULT_DASHBOARD_CARDS],
      activePreset: 'default',
      lastSaved: new Date().toISOString(),
      density: 'comfortable',
      savedByUserId: userId,
      savedByUserName: userName
    };
  };

  const [settings, setSettings] = useState<DashboardLayoutSettings>(loadInitialSettings);
  const [isConfigMode, setIsConfigMode] = useState<boolean>(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [hasCustomChanges, setHasCustomChanges] = useState<boolean>(false);
  const [lastSavedDisplay, setLastSavedDisplay] = useState<string>('Sesi Tersimpan');

  // Rehydrate settings whenever user or storageKey changes
  useEffect(() => {
    const loaded = loadInitialSettings();
    setSettings(loaded);
  }, [storageKey, userId]);

  // Synchronize across browser tabs in real-time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if ((e.key === storageKey || e.key === LAST_ACTIVE_KEY) && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as Partial<DashboardLayoutSettings>;
          if (parsed.cards && Array.isArray(parsed.cards)) {
            const normalized = normalizeCards(parsed.cards as DashboardCardConfig[]);
            setSettings({
              columns: (parsed.columns === 2 || parsed.columns === 3 || parsed.columns === 4) ? parsed.columns : 4,
              cards: normalized,
              activePreset: parsed.activePreset,
              lastSaved: parsed.lastSaved || new Date().toISOString(),
              density: parsed.density === 'compact' ? 'compact' : 'comfortable',
              savedByUserId: parsed.savedByUserId,
              savedByUserName: parsed.savedByUserName
            });
          }
        } catch (err) {
          console.error('Storage sync error:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageKey]);

  // Sync to LocalStorage (writes to user key, last_active key, and pointer)
  const saveToLocalStorage = useCallback((newSettings: DashboardLayoutSettings) => {
    try {
      const now = new Date().toISOString();
      const enriched: DashboardLayoutSettings = {
        ...newSettings,
        lastSaved: now,
        savedByUserId: userId,
        savedByUserName: userName
      };

      const serialized = JSON.stringify(enriched);
      localStorage.setItem(storageKey, serialized);
      localStorage.setItem(LAST_ACTIVE_KEY, serialized);
      localStorage.setItem(LAST_ACTIVE_POINTER, storageKey);
      localStorage.setItem(GLOBAL_FALLBACK_KEY, serialized);

      setSettings(enriched);
      setHasCustomChanges(true);
      setLastSavedDisplay(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
      return true;
    } catch (e) {
      console.error('Failed to save dashboard layout to LocalStorage:', e);
      return false;
    }
  }, [storageKey, userId, userName]);

  // Reorder cards by index
  const reorderCards = useCallback((sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return;

    setSettings((prev) => {
      const currentCards = [...prev.cards];
      const [movedCard] = currentCards.splice(sourceIndex, 1);
      currentCards.splice(destinationIndex, 0, movedCard);

      const updatedCards = currentCards.map((c, idx) => ({
        ...c,
        order: idx + 1
      }));

      const newSettings: DashboardLayoutSettings = {
        ...prev,
        cards: updatedCards,
        activePreset: undefined // custom order
      };

      saveToLocalStorage(newSettings);
      return newSettings;
    });
  }, [saveToLocalStorage]);

  // Move single card up or down by ID
  const moveCard = useCallback((cardId: string, direction: 'up' | 'down') => {
    setSettings((prev) => {
      const index = prev.cards.findIndex((c) => c.id === cardId);
      if (index === -1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.cards.length) return prev;

      const newCards = [...prev.cards];
      const [card] = newCards.splice(index, 1);
      newCards.splice(targetIndex, 0, card);

      const updatedCards = newCards.map((c, idx) => ({
        ...c,
        order: idx + 1
      }));

      const newSettings: DashboardLayoutSettings = {
        ...prev,
        cards: updatedCards,
        activePreset: undefined
      };

      saveToLocalStorage(newSettings);
      return newSettings;
    });
  }, [saveToLocalStorage]);

  // Toggle card visibility
  const toggleCardVisibility = useCallback((cardId: string) => {
    setSettings((prev) => {
      const updatedCards = prev.cards.map((c) => {
        if (c.id === cardId) {
          return { ...c, visible: !c.visible };
        }
        return c;
      });

      const newSettings: DashboardLayoutSettings = {
        ...prev,
        cards: updatedCards
      };

      saveToLocalStorage(newSettings);
      return newSettings;
    });
  }, [saveToLocalStorage]);

  // Apply a predefined layout preset
  const applyPreset = useCallback((presetKey: LayoutPresetKey) => {
    const preset = LAYOUT_PRESETS.find((p) => p.id === presetKey);
    if (!preset) return;

    setSettings((prev) => {
      const cardMap = new Map(prev.cards.map((c) => [c.id, c]));
      const orderedCards: DashboardCardConfig[] = [];

      // Add cards in preset order
      preset.orderedCardIds.forEach((id) => {
        const c = cardMap.get(id);
        if (c) {
          orderedCards.push({ ...c, visible: true });
          cardMap.delete(id);
        }
      });

      // Append any remaining cards that weren't in preset
      cardMap.forEach((c) => {
        orderedCards.push(c);
      });

      const updatedCards = orderedCards.map((c, idx) => ({
        ...c,
        order: idx + 1
      }));

      const newSettings: DashboardLayoutSettings = {
        ...prev,
        cards: updatedCards,
        activePreset: presetKey
      };

      saveToLocalStorage(newSettings);
      return newSettings;
    });
  }, [saveToLocalStorage]);

  // Set grid columns
  const setColumns = useCallback((columns: 2 | 3 | 4) => {
    setSettings((prev) => {
      const newSettings: DashboardLayoutSettings = { ...prev, columns };
      saveToLocalStorage(newSettings);
      return newSettings;
    });
  }, [saveToLocalStorage]);

  // Set card display density
  const setDensity = useCallback((density: 'comfortable' | 'compact') => {
    setSettings((prev) => {
      const newSettings: DashboardLayoutSettings = { ...prev, density };
      saveToLocalStorage(newSettings);
      return newSettings;
    });
  }, [saveToLocalStorage]);

  // Reset to default layout
  const resetToDefault = useCallback(() => {
    const defaultSettings: DashboardLayoutSettings = {
      columns: 4,
      cards: [...DEFAULT_DASHBOARD_CARDS],
      activePreset: 'default',
      density: 'comfortable',
      lastSaved: new Date().toISOString(),
      savedByUserId: userId,
      savedByUserName: userName
    };
    saveToLocalStorage(defaultSettings);
    setHasCustomChanges(false);
  }, [saveToLocalStorage, userId, userName]);

  // Export current layout config to JSON string
  const exportConfigJson = useCallback((): string => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  // Import layout config from JSON string
  const importConfigJson = useCallback((jsonStr: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonStr) as Partial<DashboardLayoutSettings>;
      if (!parsed.cards || !Array.isArray(parsed.cards)) {
        return { success: false, message: 'Format file konfigurasi tidak valid (kartu widget tidak ditemukan).' };
      }

      const normalized = normalizeCards(parsed.cards as DashboardCardConfig[]);
      const newSettings: DashboardLayoutSettings = {
        columns: (parsed.columns === 2 || parsed.columns === 3 || parsed.columns === 4) ? parsed.columns : 4,
        cards: normalized,
        activePreset: parsed.activePreset,
        density: parsed.density === 'compact' ? 'compact' : 'comfortable',
        lastSaved: new Date().toISOString(),
        savedByUserId: userId,
        savedByUserName: userName
      };

      saveToLocalStorage(newSettings);
      return { success: true, message: 'Preferensi tata letak berhasil diimpor dan disimpan ke LocalStorage!' };
    } catch (e) {
      return { success: false, message: 'Gagal mengurai JSON konfigurasi: format tidak sesuai.' };
    }
  }, [saveToLocalStorage, userId, userName]);

  // Filtered list of visible cards sorted by their order
  const visibleCards = settings.cards
    .filter((c) => c.visible)
    .sort((a, b) => a.order - b.order);

  // All cards sorted by their order
  const sortedCards = [...settings.cards].sort((a, b) => a.order - b.order);

  return {
    cards: sortedCards,
    visibleCards,
    columns: settings.columns,
    activePreset: settings.activePreset,
    density: settings.density || 'comfortable',
    lastSaved: settings.lastSaved,
    lastSavedDisplay,
    isConfigMode,
    isConfigModalOpen,
    hasCustomChanges,
    storageKey,
    setIsConfigMode,
    toggleConfigMode: () => setIsConfigMode((v) => !v),
    setIsConfigModalOpen,
    reorderCards,
    moveCard,
    toggleCardVisibility,
    applyPreset,
    setColumns,
    setDensity,
    resetToDefault,
    saveSettings: saveToLocalStorage,
    persistToLocalStorage: () => saveToLocalStorage(settings),
    exportConfigJson,
    importConfigJson
  };
};
