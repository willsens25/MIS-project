<!DOCTYPE html>
<html>
<head>
    <title>Laporan Identitas MIS</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 11px; color: #333; }
        
        /* Header Style */
        .kop-surat { border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
        .logo { width: 80px; }
        .instansi-info { text-align: center; }
        .instansi-info h2 { margin: 0; font-size: 18px; text-transform: uppercase; color: #1a567d; }
        .instansi-info p { margin: 2px 0; font-size: 10px; color: #555; }
        
        /* Table Style */
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f8f9fa; font-weight: bold; text-transform: uppercase; font-size: 9px; color: #444; }
        
        /* Utils */
        .text-right { text-align: right; }
        .fw-bold { font-weight: bold; }
        .bg-light { background-color: #fcfcfc; }
        
        .footer { margin-top: 30px; text-align: right; font-size: 9px; font-style: italic; color: #777; }
        .summary-box { background: #f0f7ff; padding: 10px; border: 1px solid #d0e3f5; margin-bottom: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <table class="kop-surat" style="border:none;">
        <tr style="border:none;">
            <td style="border:none; width: 15%;">
                <img src="{{ public_path('img/Logo Lamrimnesia.png') }}" class="logo">
            </td>
            <td style="border:none; width: 85%;" class="instansi-info">
                <h2>Lamrimnesia</h2>
                <p>Jl. Bijaksana III no. 7 Kelurahan Pasteur, Kecamatan Sukajadi, Kota Bandung, PASTEUR, SUKAJADI, BANDUNG, JAWA BARAT 26501</p>
                <p>Telp: 085211220142
                | Email: info@lamrimnesia.org
                </p>
            </td>
        </tr>
    </table>

    <div class="summary-box">
        <table style="border:none; width: 100%; margin: 0;">
            <tr style="border:none;">
                <td style="border:none; width: 60%;">
                    <h3 style="margin:0;">LAPORAN DATABASE IDENTITAS</h3>
                    <span style="font-size: 10px;">Periode: Per {{ date('d F Y') }}</span>
                </td>
                <td style="border:none; width: 40%;" class="text-right">
                    <span class="fw-bold">Total Saldo Kas: </span><br>
                    <span style="font-size: 14px; color: #28a745;" class="fw-bold">Rp {{ number_format($totalDonasi - $totalSalur, 0, ',', '.') }}</span>
                </td>
            </tr>
        </table>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 5%; text-align: center;">No</th>
                <th>Nama Lengkap</th>
                <th style="width: 10%; text-align: center;">Divisi</th>
                <th style="width: 15%;">Status</th>
                <th class="text-right" style="width: 20%;">Saldo M-MON</th>
            </tr>
        </thead>
        <tbody>
            @foreach($identitas as $index => $idnt)
            @php
                $in = $idnt->transaksi->where('jenis', 'DONASI')->sum('nominal');
                $out = $idnt->transaksi->where('jenis', 'SALUR')->sum('nominal');
                $net = $in - $out;
            @endphp
            <tr class="{{ $index % 2 == 0 ? '' : 'bg-light' }}">
                <td style="text-align: center;">{{ $index + 1 }}</td>
                <td class="fw-bold">{{ strtoupper($idnt->nama_lengkap) }}</td>
                <td style="text-align: center;">{{ $idnt->divisi->kode ?? '-' }}</td>
                <td>{{ $idnt->status_keamanan }}</td>
                <td class="text-right fw-bold {{ $net < 0 ? 'color:red' : '' }}">
                    Rp {{ number_format($net, 0, ',', '.') }}
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Dokumen ini diterbitkan oleh sistem pada {{ date('d/m/Y H:i:s') }}.<br>
        Segala bentuk transaksi yang tertera telah tervalidasi oleh sistem M-MON.
    </div>
</body>
</html>