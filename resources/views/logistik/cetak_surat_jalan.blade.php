<!DOCTYPE html>
<html>
<head>
    <title>Surat Jalan</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .info { margin-bottom: 20px; }
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td { border: 1px solid #000; padding: 10px; text-align: left; }
        .footer { margin-top: 50px; }
        .sign-box { float: right; text-align: center; width: 200px; }
    </style>
</head>
<body>
    <div class="header">
        <h2 style="margin:0;">SURAT JALAN BARANG</h2>
        <p style="margin:0;">Lamrimnesia Store</p>
    </div>

    <div class="info">
        <table style="width: 100%;">
            <tr>
                <td style="width: 15%;">Tanggal</td>
                <td>: {{ $data->created_at->format('d F Y H:i') }}</td>
            </tr>
            <tr>
                <td>Tujuan</td>
                <td>: <strong>{{ $data->tujuan }}</strong></td>
            </tr>
        </table>
    </div>

    <table class="table">
        <thead>
            <tr style="background-color: #f2f2f2;">
                <th>Nama Barang / Buku</th>
                <th style="width: 100px; text-align: center;">Jumlah</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ $data->book->judul ?? $data->book->judul_buku ?? 'Produk Tidak Diketahui' }}</td>
                <td style="text-align: center;">{{ $data->qty_keluar }} Eks</td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <p>Barang telah diterima dalam keadaan baik dan cukup.</p>
        <div class="sign-box">
            <p>Petugas Logistik,</p>
            <br><br><br>
            <p><strong>( ____________________ )</strong></p>
        </div>
    </div>
</body>
</html>