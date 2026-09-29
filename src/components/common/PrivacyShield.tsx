import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface PrivacyShieldProps {
  children?: React.ReactNode;
  value?: string | number;
  type?: 'amount' | 'phone' | 'account' | 'name' | 'general';
  maskedText?: string;
  allowPeek?: boolean;
  className?: string;
}

export const PrivacyShield: React.FC<PrivacyShieldProps> = ({
  children,
  value,
  type = 'general',
  maskedText,
  allowPeek = true,
  className = ''
}) => {
  const { isPrivacyMode } = useApp();
  const [isPeeking, setIsPeeking] = useState(false);

  if (!isPrivacyMode) {
    return <span className={className}>{children !== undefined ? children : value}</span>;
  }

  // If user is peeking on direct hover / long press
  if (isPeeking && allowPeek) {
    return (
      <span
        onMouseLeave={() => setIsPeeking(false)}
        className={`inline-flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-1 py-0.5 rounded border border-dashed border-amber-500/40 cursor-pointer ${className}`}
        title="Privasi diintip sementara (Lepas kursor untuk sensor kembali)"
      >
        <span>{children !== undefined ? children : value}</span>
        <EyeOff className="w-3 h-3 opacity-60 shrink-0" />
      </span>
    );
  }

  const defaultMask =
    type === 'amount'
      ? 'Rp ••••••••'
      : type === 'phone'
      ? '+62 ••••••••••'
      : type === 'account'
      ? 'Rek. •••••••••••'
      : '••••••••••';

  return (
    <span
      onMouseEnter={() => {
        if (allowPeek) setIsPeeking(true);
      }}
      className={`inline-flex items-center gap-1 font-mono tracking-wider select-none bg-slate-200/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded cursor-help border border-slate-300/40 dark:border-slate-700/40 transition-all ${className}`}
      title="🔒 Data disensor demi privasi Rapat Pleno (Arahkan kursor untuk intip sejenak)"
    >
      <span>{maskedText || defaultMask}</span>
      <ShieldCheck className="w-2.5 h-2.5 text-indigo-400 dark:text-indigo-500 shrink-0 opacity-70" />
    </span>
  );
};
