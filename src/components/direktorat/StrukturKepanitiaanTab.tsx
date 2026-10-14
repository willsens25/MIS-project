import React, { useState, useMemo } from 'react';
import {
  Users,
  Shield,
  Award,
  Crown,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Building2,
  Briefcase,
  CheckCircle2,
  Sparkles,
  Download,
  Share2,
  ArrowRight,
  ExternalLink,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  HeartHandshake
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DivisionId, Identitas, User } from '../../types';

export interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  divisionId?: DivisionId;
  divisionName?: string;
  category: 'pembina' | 'bph' | 'divisi' | 'event';
  level: 1 | 2 | 3 | 4; // 1: Dewan Pembina/Pengawas, 2: BPH (Ketua/Sekr/Bend), 3: Koordinator Divisi, 4: Anggota/Staf
  reportsToId?: string; // ID of the supervisor in chart
  email?: string;
  phone?: string;
  period?: string;
  status: 'Aktif' | 'Penasihat' | 'Purna';
  avatarInitials: string;
  avatarBg: string;
  bio?: string;
  responsibilities?: string[];
}

export const INITIAL_COMMITTEE_MEMBERS: CommitteeMember[] = [
  // Level 1: Dewan Pembina & Pengawas Spiritual
  {
    id: 'org-1',
    name: 'Bhiksuka Dagpo Rinpoche & Guru Spiritual',
    role: 'Dewan Pembina Spiritual Yayasan',
    category: 'pembina',
    level: 1,
    email: 'spiritual.advisor@lamrimnesia.org',
    period: 'Seumur Hidup',
    status: 'Aktif',
    avatarInitials: 'DR',
    avatarBg: 'from-amber-600 to-amber-800',
    bio: 'Pemberi restu spiritual, silsilah transmisi ajaran Lamrim, dan arahan etika dharma penerbitan.',
    responsibilities: [
      'Pemberian restu naskah Dharma kanonik',
      'Penetapan visi & misi yayasan',
      'Penjagaan kemurnian silsilah ajaran'
    ]
  },
  {
    id: 'org-2',
    name: 'Dewan Pengawas & Penasihat Hukum Yayasan',
    role: 'Dewan Pengawas & Etika Yayasan',
    category: 'pembina',
    level: 1,
    email: 'pengawas@lamrimnesia.org',
    period: '2024 - 2029',
    status: 'Penasihat',
    avatarInitials: 'DP',
    avatarBg: 'from-slate-700 to-slate-900',
    bio: 'Mengawasi akuntabilitas hukum organisasi, kepatuhan audit PSAK 45/ISAK 35, dan AD/ART.',
    responsibilities: [
      'Audit tata kelola & transparansi dana donasi',
      'Kepatuhan regulasi nirlaba & perpajakan',
      'Verifikasi laporan tahunan kepada dewan pembina'
    ]
  },

  // Level 2: Badan Pengurus Harian (BPH / Eksekutif)
  {
    id: 'org-3',
    name: 'Budi Santoso (Ketua Umum)',
    role: 'Ketua Umum Yayasan & Direktur Eksekutif',
    divisionId: 1,
    divisionName: 'Direktorat & SDM',
    category: 'bph',
    level: 2,
    reportsToId: 'org-1',
    email: 'budi.santoso@lamrimnesia.org',
    phone: '081234567890',
    period: '2024 - 2029',
    status: 'Aktif',
    avatarInitials: 'BS',
    avatarBg: 'from-indigo-600 to-indigo-800',
    bio: 'Memimpin koordinasi strategis 6 divisi operasional MIS, relasi eksternal sangha, dan legalitas penerbitan.',
    responsibilities: [
      'Otorisasi SPK cetak & alokasi anggaran belanja',
      'Kepemimpinan rapat koordinasi triwulan',
      'Pengembangan kemitraan vihara & komunitas'
    ]
  },
  {
    id: 'org-4',
    name: 'Ratna Dewi (Sekretaris Umum)',
    role: 'Sekretaris Umum & Tata Usaha',
    divisionId: 1,
    divisionName: 'Direktorat & SDM',
    category: 'bph',
    level: 2,
    reportsToId: 'org-3',
    email: 'ratna.dewi@lamrimnesia.org',
    phone: '081234567891',
    period: '2024 - 2029',
    status: 'Aktif',
    avatarInitials: 'RD',
    avatarBg: 'from-teal-600 to-teal-800',
    bio: 'Menangani korespondensi resmi, legalitas hak cipta naskah, notulensi rapat pleno, dan database umat.',
    responsibilities: [
      'Penyusunan SK kepanitiaan dan surat mandat',
      'Pengarsipan kontrak lisensi penerbitan',
      'Administrasi keanggotaan & kartu Dharma Patriot'
    ]
  },
  {
    id: 'org-5',
    name: 'Hendrik Pratama (Bendahara Umum)',
    role: 'Bendahara Umum & Kepala Finansial',
    divisionId: 2,
    divisionName: 'Bendahara & Finance',
    category: 'bph',
    level: 2,
    reportsToId: 'org-3',
    email: 'hendrik.pratama@lamrimnesia.org',
    phone: '081234567892',
    period: '2024 - 2029',
    status: 'Aktif',
    avatarInitials: 'HP',
    avatarBg: 'from-emerald-600 to-emerald-800',
    bio: 'Mengelola rekening bank yayasan, rekonsiliasi ISAK 35, pencairan dana SPK cetak, dan audit kas harian.',
    responsibilities: [
      'Penyusunan anggaran tahunan yayasan (RAPB)',
      'Verifikasi bukti mutasi & invoice masuk/keluar',
      'Laporan keuangan bulanan untuk dewan pembina'
    ]
  },

  // Level 3: Koordinator & Kepala Divisi Operasional (6 Divisi MIS)
  {
    id: 'org-6',
    name: 'Dewi Lestari',
    role: 'Koordinator Divisi Penerbitan & Redaksi',
    divisionId: 3,
    divisionName: 'Penerbitan',
    category: 'divisi',
    level: 3,
    reportsToId: 'org-3',
    email: 'dewi.lestari@lamrimnesia.org',
    phone: '081234567893',
    period: '2024 - 2026',
    status: 'Aktif',
    avatarInitials: 'DL',
    avatarBg: 'from-violet-600 to-violet-800',
    bio: 'Kurasi naskah sutra & komentar Lamrim, pengurusan ISBN Perpusnas, kalkulasi royalti penulis, dan proyek Fashili.',
    responsibilities: [
      'Alur terjemahan, proofreading & layout buku',
      'Pengajuan ISBN & KDT ke Perpusnas',
      'Koordinasi dana donasi proyek cetak buku'
    ]
  },
  {
    id: 'org-7',
    name: 'Agus Wijaya',
    role: 'Koordinator Divisi Marketing & Distribusi',
    divisionId: 4,
    divisionName: 'Marketing & Distribution',
    category: 'divisi',
    level: 3,
    reportsToId: 'org-3',
    email: 'agus.wijaya@lamrimnesia.org',
    phone: '081234567894',
    period: '2024 - 2026',
    status: 'Aktif',
    avatarInitials: 'AW',
    avatarBg: 'from-blue-600 to-blue-800',
    bio: 'Pengelolaan kanal penjualan POS, pesanan pre-order, pameran buku/bazar waisak, dan jaringan agen resmi.',
    responsibilities: [
      'Penerbitan faktur/invoice dan kode promo',
      'Penyelenggaraan stan bazar & pameran buku',
      'Pengembangan mitra toko buku vihara'
    ]
  },
  {
    id: 'org-8',
    name: 'Joko Susanto',
    role: 'Koordinator Divisi Produksi & Percetakan',
    divisionId: 5,
    divisionName: 'Produksi',
    category: 'divisi',
    level: 3,
    reportsToId: 'org-3',
    email: 'joko.susanto@lamrimnesia.org',
    phone: '081234567895',
    period: '2024 - 2026',
    status: 'Aktif',
    avatarInitials: 'JS',
    avatarBg: 'from-orange-600 to-orange-800',
    bio: 'Eksekusi SPK cetak, kontrol kualitas oplah kertas & jilid hard/soft cover, pencatatan log pabrikasi harian.',
    responsibilities: [
      'Pengawasan jadwal mesin cetak offset',
      'Quality control warna & ketebalan kertas',
      'Pencatatan log realisasi eksemplar fisik'
    ]
  },
  {
    id: 'org-9',
    name: 'Siti Rahma',
    role: 'Koordinator Divisi Logistik & Pergudangan',
    divisionId: 6,
    divisionName: 'Logistik & Gudang',
    category: 'divisi',
    level: 3,
    reportsToId: 'org-3',
    email: 'siti.rahma@lamrimnesia.org',
    phone: '081234567896',
    period: '2024 - 2026',
    status: 'Aktif',
    avatarInitials: 'SR',
    avatarBg: 'from-cyan-600 to-cyan-800',
    bio: 'Penyimpanan buku gudang utama, antrean packing surat jalan, integrasi nomor resi kurir, dan stock opname fisik.',
    responsibilities: [
      'Penerbitan surat jalan & nomor resi paket',
      'Monitoring batas stok aman (<25 eks)',
      'Audit keluar-masuk buku inventaris'
    ]
  },

  // Level 4: Kepanitiaan Ad-Hoc & Event Khusus (Misal: Panitia Waisak & Bedah Buku)
  {
    id: 'org-10',
    name: 'Anand Kumar (Ketua Panitia)',
    role: 'Ketua Panitia Khusus Bazar & Pameran Akbar Dharma',
    category: 'event',
    level: 4,
    reportsToId: 'org-7',
    email: 'anand.panitia@lamrimnesia.org',
    phone: '081388776655',
    period: 'Event Waisak 2026',
    status: 'Aktif',
    avatarInitials: 'AK',
    avatarBg: 'from-amber-500 to-rose-600',
    bio: 'Memimpin kepanitiaan temporer stan buku Lamrimnesia di perayaan Waisak Nasional dan expo literatur Buddhis.',
    responsibilities: [
      'Penyiapan paket bundling & display buku',
      'Penugasan relawan kasir POS lapangan',
      'Rekonsiliasi omset harian pameran'
    ]
  },
  {
    id: 'org-11',
    name: 'Maya Indrawati (Sekretaris Panitia)',
    role: 'Sekretaris Panitia Khusus Event Bazar',
    category: 'event',
    level: 4,
    reportsToId: 'org-10',
    email: 'maya.panitia@lamrimnesia.org',
    phone: '081399887766',
    period: 'Event Waisak 2026',
    status: 'Aktif',
    avatarInitials: 'MI',
    avatarBg: 'from-purple-500 to-pink-600',
    bio: 'Menangani registrasi relawan, perizinan tempat pameran, serta konsumsi dan perlengkapan stan.',
    responsibilities: [
      'Manajemen relawan pameran',
      'Pencatatan data pengunjung & donatur baru'
    ]
  }
];

export const StrukturKepanitiaanTab: React.FC = () => {
  const { divisiList, identitasList, usersList, showToast } = useApp();

  const [members, setMembers] = useState<CommitteeMember[]>(() => {
    try {
      const saved = localStorage.getItem('mis_committee_members');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_COMMITTEE_MEMBERS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'pembina' | 'bph' | 'divisi' | 'event'>('all');
  const [selectedMember, setSelectedMember] = useState<CommitteeMember | null>(INITIAL_COMMITTEE_MEMBERS[2]); // Default to Ketua Umum
  const [activeViewMode, setActiveViewMode] = useState<'chart' | 'grid' | 'table'>('chart');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Modal State for Add / Edit Member
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formCategory, setFormCategory] = useState<'pembina' | 'bph' | 'divisi' | 'event'>('divisi');
  const [formLevel, setFormLevel] = useState<1 | 2 | 3 | 4>(3);
  const [formDivisionId, setFormDivisionId] = useState<number>(1);
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPeriod, setFormPeriod] = useState('2024 - 2029');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Penasihat' | 'Purna'>('Aktif');
  const [formBio, setFormBio] = useState('');
  const [formResponsibilities, setFormResponsibilities] = useState('');

  const saveToLocalStorage = (updated: CommitteeMember[]) => {
    setMembers(updated);
    try {
      localStorage.setItem('mis_committee_members', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.divisionName && m.divisionName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || m.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [members, searchQuery, filterCategory]);

  // Group members for the organizational chart hierarchy
  const dewanPembina = useMemo(() => members.filter(m => m.level === 1), [members]);
  const bphMembers = useMemo(() => members.filter(m => m.level === 2), [members]);
  const divisiHeads = useMemo(() => members.filter(m => m.level === 3), [members]);
  const adhocEvents = useMemo(() => members.filter(m => m.level === 4), [members]);

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormName('');
    setFormRole('');
    setFormCategory('divisi');
    setFormLevel(3);
    setFormDivisionId(1);
    setFormEmail('');
    setFormPhone('');
    setFormPeriod('2024 - 2029');
    setFormStatus('Aktif');
    setFormBio('');
    setFormResponsibilities('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: CommitteeMember) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormRole(member.role);
    setFormCategory(member.category);
    setFormLevel(member.level);
    setFormDivisionId(member.divisionId || 1);
    setFormEmail(member.email || '');
    setFormPhone(member.phone || '');
    setFormPeriod(member.period || '2024 - 2029');
    setFormStatus(member.status);
    setFormBio(member.bio || '');
    setFormResponsibilities((member.responsibilities || []).join('\n'));
    setIsModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formRole.trim()) return;

    const divObj = divisiList.find(d => d.id === formDivisionId);
    const initials = formName
      .trim()
      .split(' ')
      .slice(0, 2)
      .map(n => n[0].toUpperCase())
      .join('');

    const colors = [
      'from-indigo-600 to-indigo-800',
      'from-teal-600 to-teal-800',
      'from-emerald-600 to-emerald-800',
      'from-violet-600 to-violet-800',
      'from-amber-600 to-amber-800',
      'from-rose-600 to-rose-800'
    ];
    const avatarBg = colors[Math.floor(Math.random() * colors.length)];

    const respArray = formResponsibilities
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean);

    if (editingMember) {
      const updated = members.map(m =>
        m.id === editingMember.id
          ? {
              ...m,
              name: formName.trim(),
              role: formRole.trim(),
              category: formCategory,
              level: formLevel,
              divisionId: (formCategory === 'divisi' ? formDivisionId : undefined) as DivisionId | undefined,
              divisionName: formCategory === 'divisi' ? divObj?.nama_divisi : undefined,
              email: formEmail.trim() || undefined,
              phone: formPhone.trim() || undefined,
              period: formPeriod.trim() || '2024 - 2029',
              status: formStatus,
              bio: formBio.trim() || undefined,
              responsibilities: respArray.length > 0 ? respArray : undefined,
              avatarInitials: initials || m.avatarInitials
            }
          : m
      );
      saveToLocalStorage(updated);
      showToast({
        title: '✅ Pengurus Diperbarui',
        message: `Data pengurus "${formName}" berhasil disimpan.`,
        type: 'success',
        category: 'system'
      });
      if (selectedMember?.id === editingMember.id) {
        setSelectedMember(updated.find(m => m.id === editingMember.id) || null);
      }
    } else {
      const newMember: CommitteeMember = {
        id: `org-${Date.now()}`,
        name: formName.trim(),
        role: formRole.trim(),
        category: formCategory,
        level: formLevel,
        divisionId: (formCategory === 'divisi' ? formDivisionId : undefined) as DivisionId | undefined,
        divisionName: formCategory === 'divisi' ? divObj?.nama_divisi : undefined,
        email: formEmail.trim() || undefined,
        phone: formPhone.trim() || undefined,
        period: formPeriod.trim() || '2024 - 2029',
        status: formStatus,
        avatarInitials: initials || 'NN',
        avatarBg,
        bio: formBio.trim() || undefined,
        responsibilities: respArray.length > 0 ? respArray : undefined
      };
      const updated = [...members, newMember];
      saveToLocalStorage(updated);
      setSelectedMember(newMember);
      showToast({
        title: '✅ Pengurus Ditambahkan',
        message: `Pengurus baru "${formName}" berhasil ditambahkan ke bagan struktur.`,
        type: 'success',
        category: 'system'
      });
    }

    setIsModalOpen(false);
  };

  const handleDeleteMember = (member: CommitteeMember) => {
    if (confirm(`Apakah Anda yakin ingin menghapus "${member.name}" dari struktur kepanitiaan?`)) {
      const updated = members.filter(m => m.id !== member.id);
      saveToLocalStorage(updated);
      if (selectedMember?.id === member.id) {
        setSelectedMember(updated[0] || null);
      }
      showToast({
        title: '🗑️ Pengurus Dihapus',
        message: `"${member.name}" telah dihapus dari struktur organisasi.`,
        type: 'info',
        category: 'system'
      });
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Kembalikan struktur kepanitiaan ke data bawaan yayasan?')) {
      saveToLocalStorage(INITIAL_COMMITTEE_MEMBERS);
      setSelectedMember(INITIAL_COMMITTEE_MEMBERS[2]);
      showToast({
        title: '🔄 Reset Berhasil',
        message: 'Struktur kepanitiaan dikembalikan ke konfigurasi standar yayasan.',
        type: 'info',
        category: 'system'
      });
    }
  };

  const renderMemberCard = (member: CommitteeMember, isCompact = false) => {
    const isSelected = selectedMember?.id === member.id;
    return (
      <div
        key={member.id}
        onClick={() => setSelectedMember(member)}
        className={`group relative rounded-2xl border transition-all duration-200 cursor-pointer text-left select-none ${
          isSelected
            ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-400 shadow-md ring-2 ring-indigo-500/20 -translate-y-0.5'
            : 'bg-white/85 dark:bg-slate-900/85 backdrop-blur-xs border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-300 dark:hover:border-indigo-700/80 hover:-translate-y-0.5 shadow-xs hover:shadow-md'
        } ${isCompact ? 'p-3' : 'p-4'}`}
      >
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${member.avatarBg} text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
            >
              {member.avatarInitials}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {member.name}
              </h4>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                {member.role}
              </p>
            </div>
          </div>

          <span
            className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold shrink-0 border ${
              member.category === 'pembina'
                ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : member.category === 'bph'
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                : member.category === 'event'
                ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                : 'bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
            }`}
          >
            {member.category === 'pembina'
              ? 'Pembina'
              : member.category === 'bph'
              ? 'BPH Inti'
              : member.category === 'event'
              ? 'Event Ad-Hoc'
              : member.divisionName?.split(' ')[0] || 'Divisi'}
          </span>
        </div>

        {member.period && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10.5px] text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{member.period}</span>
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{member.status}</span>
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Struktur Kepanitiaan & Tata Kelola Yayasan
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                · Direktorat Eksekutif
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hierarki organisasi: Dewan Pembina, Badan Pengurus Harian (BPH), Koordinator 6 Divisi, dan Panitia Event.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pejabat / Panitia</span>
          </button>
          <button
            type="button"
            onClick={handleResetToDefault}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            title="Reset ke struktur awal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Control Bar: Search, Category Filters, and View Switcher */}
      <div className="p-3 sm:p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-3xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Instant Search Bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama pejabat, posisi/jabatan, atau divisi..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          {/* Category Filter Pills (Modern Segmented Container) */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 bg-slate-100/70 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-200/60 dark:border-white/[0.05]">
            {[
              { id: 'all', label: `Semua (${members.length})` },
              { id: 'pembina', label: `Pembina (${dewanPembina.length})` },
              { id: 'bph', label: `BPH Inti (${bphMembers.length})` },
              { id: 'divisi', label: `Koordinator (${divisiHeads.length})` },
              { id: 'event', label: `Event (${adhocEvents.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filterCategory === tab.id
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-black/[0.04] dark:ring-white/[0.06]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-200/60 dark:border-white/[0.05] self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setActiveViewMode('chart')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeViewMode === 'chart'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-black/[0.04] dark:ring-white/[0.06]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bagan Hierarki</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveViewMode('grid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeViewMode === 'grid'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-black/[0.04] dark:ring-white/[0.06]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Daftar Kartu</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout: Hierarchy Chart & Selected Member Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Interactive Organizational Chart View */}
        <div className="lg:col-span-2 space-y-6">
          {activeViewMode === 'chart' ? (
            <div className="p-5 sm:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-3xl shadow-sm space-y-8 overflow-x-auto">
              {/* Level 1: Dewan Pembina & Pengawas */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 text-xs font-extrabold uppercase tracking-wider">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tingkat I • Dewan Pembina & Pengawas Spiritual</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {dewanPembina.map(m => renderMemberCard(m))}
                </div>

                {/* Vertical connecting line */}
                <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-700 mx-auto" />
              </div>

              {/* Level 2: Badan Pengurus Harian (BPH) */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-700/60 text-indigo-800 dark:text-indigo-300 text-xs font-extrabold uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Tingkat II • Badan Pengurus Harian (BPH Eksekutif)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {bphMembers.map(m => renderMemberCard(m))}
                </div>

                {/* Vertical connecting line */}
                <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-700 mx-auto" />
              </div>

              {/* Level 3: Koordinator 6 Divisi Operasional MIS */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-700/60 text-teal-800 dark:text-teal-300 text-xs font-extrabold uppercase tracking-wider">
                  <Briefcase className="w-3.5 h-3.5 text-teal-600" />
                  <span>Tingkat III • Koordinator Divisi Operasional (MIS Yayasan)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {divisiHeads.map(m => renderMemberCard(m))}
                </div>

                {/* Vertical connecting line */}
                {adhocEvents.length > 0 && (
                  <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-700 mx-auto" />
                )}
              </div>

              {/* Level 4: Kepanitiaan Ad-Hoc & Event Khusus */}
              {adhocEvents.length > 0 && (
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700/60 text-rose-800 dark:text-rose-300 text-xs font-extrabold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                    <span>Tingkat IV • Kepanitiaan Ad-Hoc & Satuan Tugas Event</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {adhocEvents.map(m => renderMemberCard(m))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredMembers.map(m => renderMemberCard(m))}
            </div>
          )}
        </div>

        {/* Right Column: Selected Member Inspector / Detail Card */}
        <div className="space-y-4 sticky top-6">
          {selectedMember ? (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedMember.avatarBg} text-white font-black flex items-center justify-center text-lg shadow-md`}
                  >
                    {selectedMember.avatarInitials}
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-white">
                      {selectedMember.name}
                    </h3>
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {selectedMember.role}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Periode: {selectedMember.period || '2024 - 2029'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(selectedMember)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                    title="Edit Data Pengurus"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMember(selectedMember)}
                    className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 cursor-pointer transition-colors"
                    title="Hapus dari struktur"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bio & Description */}
              {selectedMember.bio && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <p className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5 text-[11px]">
                    <Info className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Profil Singkat Jabatan:</span>
                  </p>
                  {selectedMember.bio}
                </div>
              )}

              {/* Responsibilities List */}
              {selectedMember.responsibilities && selectedMember.responsibilities.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Mandat & Tugas Utama:
                  </h4>
                  <ul className="space-y-1.5 text-xs">
                    {selectedMember.responsibilities.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contact Information */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                {selectedMember.email && (
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email:</span>
                    </span>
                    <a
                      href={`mailto:${selectedMember.email}`}
                      className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline truncate max-w-[200px]"
                    >
                      {selectedMember.email}
                    </a>
                  </div>
                )}
                {selectedMember.phone && (
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>WhatsApp / HP:</span>
                    </span>
                    <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                      {selectedMember.phone}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Kategori Kepanitiaan:</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase text-[10px]">
                    {selectedMember.category}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
              <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Pilih salah satu kartu pengurus di bagan untuk melihat rincian mandat & tugas jabatan.
              </p>
            </div>
          )}

          {/* Quick Stats Summary Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/50 border border-indigo-100 dark:border-slate-700/80 space-y-2 text-xs">
            <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ringkasan Kelembagaan Yayasan</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500">Total Personil:</span>
                <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {members.length} Orang
                </p>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-500">Divisi Aktif:</span>
                <p className="text-sm font-black text-teal-600 dark:text-teal-400 mt-0.5">
                  6 Divisi MIS
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Tambah / Edit Anggota Panitia */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>{editingMember ? 'Edit Data Pengurus' : 'Tambah Pengurus / Panitia Baru'}</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Masukkan informasi jabatan untuk bagan organisasi Direktorat Yayasan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Contoh: Budi Santoso, S.Kom."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Posisi / Jabatan *
                </label>
                <input
                  type="text"
                  required
                  value={formRole}
                  onChange={e => setFormRole(e.target.value)}
                  placeholder="Contoh: Ketua Umum / Koordinator Divisi Penerbitan"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Kategori Bagan
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => {
                      const cat = e.target.value as 'pembina' | 'bph' | 'divisi' | 'event';
                      setFormCategory(cat);
                      if (cat === 'pembina') setFormLevel(1);
                      else if (cat === 'bph') setFormLevel(2);
                      else if (cat === 'divisi') setFormLevel(3);
                      else if (cat === 'event') setFormLevel(4);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    <option value="pembina">Dewan Pembina (Tingkat 1)</option>
                    <option value="bph">BPH Eksekutif (Tingkat 2)</option>
                    <option value="divisi">Koordinator Divisi (Tingkat 3)</option>
                    <option value="event">Panitia Event Ad-Hoc (Tingkat 4)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Divisi Penugasan
                  </label>
                  <select
                    value={formDivisionId}
                    onChange={e => setFormDivisionId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    {divisiList.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.nama_divisi} ({d.kode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Email Kontak
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="nama@lamrimnesia.org"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    No. WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Periode Jabatan
                  </label>
                  <input
                    type="text"
                    value={formPeriod}
                    onChange={e => setFormPeriod(e.target.value)}
                    placeholder="2024 - 2029"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Penasihat">Penasihat</option>
                    <option value="Purna">Purna</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Deskripsi / Profil Singkat
                </label>
                <textarea
                  rows={2}
                  value={formBio}
                  onChange={e => setFormBio(e.target.value)}
                  placeholder="Ringkasan fungsi dan lingkup kerja jabatan..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Mandat & Tugas Utama (1 baris per tugas)
                </label>
                <textarea
                  rows={3}
                  value={formResponsibilities}
                  onChange={e => setFormResponsibilities(e.target.value)}
                  placeholder="Pengawasan alur penerbitan&#10;Koordinasi dengan sangha&#10;Persetujuan anggaran"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  Simpan Pengurus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
