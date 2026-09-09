import React, { useState } from 'react';
import { SalesChannel, Expedition } from '../../types';
import { Globe, Truck, Plus, Trash2, Clock } from 'lucide-react';
import { SalesChannelModal } from './SalesChannelModal';
import { ExpeditionModal } from './ExpeditionModal';
import { useApp } from '../../context/AppContext';

export interface ChannelsAndExpeditionsTabProps {
  salesChannels?: SalesChannel[];
  expeditions?: Expedition[];
  onAddChannel?: (channel: Omit<SalesChannel, 'id'>) => void;
  onDeleteChannel?: (id: number) => void;
  onToggleChannelStatus?: (id: number, isActive: boolean) => void;
  onAddExpedition?: (expedition: Omit<Expedition, 'id'>) => void;
  onDeleteExpedition?: (id: number) => void;
  onToggleExpeditionStatus?: (id: number, isActive: boolean) => void;
}

export const ChannelsAndExpeditionsTab: React.FC<ChannelsAndExpeditionsTabProps> = (props) => {
  const app = useApp();

  const salesChannels = props.salesChannels ?? app.salesChannels;
  const expeditions = props.expeditions ?? app.expeditions;
  const onAddChannel = props.onAddChannel ?? ((ch) => app.addSalesChannel(ch));
  const onDeleteChannel = props.onDeleteChannel ?? ((id) => app.deleteSalesChannel(id));
  const onToggleChannelStatus = props.onToggleChannelStatus ?? ((id, isActive) => app.updateSalesChannel(id, { is_active: isActive, aktif: isActive }));
  const onAddExpedition = props.onAddExpedition ?? ((exp) => app.addExpedition(exp));
  const onDeleteExpedition = props.onDeleteExpedition ?? ((id) => app.deleteExpedition(id));
  const onToggleExpeditionStatus = props.onToggleExpeditionStatus ?? ((id, isActive) => app.updateExpedition(id, { is_active: isActive, aktif: isActive }));

  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [isExpeditionModalOpen, setIsExpeditionModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sales Channels Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Saluran Penjualan (Via Platform)
                </h3>
                <p className="text-xs text-slate-500">
                  Marketplace, event, dan kanal pesanan ({salesChannels.length} saluran)
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsChannelModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Saluran</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {salesChannels.map(channel => (
              <div
                key={channel.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {channel.nama_channel}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {channel.kategori}
                    </span>
                  </div>
                  {channel.deskripsi && (
                    <p className="text-[11px] text-slate-500">{channel.deskripsi}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => onToggleChannelStatus(channel.id, !(channel.is_active ?? channel.aktif))}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full cursor-pointer transition-colors ${
                      (channel.is_active ?? channel.aktif)
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {(channel.is_active ?? channel.aktif) ? 'Aktif' : 'Nonaktif'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteChannel(channel.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Hapus Saluran"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expeditions Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Jenis Ekspedisi & Kurir Pengiriman
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar opsi pengiriman pesanan POS ({expeditions.length} opsi)
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsExpeditionModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Ekspedisi</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {expeditions.map(exp => (
              <div
                key={exp.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {exp.nama_ekspedisi}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      {exp.kategori}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                    {exp.estimasi && (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Estimasi: {exp.estimasi}</span>
                      </span>
                    )}
                    {exp.deskripsi && <span>• {exp.deskripsi}</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => onToggleExpeditionStatus(exp.id, !(exp.is_active ?? exp.aktif))}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full cursor-pointer transition-colors ${
                      (exp.is_active ?? exp.aktif)
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {(exp.is_active ?? exp.aktif) ? 'Aktif' : 'Nonaktif'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteExpedition(exp.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Hapus Ekspedisi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <SalesChannelModal
        isOpen={isChannelModalOpen}
        onClose={() => setIsChannelModalOpen(false)}
        onSave={onAddChannel}
      />

      <ExpeditionModal
        isOpen={isExpeditionModalOpen}
        onClose={() => setIsExpeditionModalOpen(false)}
        onSave={onAddExpedition}
      />
    </div>
  );
};
