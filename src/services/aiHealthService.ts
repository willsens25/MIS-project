export type AiHealthStatus =
  | 'healthy'
  | 'degraded'
  | 'quota_exceeded'
  | 'invalid_key'
  | 'unconfigured'
  | 'down';

export type AiSeverity = 'none' | 'warning' | 'critical';

export interface AiHealthInfo {
  status: AiHealthStatus;
  online: boolean;
  hasDisruption: boolean;
  severity: AiSeverity;
  title: string;
  message: string;
  troubleshooting?: string;
  activeModel?: string;
  latencyMs: number;
  timestamp: string;
  cached?: boolean;
  ageSeconds?: number;
}

/**
 * Fetch AI API health and connectivity status from the server endpoint
 */
export async function fetchAiHealthStatus(force = false): Promise<AiHealthInfo> {
  const url = `/api/gemini/status${force ? '?force=true' : ''}`;
  const startTime = Date.now();

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        status: res.status === 503 ? 'degraded' : 'down',
        online: res.status === 503,
        hasDisruption: true,
        severity: res.status === 503 ? 'warning' : 'critical',
        title: res.status === 503 ? 'Pusat Data AI Sedang Padat (HTTP 503)' : `Gangguan Gateway Server (HTTP ${res.status})`,
        message: res.status === 503
          ? 'Pusat data Google Gemini sedang mengalami antrean trafik tinggi.'
          : 'Server mengembalikan status non-200 saat memeriksa koneksi AI.',
        troubleshooting: errText.slice(0, 150) || 'Silakan muat ulang halaman atau periksa konfigurasi deployment.',
        latencyMs: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }

    const data = await res.json();
    return {
      status: data.status || 'healthy',
      online: Boolean(data.online),
      hasDisruption: Boolean(data.hasDisruption),
      severity: data.severity || 'none',
      title: data.title || 'Koneksi AI Optimal',
      message: data.message || 'Layanan AI beroperasi normal.',
      troubleshooting: data.troubleshooting,
      activeModel: data.activeModel || 'gemini-3.8-flash & gemini-3.1-flash-lite',
      latencyMs: typeof data.latencyMs === 'number' ? data.latencyMs : Date.now() - startTime,
      timestamp: data.timestamp || new Date().toISOString(),
      cached: Boolean(data.cached),
      ageSeconds: data.ageSeconds
    };
  } catch (err: any) {
    return {
      status: 'down',
      online: false,
      hasDisruption: true,
      severity: 'critical',
      title: 'Koneksi Terputus',
      message: 'Tidak dapat menjangkau server API AI.',
      troubleshooting: 'Periksa koneksi jaringan internet Anda atau periksa apakah server sedang offline.',
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Visual badge styling helper based on AI health status
 */
export function getAiHealthBadgeConfig(info: AiHealthInfo | null, isChecking = false) {
  if (isChecking && !info) {
    return {
      dotColor: 'bg-slate-400 animate-pulse',
      bgClass: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      label: 'Memeriksa...',
      shortLabel: 'Cek Status'
    };
  }

  if (!info) {
    return {
      dotColor: 'bg-emerald-400',
      bgClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      label: 'AI Online',
      shortLabel: 'Online'
    };
  }

  switch (info.status) {
    case 'healthy':
      return {
        dotColor: 'bg-emerald-400',
        bgClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        label: `AI Online (${info.latencyMs}ms)`,
        shortLabel: 'Online'
      };
    case 'degraded':
      return {
        dotColor: 'bg-amber-400 animate-pulse',
        bgClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        label: 'Lonjakan Trafik (503)',
        shortLabel: 'Trafik Padat'
      };
    case 'quota_exceeded':
      return {
        dotColor: 'bg-orange-400 animate-ping',
        bgClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        label: 'Batas Kuota Tercapai',
        shortLabel: 'Kuota Habis'
      };
    case 'invalid_key':
    case 'unconfigured':
      return {
        dotColor: 'bg-rose-400',
        bgClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        label: 'Kunci API Belum Siap',
        shortLabel: 'API Key Off'
      };
    case 'down':
    default:
      return {
        dotColor: 'bg-red-500 animate-pulse',
        bgClass: 'bg-red-500/20 text-red-300 border-red-500/40',
        label: 'Gangguan Teknis',
        shortLabel: 'Gangguan'
      };
  }
}
