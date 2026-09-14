import { useState, useEffect, useRef, useCallback } from 'react';

// Web Speech API interfaces for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => ISpeechRecognition;
    webkitSpeechRecognition?: new () => ISpeechRecognition;
  }
}

export interface UseWebSpeechOptions {
  onFinalResult?: (transcript: string) => void;
  defaultLang?: string;
}

export function useWebSpeech(options: UseWebSpeechOptions = {}) {
  const { onFinalResult, defaultLang = 'id-ID' } = options;

  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState(defaultLang);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const finalTranscriptAccumulatorRef = useRef('');

  const isRecognitionSupported = typeof window !== 'undefined' && 
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const isTtsSupported = typeof window !== 'undefined' && 
    Boolean('speechSynthesis' in window);

  // Initialize SpeechRecognition instance
  useEffect(() => {
    if (!isRecognitionSupported) return;

    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionConstructor) return;

    try {
      const recognition = new SpeechRecognitionConstructor();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
        setInterimTranscript('');
        finalTranscriptAccumulatorRef.current = '';
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            currentFinal += res[0].transcript;
          } else {
            currentInterim += res[0].transcript;
          }
        }

        if (currentFinal) {
          finalTranscriptAccumulatorRef.current = (
            finalTranscriptAccumulatorRef.current + ' ' + currentFinal
          ).trim();
        }

        setInterimTranscript(currentInterim || finalTranscriptAccumulatorRef.current);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        if (event.error === 'no-speech') {
          setSpeechError('Tidak ada suara terdeteksi. Silakan coba lagi.');
        } else if (event.error === 'not-allowed') {
          setSpeechError('Akses mikrofon ditolak. Mohon aktifkan izin mikrofon di browser.');
        } else if (event.error === 'network') {
          setSpeechError('Koneksi suara terganggu atau offline.');
        } else if (event.error !== 'aborted') {
          setSpeechError(`Kendala mikrofon: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        const result = finalTranscriptAccumulatorRef.current.trim();
        if (result && onFinalResult) {
          onFinalResult(result);
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('SpeechRecognition initialization failed:', e);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup abort
        }
      }
    };
  }, [isRecognitionSupported, selectedLang, onFinalResult]);

  // Start listening
  const startListening = useCallback((customLang?: string) => {
    if (!isRecognitionSupported) {
      setSpeechError('Browser Anda belum mendukung Web Speech API.');
      return;
    }

    // Cancel any active TTS playback
    if (isTtsSupported && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingIndex(null);
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = customLang || selectedLang;
        recognitionRef.current.start();
      } catch (err) {
        // If already started, stop then restart
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            recognitionRef.current?.start();
          }, 150);
        } catch (e) {
          console.warn('Error starting speech recognition:', e);
        }
      }
    }
  }, [isRecognitionSupported, isTtsSupported, selectedLang]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Text-To-Speech (TTS) Speak Assistant Response
  const speak = useCallback((text: string, index?: number, lang?: string) => {
    if (!isTtsSupported || !window.speechSynthesis) return;

    // If currently speaking this index, stop it
    if (isSpeaking && speakingIndex === index) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingIndex(null);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Clean text: strip markdown syntax, links, bold markers, bullet points
    const cleanText = text
      .replace(/[*_~`#]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/•/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang || selectedLang;
    utterance.rate = 1.05; // natural talking pace
    utterance.pitch = 1.0;

    // Find Indonesian voice if possible
    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice = voices.find(v => 
      v.lang.toLowerCase().includes('id-id') || 
      v.lang.toLowerCase().includes('id') ||
      v.name.toLowerCase().includes('indonesia')
    );
    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (index !== undefined) {
        setSpeakingIndex(index);
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingIndex(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  }, [isTtsSupported, isSpeaking, speakingIndex, selectedLang]);

  // Stop TTS
  const stopSpeaking = useCallback(() => {
    if (isTtsSupported && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingIndex(null);
  }, [isTtsSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isTtsSupported && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [isTtsSupported]);

  return {
    isRecognitionSupported,
    isTtsSupported,
    isListening,
    interimTranscript,
    speechError,
    setSpeechError,
    selectedLang,
    setSelectedLang,
    startListening,
    stopListening,
    toggleListening,
    isSpeaking,
    speakingIndex,
    speak,
    stopSpeaking
  };
}
