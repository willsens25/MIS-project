import { useEffect, useState, useCallback, useRef } from 'react';

// 30 minutes in milliseconds
export const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
// Show warning 2 minutes before the 30-minute limit
export const WARNING_BEFORE_TIMEOUT_MS = 2 * 60 * 1000;
// Throttle activity recording to prevent storage spamming
export const ACTIVITY_THROTTLE_MS = 3000;

export const STORAGE_LAST_ACTIVE_KEY = 'mis_last_active_at';
export const STORAGE_TIMEOUT_NOTICE_KEY = 'mis_session_timeout_notice';

interface UseAutoLogoutOptions {
  isAuthenticated: boolean;
  onLogout: () => void;
  onAutoLogoutRecord?: (reason: string) => void;
}

export const useAutoLogout = ({
  isAuthenticated,
  onLogout,
  onAutoLogoutRecord,
}: UseAutoLogoutOptions) => {
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(120);
  const [simulatedWarningOffset, setSimulatedWarningOffset] = useState<number | null>(null);

  const lastActivityRef = useRef<number>(Date.now());
  const lastThrottleRef = useRef<number>(0);
  const onLogoutRef = useRef(onLogout);
  const onAutoLogoutRecordRef = useRef(onAutoLogoutRecord);

  useEffect(() => {
    onLogoutRef.current = onLogout;
  }, [onLogout]);

  useEffect(() => {
    onAutoLogoutRecordRef.current = onAutoLogoutRecord;
  }, [onAutoLogoutRecord]);

  // Update last activity timestamp and sync across tabs
  const refreshActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    setSimulatedWarningOffset(null);
    setShowWarningModal(false);

    // Throttle writing to localStorage
    if (now - lastThrottleRef.current > ACTIVITY_THROTTLE_MS) {
      lastThrottleRef.current = now;
      try {
        localStorage.setItem(STORAGE_LAST_ACTIVE_KEY, now.toString());
      } catch (e) {
        console.warn('Failed to persist last active time:', e);
      }
    }
  }, []);

  // Quick simulation helper for QA & developer demonstration
  const simulateTimeoutWarning = useCallback(() => {
    if (!isAuthenticated) return;
    // Simulate being inactive for 28.5 minutes (leaving 90 seconds)
    const simulatedInactiveMs = INACTIVITY_TIMEOUT_MS - 90 * 1000;
    const simulatedNow = Date.now() - simulatedInactiveMs;
    lastActivityRef.current = simulatedNow;
    setSimulatedWarningOffset(simulatedInactiveMs);
    setShowWarningModal(true);
    setRemainingSeconds(90);
  }, [isAuthenticated]);

  // Listen to cross-tab updates via storage event
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_LAST_ACTIVE_KEY && e.newValue) {
        const remoteTime = parseInt(e.newValue, 10);
        if (!isNaN(remoteTime) && remoteTime > lastActivityRef.current) {
          lastActivityRef.current = remoteTime;
          setShowWarningModal(false);
          setSimulatedWarningOffset(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated]);

  // Listen to user interaction events across the document
  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarningModal(false);
      return;
    }

    // Initialize last active timestamp on login
    const initialTime = Date.now();
    lastActivityRef.current = initialTime;
    try {
      localStorage.setItem(STORAGE_LAST_ACTIVE_KEY, initialTime.toString());
    } catch {
      // Ignored
    }

    const handleUserInteraction = () => {
      // Only register background interaction if warning modal is not actively prompting,
      // or refresh on deliberate user click
      if (!showWarningModal) {
        refreshActivity();
      }
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click', 'wheel'];
    
    events.forEach(eventName => {
      window.addEventListener(eventName, handleUserInteraction, { passive: true });
    });

    return () => {
      events.forEach(eventName => {
        window.removeEventListener(eventName, handleUserInteraction);
      });
    };
  }, [isAuthenticated, showWarningModal, refreshActivity]);

  // Main ticker checking inactivity interval every second
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkInterval = setInterval(() => {
      const now = Date.now();

      // Read remote storage timestamp in case other tab updated it recently
      let effectiveLastActive = lastActivityRef.current;
      if (simulatedWarningOffset === null) {
        try {
          const stored = localStorage.getItem(STORAGE_LAST_ACTIVE_KEY);
          if (stored) {
            const storedTime = parseInt(stored, 10);
            if (!isNaN(storedTime) && storedTime > effectiveLastActive) {
              effectiveLastActive = storedTime;
              lastActivityRef.current = storedTime;
            }
          }
        } catch {
          // Ignored
        }
      }

      const elapsed = now - effectiveLastActive;
      const remainingMs = INACTIVITY_TIMEOUT_MS - elapsed;
      const remainingSecs = Math.max(0, Math.ceil(remainingMs / 1000));

      // Check if session has fully expired (30 minutes reached)
      if (remainingMs <= 0) {
        setShowWarningModal(false);
        setSimulatedWarningOffset(null);

        // Store notice message so the login screen displays it clearly
        try {
          localStorage.setItem(
            STORAGE_TIMEOUT_NOTICE_KEY,
            'Sesi Anda telah berakhir secara otomatis setelah 30 menit tidak aktif demi keamanan sistem. Silakan masuk kembali.'
          );
        } catch {
          // Ignored
        }

        // Record audit activity
        if (onAutoLogoutRecordRef.current) {
          onAutoLogoutRecordRef.current(
            'Sesi ditutup otomatis oleh sistem karena tidak ada aktivitas selama 30 menit (Inactivity Timeout).'
          );
        }

        // Perform session logout
        onLogoutRef.current();
        return;
      }

      // Check if warning threshold reached (inactive for >= 28 minutes, remaining <= 2 minutes)
      if (remainingMs <= WARNING_BEFORE_TIMEOUT_MS) {
        setShowWarningModal(true);
        setRemainingSeconds(remainingSecs);
      } else {
        if (showWarningModal) {
          setShowWarningModal(false);
        }
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [isAuthenticated, showWarningModal, simulatedWarningOffset]);

  return {
    showWarningModal,
    remainingSeconds,
    refreshActivity,
    simulateTimeoutWarning,
  };
};
