<!DOCTYPE html>
<html>
<head>
    <title>Laporan Keuangan {{ $tahun }}</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #444; padding-bottom: 10px; }
        .header h2 { margin: 0; text-transform: uppercase; }
        .summary-box { margin-bottom: 20px; width: 100%; }
        .summary-table { width: 100%; border-collapse: collapse; }
        .summary-table td { padding: 10px; border: 1px solid #ddd; }
        .bg-light { background-color: #f9f9f9; }
        .text-success { color: #28a745; font-weight: bold; }
        .text-danger { color: #dc3545; font-weight: bold; }
        table.main-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table.main-table th { background-color: #4F46E5; color: white; padding: 10px; text-align: left; }
        table.main-table td { padding: 8px; border-bottom: 1px solid #eee; }
        .text-right { text-align: right; }
        .footer { margin-top: 30px; font-size: 10px; text-align: right; color: #777; }
    </style>
</head>
<body>

    <div class="header">
        <h2>Laporan Arus Kas Organisasi</h2>
        <p>Periode Tahun: {{ $tahun }}</p>
    </div>

    <div class="summary-box">
        <table class="summary-table">
            <tr>
                <td class="bg-light">Total Pemasukan</td>
                <td class="text-right text-success">Rp {{ number_format($totalMasuk, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td class="bg-light">Total Pengeluaran</td>
                <td class="text-right text-danger">Rp {{ number_format($totalKeluar, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td class="bg-light"><strong>Saldo Akhir Periode</strong></td>
                <td class="text-right"><strong>Rp {{ number_format($totalMasuk - $totalKeluar, 0, ',', '.') }}</strong></td>
            </tr>
        </table>
    </div>

    <h4>Rincian Transaksi</h4>
    <table class="main-table">
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>Keterangan</th>
                <th>Akun</th>
                <th class="text-right">Nominal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($mutasis as $m)
            <tr>
                <td>{{ date('d/m/Y', strtotime($m->tanggal)) }}</td>
                <td>
                    {{ $m->keterangan }}<br>
                    <small style="color: #666;">{{ $m->tipe }}</small>
                </td>
                <td>{{ $m->account->nama_akun ?? '-' }}</td>
                <td class="text-right {{ $m->tipe == 'Masuk' ? 'text-success' : 'text-danger' }}">
                    {{ $m->tipe == 'Masuk' ? '+' : '-' }} {{ number_format($m->nominal, 0, ',', '.') }}
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Dicetak pada: {{ date('d M Y H:i:s') }}
    </div>

</body>
</html>
