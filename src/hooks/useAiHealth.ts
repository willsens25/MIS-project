import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AiHealthInfo,
  fetchAiHealthStatus,
  getAiHealthBadgeConfig
} from '../services/aiHealthService';

interface UseAiHealthOptions {
  autoCheck?: boolean;
  pollIntervalMs?: number; // 0 or undefined to disable auto polling
}

export function useAiHealth(options: UseAiHealthOptions = { autoCheck: true }) {
  const [healthInfo, setHealthInfo] = useState<AiHealthInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState<Date | null>(null);
  const isMountedRef = useRef(true);

  const checkStatus = useCallback(async (force = false): Promise<AiHealthInfo> => {
    setIsChecking(true);
    try {
      const result = await fetchAiHealthStatus(force);
      if (isMountedRef.current) {
        setHealthInfo(result);
        setLastCheckedTime(new Date());
      }
      return result;
    } finally {
      if (isMountedRef.current) {
        setIsChecking(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    if (options.autoCheck !== false) {
      checkStatus(false);
    }

    if (options.pollIntervalMs && options.pollIntervalMs > 0) {
      const interval = setInterval(() => {
        checkStatus(false);
      }, options.pollIntervalMs);
      return () => {
        isMountedRef.current = false;
        clearInterval(interval);
      };
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [options.autoCheck, options.pollIntervalMs, checkStatus]);

  const badgeConfig = getAiHealthBadgeConfig(healthInfo, isChecking);

  return {
    healthInfo,
    isChecking,
    lastCheckedTime,
    checkStatus,
    badgeConfig,
    hasDisruption: Boolean(healthInfo?.hasDisruption),
    isHealthy: healthInfo?.status === 'healthy',
    isDegraded: healthInfo?.status === 'degraded',
    isDown: healthInfo?.status === 'down' || healthInfo?.status === 'invalid_key' || healthInfo?.status === 'unconfigured',
    isQuotaExceeded: healthInfo?.status === 'quota_exceeded'
  };
}
