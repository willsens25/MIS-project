import React from 'react';
import { useApp } from '../../context/AppContext';

interface PrintReportHeaderProps {
  divisionName: string;
  divisionCode: string;
  subTabTitle?: string;
}

export const PrintReportHeader: React.FC<PrintReportHeaderProps> = ({
  divisionName,
  divisionCode,
  subTabTitle
}) => {
  const { currentUser } = useApp();
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const currentTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="hidden print:block mb-6 pb-4 border-b-2 border-slate-800 text-slate-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src="/img/logo-lamrimnesia.png"
            alt="Logo Lamrimnesia"
            className="h-12 w-auto object-contain"
          />
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 uppercase">
              YAYASAN PELESTARIAN & PENGEMBANGAN LAMRIM NUSANTARA (LAMRIMNESIA)
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Sistem Administrasi & Pengelolaan Arsip Terintegrasi (SAPA-ALL MIS v4.0)
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs font-bold text-indigo-900">
                Divisi: {divisionName} ({divisionCode})
              </span>
              {subTabTitle && (
                <>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-700">
                    Modul / Tampilan: {subTabTitle}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="text-right text-[10px] text-slate-500 font-mono leading-tight">
          <p className="font-bold text-slate-700">DOKUMEN RESMI INTERNAL</p>
          <p>Dicetak: {currentDate}, {currentTime}</p>
          <p>Operator: {currentUser.name} ({currentUser.role})</p>
        </div>
      </div>
    </div>
  );
};
