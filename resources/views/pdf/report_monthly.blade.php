<!DOCTYPE html>
<html>
<head>
    <title>Laporan Bulanan</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .summary-box { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
        .summary-box td { padding: 10px; border: 1px solid #ddd; }
        .bg-light { background-color: #f9f9f9; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #4361ee; color: white; }
        .text-end { text-align: right; }
        .footer { margin-top: 50px; width: 100%; }
        .signature { width: 200px; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h2 style="margin:0;">LAPORAN KEUANGAN ORGANISASI</h2>
        <p style="margin:0;">Periode: {{ $namaBulan }} {{ $year }}</p>
    </div>

    <table class="summary-box">
        <tr>
            <td class="bg-light"><strong>Total Pemasukan</strong></td>
            <td class="text-end" style="color: green;">Rp {{ number_format($totalMasuk, 0, ',', '.') }}</td>
            <td class="bg-light"><strong>Total Pengeluaran</strong></td>
            <td class="text-end" style="color: red;">Rp {{ number_format($totalKeluar, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td colspan="2" class="bg-light" style="font-size: 14px;"><strong>SALDO AKHIR BULAN INI</strong></td>
            <td colspan="2" class="text-end" style="font-size: 14px; font-weight: bold;">Rp {{ number_format($saldoAkhir, 0, ',', '.') }}</td>
        </tr>
    </table>

    <h3>Rincian Transaksi</h3>
    <table>
        <thead>
            <tr>
                <th>Tgl</th>
                <th>Kategori</th>
                <th>Keterangan</th>
                <th>Nominal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transactions as $t)
            <tr>
                <td>{{ date('d/m/y', strtotime($t->tanggal)) }}</td>
                <td>{{ $t->account->nama_akun ?? '-' }}</td>
                <td>{{ $t->keterangan }}</td>
                <td class="text-end">{{ $t->tipe == 'Masuk' ? '+' : '-' }} {{ number_format($t->nominal, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <table class="footer">
        <tr>
            <td style="border:none;"></td>
            <td style="border:none;" class="signature">
                <p>Dicetak pada: {{ date('d M Y') }}</p>
                <br><br><br>
                <strong>( Bendahara )</strong>
            </td>
        </tr>
    </table>
</body>
</html>