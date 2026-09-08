import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DivisionId } from '../../types';
import {
  LogIn,
  UserPlus,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  Building2,
  Wallet,
  BookOpen,
  ShoppingBag,
  Factory,
  Truck,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  initialMode?: 'login' | 'register';
  isForcedScreen?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  isForcedScreen = false
}) => {
  const {
    login,
    register,
    usersList,
    divisiList,
    quickLoginAs,
    authModalMode,
    setAuthModalMode
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode || authModalMode || 'login');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regDivisiId, setRegDivisiId] = useState<DivisionId>(1);
  const [regRole, setRegRole] = useState('Staff');
  const [createIdentitas, setCreateIdentitas] = useState(true);

  // Alerts & Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const getDivisionIcon = (id: DivisionId) => {
    switch (id) {
      case 1: return <Building2 className="w-4 h-4 text-amber-400" />;
      case 2: return <Wallet className="w-4 h-4 text-emerald-400" />;
      case 3: return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 4: return <ShoppingBag className="w-4 h-4 text-purple-400" />;
      case 5: return <Factory className="w-4 h-4 text-orange-400" />;
      case 6: return <Truck className="w-4 h-4 text-cyan-400" />;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginEmail.trim()) {
      setErrorMsg('Silakan masukkan alamat email Anda.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(loginEmail, loginPassword);
      setLoading(false);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          if (onClose) onClose();
        }, 600);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg('Gagal memverifikasi password di server.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg('Mohon lengkapi Nama, Email, dan Password.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password minimal harus 6 karakter.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        divisi_id: regDivisiId,
        role: regRole,
        phone: regPhone,
        createIdentitas
      });
      setLoading(false);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          if (onClose) onClose();
        }, 800);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg('Gagal memproses pendaftaran akun dengan server.');
    }
  };

  const handleQuickLogin = (userId: number) => {
    setErrorMsg('');
    setSuccessMsg('');
    quickLoginAs(userId);
    const target = usersList.find(u => u.id === userId);
    setSuccessMsg(`Berhasil login sebagai ${target?.name}`);
    setTimeout(() => {
      if (onClose) onClose();
    }, 500);
  };

  return (
    <div
      id="auth-overlay"
      className={`${
        isForcedScreen
          ? 'min-h-screen w-full flex items-center justify-center p-4 bg-slate-950/95'
          : 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in'
      }`}
    >
      <div
        id="auth-container-card"
        className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative text-slate-100 max-h-[92vh] flex flex-col"
      >
        {/* Top Header Background Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 border-b border-slate-800 relative">
          {!isForcedScreen && onClose && (
            <button
              id="btn-close-auth-modal"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-full transition-colors"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center space-x-3 mb-2">
            <img
              src="/img/logo-lamrimnesia.png"
              alt="Logo Lamrimnesia"
              className="h-11 w-auto object-contain rounded-lg shadow-md"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">SAPA-ALL MIS</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  Ekosistem Dharma
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Sistem Informasi Manajemen Terpadu Penerbitan & Operasional
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              id="tab-login-mode"
              type="button"
              onClick={() => {
                setMode('login');
                setAuthModalMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk (Login)</span>
            </button>

            <button
              id="tab-register-mode"
              type="button"
              onClick={() => {
                setMode('register');
                setAuthModalMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>
        </div>

        {/* Form Body with Scroll */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Alerts */}
          {errorMsg && (
            <div className="flex items-start space-x-2 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start space-x-2 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================= LOGIN FORM ================= */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Alamat Email</span>
                  <span className="text-[11px] text-slate-500">contoh: admin@lamrimnesia.org</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="input-login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@lamrimnesia.org"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Kata Sandi (Password)</span>
                  <span className="text-[11px] text-slate-500">Default: password123</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="input-login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Ingat sesi saya</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('admin@lamrimnesia.org');
                    setLoginPassword('password123');
                  }}
                  className="text-indigo-400 hover:underline text-[11px]"
                >
                  Isi Akun Admin Otomatis
                </button>
              </div>

              <button
                id="btn-submit-login"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Masuk ke Dashboard SAPA-ALL</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center space-x-1.5 py-1 text-[11px] text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Enkripsi Server-Side Bcrypt Terverifikasi (Cost: 10)</span>
              </div>

              {/* QUICK 1-CLICK DEMO LOGIN ACCOUNTS */}
              <div className="pt-4 border-t border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    ⚡ Akses Instan Per Divisi (1-Click Login)
                  </span>
                  <span className="text-[10px] text-slate-500">Pilih role untuk langsung mencoba</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {usersList.slice(0, 6).map((usr) => (
                    <button
                      key={usr.id}
                      type="button"
                      onClick={() => handleQuickLogin(usr.id)}
                      className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-left transition-all group flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        {getDivisionIcon(usr.divisi_id)}
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 group-hover:text-indigo-300 font-mono">
                          {divisiList.find(d => d.id === usr.divisi_id)?.kode}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                          {usr.name.split(' ')[0]}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">{usr.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* ================= REGISTER FORM ================= */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Nama Lengkap</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="input-reg-name"
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Anandha Widjaya"
                      required
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Email Akun</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="input-reg-email"
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="anandha@lamrimnesia.org"
                      required
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">No. WhatsApp / HP</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="input-reg-phone"
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Jabatan / Role</label>
                  <input
                    id="input-reg-role"
                    type="text"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    placeholder="e.g. Koordinator Distribusi"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Division Selector Grid */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Pilih Divisi Penugasan</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {divisiList.map((div) => {
                    const isSelected = regDivisiId === div.id;
                    return (
                      <button
                        key={div.id}
                        type="button"
                        onClick={() => setRegDivisiId(div.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-teal-950/70 border-teal-500 text-teal-200 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 mb-1">
                          {getDivisionIcon(div.id)}
                          <span className="text-xs font-bold text-slate-200">{div.kode}</span>
                        </div>
                        <p className="text-[10px] truncate">{div.nama_divisi}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Kata Sandi</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="input-reg-password"
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 6 karakter"
                      required
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-9 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Konfirmasi Kata Sandi</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="input-reg-confirm-password"
                      type={showRegPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi"
                      required
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Checkbox Create Identitas */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createIdentitas}
                    onChange={(e) => setCreateIdentitas(e.target.checked)}
                    className="mt-0.5 rounded bg-slate-900 border-slate-700 text-teal-600 focus:ring-0 w-3.5 h-3.5"
                  />
                  <div>
                    <span className="font-semibold text-slate-200">Tautkan ke Buku Induk Identitas Anggota</span>
                    <p className="text-[11px] text-slate-400">
                      Otomatis mencatat identitas profil Anda pada modul Database Anggota Direktorat.
                    </p>
                  </div>
                </label>
              </div>

              <button
                id="btn-submit-register"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-teal-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Daftar & Masuk ke Sistem</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center space-x-1.5 py-1 text-[11px] text-teal-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Password akan dienkripsi server-side dengan Bcrypt (Salt Rounds 10)</span>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-950/90 py-3 px-6 border-t border-slate-800/80 text-center text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hak Akses Terotentikasi MIS</span>
          </span>
          <button
            type="button"
            onClick={() => {
              const newMode = mode === 'login' ? 'register' : 'login';
              setMode(newMode);
              setAuthModalMode(newMode);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <span>{mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
