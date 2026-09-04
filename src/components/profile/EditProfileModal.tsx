import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import {
  X,
  User,
  Camera,
  Upload,
  Link,
  Sparkles,
  Check,
  Trash2,
  Phone,
  Mail,
  Shield,
  Building2,
  AlertCircle
} from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Preset avatars curated for professional MIS & community profiles
const PRESET_AVATARS = [
  { id: 'p1', label: 'Avatar 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: 'p2', label: 'Avatar 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 'p3', label: 'Avatar 3', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { id: 'p4', label: 'Avatar 4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { id: 'p5', label: 'Avatar 5', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
  { id: 'p6', label: 'Avatar 6', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' }
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, divisiList, updateUserProfile } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [avatarTab, setAvatarTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [customUrl, setCustomUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentDivisi = divisiList.find(d => d.id === currentUser.divisi_id);

  const handleFileChange = (file: File) => {
    setErrorMessage('');
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Format file harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Ukuran file maksimal 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      if (result) {
        setAvatar(result);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Gagal membaca file gambar.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (!customUrl.trim()) return;
    setAvatar(customUrl.trim());
    setCustomUrl('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Nama tampilan tidak boleh kosong.');
      return;
    }

    updateUserProfile({
      name: name.trim(),
      avatar: avatar || undefined,
      phone: phone.trim() || undefined
    });

    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      onClose();
    }, 500);
  };

  return createPortal(
    <div
      id="modal-edit-profile-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <div
          id="modal-edit-profile-content"
          className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-left animate-in zoom-in-95 duration-150"
          onClick={e => e.stopPropagation()}
        >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Profil Pengguna</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ubah nama tampilan dan foto profil
              </p>
            </div>
          </div>
          <button
            id="btn-close-edit-profile"
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form id="form-edit-profile" onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {errorMessage && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successToast && (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Profil berhasil diperbarui!</span>
              </div>
            )}

            {/* Avatar Section */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Foto Profil
              </label>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                {/* Live Preview */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-full ring-2 ring-indigo-500/30 overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-sm">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={() => {
                          setAvatar('');
                          setErrorMessage('Gagal memuat foto profil.');
                        }}
                      />
                    ) : (
                      <span>{name.charAt(0).toUpperCase() || 'U'}</span>
                    )}
                  </div>

                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar('')}
                      title="Hapus foto profil"
                      className="absolute -top-1 -right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-xs transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Avatar Source Tabs */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center bg-slate-200/80 dark:bg-slate-750 p-0.5 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setAvatarTab('upload')}
                      className={`flex-1 py-1 px-1.5 rounded-md font-medium transition-all text-center ${
                        avatarTab === 'upload'
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarTab('preset')}
                      className={`flex-1 py-1 px-1.5 rounded-md font-medium transition-all text-center ${
                        avatarTab === 'preset'
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Preset
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarTab('url')}
                      className={`flex-1 py-1 px-1.5 rounded-md font-medium transition-all text-center ${
                        avatarTab === 'url'
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      URL
                    </button>
                  </div>

                  {avatarTab === 'upload' && (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleFileChange(e.target.files[0]);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`w-full py-2 px-3 border border-dashed rounded-lg text-center cursor-pointer transition-colors flex items-center justify-center space-x-1.5 text-xs ${
                          isDragging
                            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600'
                            : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">Pilih / Seret Gambar (Max 2MB)</span>
                      </button>
                    </div>
                  )}

                  {avatarTab === 'preset' && (
                    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                      {PRESET_AVATARS.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setAvatar(p.url)}
                          className={`w-7 h-7 rounded-full overflow-hidden shrink-0 border-2 transition-transform hover:scale-110 ${
                            avatar === p.url
                              ? 'border-indigo-600 ring-1 ring-indigo-500'
                              : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {avatarTab === 'url' && (
                    <div className="flex gap-1.5">
                      <input
                        type="url"
                        placeholder="https://.../foto.jpg"
                        value={customUrl}
                        onChange={e => setCustomUrl(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleApplyUrl}
                        className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
                      >
                        Set
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Display Name Input */}
            <div className="space-y-1">
              <label
                htmlFor="input-profile-name"
                className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
              >
                Nama Tampilan (Display Name) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="input-profile-name"
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Masukkan nama tampilan"
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* WhatsApp / Phone Input */}
            <div className="space-y-1">
              <label
                htmlFor="input-profile-phone"
                className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
              >
                No. WhatsApp / Telepon <span className="text-slate-400 font-normal lowercase">(opsional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="input-profile-phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Account Info Meta */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {currentUser.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Divisi</span>
                </div>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {currentDivisi?.nama_divisi || 'Divisi MIS'} ({currentDivisi?.kode})
                </span>
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex items-center justify-end space-x-2.5 px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/60 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-save-profile"
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>,
  document.body
  );
};
