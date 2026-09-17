import { useState, useEffect, useCallback } from 'react';
import {
  DashboardCardConfig,
  DashboardLayoutSettings,
  LayoutPresetKey,
  DEFAULT_DASHBOARD_CARDS,
  LAYOUT_PRESETS
} from '../types/dashboardLayout';

interface UseDashboardLayoutOptions {
  userId?: number;
  initialPreset?: LayoutPresetKey;
}

export const useDashboardLayout = (options: UseDashboardLayoutOptions = {}) => {
  const { userId } = options;
  const storageKey = `sapa_dashboard_layout_${userId ? `u${userId}` : 'global'}`;

  // Load initial settings from localStorage or fallback to defaults
  const loadInitialSettings = (): DashboardLayoutSettings => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<DashboardLayoutSettings>;
        if (parsed.cards && Array.isArray(parsed.cards)) {
          // Merge with any new default cards that might not be in saved layout
          const savedCardMap = new Map(parsed.cards.map((c) => [c.id, c]));
          const mergedCards: DashboardCardConfig[] = [];

          // Add existing saved cards in their saved order
          parsed.cards.forEach((sc) => {
            const def = DEFAULT_DASHBOARD_CARDS.find((d) => d.id === sc.id);
            if (def) {
              mergedCards.push({
                ...def,
                ...sc,
                // Keep default metadata updated if improved
                title: sc.title || def.title,
                description: sc.description || def.description,
                category: def.category,
                divisiId: def.divisiId
              });
            }
          }          );

          // Append any newly introduced cards that were missing
          DEFAULT_DASHBOARD_CARDS.forEach((def) => {
            if (!savedCardMap.has(def.id)) {
              mergedCards.push({
                ...def,
                order: mergedCards.length + 1
              });
            }
          });

          // Ensure sequential order indexing
          const normalizedCards = mergedCards.map((c, idx) => ({
            ...c,
            order: idx + 1
          }));

          return {
            columns: (parsed.columns === 2 || parsed.columns === 3 || parsed.columns === 4) ? parsed.columns : 4,
            cards: normalizedCards,
            activePreset: parsed.activePreset
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved dashboard layout, using defaults:', e);
    }

    return {
      columns: 4,
      cards: [...DEFAULT_DASHBOARD_CARDS],
      activePreset: 'default'
    };
  };

  const [settings, setSettings] = useState<DashboardLayoutSettings>(loadInitialSettings);
  const [isConfigMode, setIsConfigMode] = useState<boolean>(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [hasCustomChanges, setHasCustomChanges] = useState<boolean>(false);

  // Sync with localStorage whenever settings change
  const saveSettings = useCallback((newSettings: DashboardLayoutSettings) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newSettings));
      setSettings(newSettings);
      setHasCustomChanges(true);
    } catch (e) {
      console.error('Failed to save dashboard layout:', e);
    }
  }, [storageKey]);

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

      try {
        localStorage.setItem(storageKey, JSON.stringify(newSettings));
      } catch (e) {
        console.error(e);
      }

      setHasCustomChanges(true);
      return newSettings;
    });
  }, [storageKey]);

  // Move single card up or down by ID (for accessibility and quick controls)
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

      try {
        localStorage.setItem(storageKey, JSON.stringify(newSettings));
      } catch (e) {
        console.error(e);
      }

      setHasCustomChanges(true);
      return newSettings;
    });
  }, [storageKey]);

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

      try {
        localStorage.setItem(storageKey, JSON.stringify(newSettings));
      } catch (e) {
        console.error(e);
      }

      setHasCustomChanges(true);
      return newSettings;
    });
  }, [storageKey]);

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

      try {
        localStorage.setItem(storageKey, JSON.stringify(newSettings));
      } catch (e) {
        console.error(e);
      }

      setHasCustomChanges(true);
      return newSettings;
    });
  }, [storageKey]);

  // Set grid columns
  const setColumns = useCallback((columns: 2 | 3 | 4) => {
    setSettings((prev) => {
      const newSettings = { ...prev, columns };
      try {
        localStorage.setItem(storageKey, JSON.stringify(newSettings));
      } catch (e) {
        console.error(e);
      }
      return newSettings;
    });
  }, [storageKey]);

  // Reset to default layout
  const resetToDefault = useCallback(() => {
    const defaultSettings: DashboardLayoutSettings = {
      columns: 4,
      cards: [...DEFAULT_DASHBOARD_CARDS],
      activePreset: 'default'
    };
    saveSettings(defaultSettings);
    setHasCustomChanges(false);
  }, [saveSettings]);

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
    isConfigMode,
    isConfigModalOpen,
    hasCustomChanges,
    setIsConfigMode,
    toggleConfigMode: () => setIsConfigMode((v) => !v),
    setIsConfigModalOpen,
    reorderCards,
    moveCard,
    toggleCardVisibility,
    applyPreset,
    setColumns,
    resetToDefault
  };
};
