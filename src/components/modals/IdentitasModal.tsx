import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Identitas } from '../../types';
import {
  X,
  Save,
  User,
  Shield,
  MapPin,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Unlock
} from 'lucide-react';

interface IdentitasModalProps {
  isOpen: boolean;
  onClose: () => void;
  identitas: Identitas | null;
  readOnly?: boolean;
  onDeleteRequested?: (identitas: Identitas) => void;
}

export const IdentitasModal: React.FC<IdentitasModalProps> = ({
  isOpen,
  onClose,
  identitas,
  readOnly = false,
  onDeleteRequested
}) => {
  const { addIdentitas, updateIdentitas, deleteIdentitas } = useApp();

  const [isEditing, setIsEditing] = useState(!readOnly);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmDeleteInline, setConfirmDeleteInline] = useState(false);

  const [formData, setFormData] = useState<Omit<Identitas, 'id' | 'created_at'>>({
    nama_lengkap: '',
    panggilan: '',
    jenis_identitas: 'KTP',
    nomor_identitas: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: 'Laki-laki',
    kewarganegaraan: 'WNI',
    nomor_hp_primary: '',
    email: '',
    pekerjaan: '',
    alamat: '',
    kota: '',
    kode_pos: '',
    agama: 'Buddha',
    status_keamanan: 'Normal',
    jenis_umat: 'Anggota',
    bhante_lay: 'Lay',
    is_agen_purna: 0,
    is_dharma_patriot: 0,
    divisi_id: null,
    created_by: 1
  });

  useEffect(() => {
    setIsEditing(!readOnly);
    setErrorMessage('');
    setSuccessMessage('');
    setConfirmDeleteInline(false);

    if (identitas) {
      setFormData({
        nama_lengkap: identitas.nama_lengkap,
        panggilan: identitas.panggilan || '',
        jenis_identitas: identitas.jenis_identitas,
        nomor_identitas: identitas.nomor_identitas,
        tempat_lahir: identitas.tempat_lahir || '',
        tanggal_lahir: identitas.tanggal_lahir || '',
        jenis_kelamin: identitas.jenis_kelamin || 'Laki-laki',
        kewarganegaraan: identitas.kewarganegaraan || 'WNI',
        nomor_hp_primary: identitas.nomor_hp_primary || '',
        email: identitas.email || '',
        pekerjaan: identitas.pekerjaan || '',
        alamat: identitas.alamat || '',
        kota: identitas.kota || '',
        kode_pos: identitas.kode_pos || '',
        agama: identitas.agama || 'Buddha',
        status_keamanan: identitas.status_keamanan,
        jenis_umat: identitas.jenis_umat || 'Anggota',
        bhante_lay: identitas.bhante_lay || 'Lay',
        is_agen_purna: identitas.is_agen_purna ? 1 : 0,
        is_dharma_patriot: identitas.is_dharma_patriot ? 1 : 0,
        divisi_id: identitas.divisi_id || null,
        created_by: identitas.created_by || 1
      });
    } else {
      setFormData({
        nama_lengkap: '',
        panggilan: '',
        jenis_identitas: 'KTP',
        nomor_identitas: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        jenis_kelamin: 'Laki-laki',
        kewarganegaraan: 'WNI',
        nomor_hp_primary: '',
        email: '',
        pekerjaan: '',
        alamat: '',
        kota: '',
        kode_pos: '',
        agama: 'Buddha',
        status_keamanan: 'Normal',
        jenis_umat: 'Anggota',
        bhante_lay: 'Lay',
        is_agen_purna: 0,
        is_dharma_patriot: 0,
        divisi_id: null,
        created_by: 1
      });
    }
  }, [identitas, isOpen, readOnly]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!formData.nama_lengkap.trim()) {
      setErrorMessage('Nama Lengkap wajib diisi!');
      return;
    }
    if (!formData.nomor_identitas.trim()) {
      setErrorMessage('Nomor Identitas (NIK/No. Paspor) wajib diisi!');
      return;
    }

    if (identitas) {
      updateIdentitas(identitas.id, formData);
      setSuccessMessage('Data profil anggota berhasil diperbarui!');
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      addIdentitas(formData);
      setSuccessMessage('Anggota baru berhasil ditambahkan!');
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  const handleDeleteSelf = () => {
    if (!identitas) return;
    if (onDeleteRequested) {
      onClose();
      onDeleteRequested(identitas);
    } else {
      deleteIdentitas(identitas.id);
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <div
          className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden text-left animate-in zoom-in-95 duration-150"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <span>
                    {!isEditing
                      ? 'Detail Profil Anggota'
                      : identitas
                      ? 'Edit Data Anggota / Umat'
                      : 'Tambah Anggota / Umat Baru'}
                  </span>
                  {!isEditing && (
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md text-[10px] flex items-center gap-1 font-normal">
                      <Lock className="w-3 h-3" /> Mode Baca
                    </span>
                  )}
                  {isEditing && identitas && (
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-md text-[10px] flex items-center gap-1 font-normal">
                      <Unlock className="w-3 h-3" /> Mode Edit
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-400">Database identitas terpusat Lamrimnesia</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {identitas && !isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Data</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="mx-6 mt-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mx-6 mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {confirmDeleteInline && (
            <div className="mx-6 mt-4 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl text-xs space-y-3">
              <div className="flex items-start space-x-2.5 text-rose-800 dark:text-rose-300">
                <Trash2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Konfirmasi Hapus Data Anggota</p>
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                    Yakin ingin menghapus <strong>{identitas?.nama_lengkap}</strong> dari master database anggota? Data yang dihapus tidak dapat dikembalikan.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteInline(false)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSelf}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Ya, Hapus Sekarang
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Section 1: Identitas Dasar */}
            <div>
              <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <User className="w-4 h-4" /> Data Personal & KTP
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                <div className="md:col-span-2">
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Nama Lengkap Sesuai KTP *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={formData.nama_lengkap}
                    onChange={e => setFormData({ ...formData, nama_lengkap: e.target.value })}
                    placeholder="Contoh: BUDI DHARMAWAN"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg uppercase focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Nama Panggilan
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.panggilan}
                    onChange={e => setFormData({ ...formData, panggilan: e.target.value })}
                    placeholder="Budi"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Jenis Identitas
                  </label>
                  <select
                    disabled={!isEditing}
                    value={formData.jenis_identitas}
                    onChange={e => setFormData({ ...formData, jenis_identitas: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <option value="KTP">KTP</option>
                    <option value="SIM">SIM</option>
                    <option value="Paspor">Paspor</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Nomor Identitas (NIK / No. Paspor) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={formData.nomor_identitas}
                    onChange={e => setFormData({ ...formData, nomor_identitas: e.target.value })}
                    placeholder="317101..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.tempat_lahir}
                    onChange={e => setFormData({ ...formData, tempat_lahir: e.target.value })}
                    placeholder="Jakarta"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    disabled={!isEditing}
                    value={formData.tanggal_lahir}
                    onChange={e => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    disabled={!isEditing}
                    value={formData.jenis_kelamin}
                    onChange={e => setFormData({ ...formData, jenis_kelamin: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Kontak & Alamat */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> Kontak & Alamat
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.nomor_hp_primary}
                    onChange={e => setFormData({ ...formData, nomor_hp_primary: e.target.value })}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    disabled={!isEditing}
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@email.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Alamat Lengkap
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.alamat}
                    onChange={e => setFormData({ ...formData, alamat: e.target.value })}
                    placeholder="Jl. Nama Jalan No. XX, RT/RW, Kelurahan"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Kota / Kabupaten
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.kota}
                    onChange={e => setFormData({ ...formData, kota: e.target.value })}
                    placeholder="Jakarta Barat"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Status Dharma & Keorganisasian */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Kategori & Status Dharma
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Jenis Umat / Kategori
                  </label>
                  <select
                    disabled={!isEditing}
                    value={formData.jenis_umat}
                    onChange={e => setFormData({ ...formData, jenis_umat: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <option value="Anggota">Anggota Biasa</option>
                    <option value="Simpatisan">Simpatisan</option>
                    <option value="Pengurus">Pengurus / Staff</option>
                    <option value="Sangha">Sangha / Rohaniwan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Status Rohaniwan (Bhante/Lay)
                  </label>
                  <select
                    disabled={!isEditing}
                    value={formData.bhante_lay || 'Lay'}
                    onChange={e => setFormData({ ...formData, bhante_lay: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <option value="Lay">Lay (Umat Awam)</option>
                    <option value="Bhante">Bhante / Bhikkhu</option>
                    <option value="Ayya">Ayya / Samaneri</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Status Keamanan / Verifikasi
                  </label>
                  <select
                    disabled={!isEditing}
                    value={formData.status_keamanan}
                    onChange={e => setFormData({ ...formData, status_keamanan: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <option value="Normal">Normal</option>
                    <option value="VIP">VIP</option>
                    <option value="Pengawasan">Dalam Pengawasan</option>
                  </select>
                </div>

                <div className="md:col-span-3 flex items-center space-x-6 pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!isEditing}
                      checked={Boolean(formData.is_agen_purna)}
                      onChange={e => setFormData({ ...formData, is_agen_purna: e.target.checked ? 1 : 0 })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      Agen Buku Dharma Purna
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!isEditing}
                      checked={Boolean(formData.is_dharma_patriot)}
                      onChange={e => setFormData({ ...formData, is_dharma_patriot: e.target.checked ? 1 : 0 })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      Dharma Patriot / Donatur Rutin
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div>
                {identitas && (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteInline(true)}
                    className="flex items-center space-x-1.5 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Anggota</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  {isEditing && identitas ? 'Batal Edit' : 'Tutup'}
                </button>

                {!isEditing && identitas && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm cursor-pointer transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Profil Anggota</span>
                  </button>
                )}

                {isEditing && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm cursor-pointer transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{identitas ? 'Simpan Perubahan' : 'Simpan Anggota Baru'}</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
