/**
 * Sound Effects Utility for SAPA-ALL MIS Lamrim Nusantara
 * Provides subtle, pleasant UI sound feedback using the Web Audio API.
 * Includes automatic mute protection for noise-sensitive environments,
 * background tabs, reduced-motion preferences, and user toggles.
 */

const STORAGE_KEY = 'mis_sound_effects_muted';

let sharedAudioCtx: AudioContext | null = null;
let lastPlayTimestamp = 0;

function getAudioContext(): AudioContext | null {
  try {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {
        // Ignore audio autoplay restrictions
      });
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Checks whether audio should be muted based on:
 * 1. User's explicit mute setting in localStorage
 * 2. Tab visibility (muted when in background)
 * 3. Accessibility / sensory reduction preferences (prefers-reduced-motion)
 */
export function isEnvironmentMuted(): boolean {
  if (typeof window === 'undefined') return true;

  // 1. Check if the page is currently in the background / hidden
  if (typeof document !== 'undefined' && document.hidden) {
    return true;
  }

  // 2. Check user's explicit preference in localStorage
  const savedPreference = localStorage.getItem(STORAGE_KEY);
  if (savedPreference !== null) {
    return savedPreference === 'true';
  }

  // 3. Fallback: If user prefers reduced motion (sensory sensitivity), default to muted
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true;
  }

  // Default is unmuted (sound enabled for subtle tactile feedback)
  return false;
}

/**
 * Returns current mute setting for display
 */
export function getSoundMutedState(): boolean {
  return isEnvironmentMuted();
}

/**
 * Set sound mute state explicitly
 */
export function setSoundMuted(muted: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, muted ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('mis-sound-state-change', { detail: { muted } }));
  } catch {
    // Storage access might be restricted in some sandboxes
  }
}

/**
 * Toggle sound mute state
 */
export function toggleSoundMuted(): boolean {
  const current = isEnvironmentMuted();
  const next = !current;
  setSoundMuted(next);
  return next;
}

/**
 * Plays a subtle, pleasant tactile 'click' sound effect.
 * Acoustically modeled after a soft, warm mechanical switch / trackpad tap.
 *
 * @param options.volume Custom volume multiplier (default 0.08)
 * @returns boolean indicating if the sound was produced
 */
export function playPleasantClickSound(options?: { volume?: number }): boolean {
  // Prevent playback in noise-inappropriate environments or if muted
  if (isEnvironmentMuted()) {
    return false;
  }

  // Prevent harsh audio clatter on rapid repeated clicks (min 60ms gap)
  const now = Date.now();
  if (now - lastPlayTimestamp < 60) {
    return false;
  }
  lastPlayTimestamp = now;

  const ctx = getAudioContext();
  if (!ctx) return false;

  try {
    const startTime = ctx.currentTime;
    const duration = 0.045; // 45 milliseconds: crisp, minimal, and non-intrusive
    const volume = options?.volume ?? 0.075;

    // Master gain node with smooth envelope to eliminate any DC pop
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, startTime);
    // Rapid attack (2ms)
    masterGain.gain.linearRampToValueAtTime(volume, startTime + 0.002);
    // Exponential decay to zero
    masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // Warm low-pass filter to remove digital harshness
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, startTime);
    filter.Q.setValueAtTime(1.2, startTime);

    // Primary oscillator: Gentle tactile chirp dropping from 740Hz to 280Hz
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(740, startTime);
    osc1.frequency.exponentialRampToValueAtTime(280, startTime + duration);

    // Secondary subtle harmonic: Warm subtle resonance at 1120Hz
    const osc2 = ctx.createOscillator();
    const osc2Gain = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1120, startTime);
    osc2Gain.gain.setValueAtTime(0.02, startTime);
    osc2Gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.02);

    // Connections
    osc1.connect(masterGain);
    osc2.connect(osc2Gain);
    osc2Gain.connect(masterGain);
    masterGain.connect(filter);
    filter.connect(ctx.destination);

    // Trigger
    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + 0.02);

    return true;
  } catch {
    // Fail silently without disrupting user interaction
    return false;
  }
}

/**
 * Plays a subtle, gentle ascending success chime (two soft harmonic notes).
 * Automatically respects noise-sensitive environments and mute settings.
 */
export function playPleasantSuccessChime(options?: { volume?: number }): boolean {
  if (isEnvironmentMuted()) return false;

  const ctx = getAudioContext();
  if (!ctx) return false;

  try {
    const startTime = ctx.currentTime;
    const volume = options?.volume ?? 0.055;

    // Note 1: C5 (523.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, startTime);
    gain1.gain.setValueAtTime(0.0001, startTime);
    gain1.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.12);

    // Note 2: E5 (659.25 Hz) slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, startTime + 0.06);
    gain2.gain.setValueAtTime(0.0001, startTime + 0.06);
    gain2.gain.linearRampToValueAtTime(volume * 1.1, startTime + 0.07);
    gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.22);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(startTime);
    osc1.stop(startTime + 0.13);
    osc2.start(startTime + 0.06);
    osc2.stop(startTime + 0.23);

    return true;
  } catch {
    return false;
  }
}

