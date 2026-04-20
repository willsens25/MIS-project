<!DOCTYPE html>
<html>
<head>
    <title>Surat Jalan</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; color: #333; }
        .header-table { width: 100%; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .info { width: 100%; margin-bottom: 20px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .table th, .table td { border: 1px solid #000; padding: 8px; text-align: left; }
        .footer { margin-top: 50px; width: 100%; }
        .signature-box { width: 100%; margin-top: 30px; }
        .sig-col { width: 50%; text-align: center; vertical-align: top; }
    </style>
</head>
<body>
    {{-- HEADER DENGAN LOGO --}}
    <table class="header-table">
        <tr>
            <td style="width: 15%; text-align: left;">
                {{-- Memanggil variabel $logo dari Controller --}}
                <img src="{{ $logo }}" style="height: 60px; width: auto;">
            </td>
            <td style="width: 85%; text-align: center;">
                <h2 style="margin: 0; color: #000;">LAMRIMNESIA STORE</h2>
                <p style="margin: 5px 0 0 0; font-size: 10px;">
                    Jl. Bijaksana III no. 7 Kelurahan Pasteur, Kecamatan Sukajadi, Kota Bandung, <br>
                    PASTEUR, SUKAJADI, BANDUNG, JAWA BARAT 26501 | Telp: 085211220142
                </p>
            </td>
        </tr>
    </table>

    <table class="info">
        <tr>
            <td><strong>No. Referensi:</strong> {{ $no_ref }}</td>
            <td style="text-align: right;"><strong>Tanggal:</strong> {{ $date }}</td>
        </tr>
        <tr>
            <td><strong>Tujuan:</strong> {{ $log->tujuan }}</td>
            <td></td>
        </tr>
    </table>

    <table class="table">
        <thead>
            <tr style="background-color: #f2f2f2;">
                <th style="width: 40px;">No</th>
                <th>Judul Buku</th>
                <th style="text-align: center; width: 100px;">Jumlah (Eks)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>1</td>
                <td style="font-weight: bold;">{{ $log->book->judul ?? 'N/A' }}</td>
                <td style="text-align: center;">{{ number_format($log->qty_keluar) }}</td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <table class="signature-box">
            <tr>
                <td class="sig-col">
                    <p>Penerima,</p>
                    <br><br><br><br>
                    <p>( ........................... )</p>
                </td>
                <td class="sig-col">
                    <p>Hormat Kami,</p>
                    <br><br><br><br>
                    <p><strong>Lamrimnesia Store</strong></p>
                </td>
            </tr>
        </table>
    </div>

    <div style="margin-top: 30px; font-style: italic; font-size: 9px; color: #888;">
        * Barang yang sudah dibeli tidak dapat ditukar/dikembalikan kecuali ada perjanjian.
    </div>
</body>
</html>