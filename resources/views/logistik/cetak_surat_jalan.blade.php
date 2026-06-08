<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Surat Jalan Digital</title>
    <style>
        /* Pengaturan Dasar Cetak PDF */
        @page {
            size: A5 landscape; /* Ukuran pas untuk surat jalan, hemat kertas */
            margin: 15mm;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #2D3748;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }

        /* Header / Logo & Judul */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .brand-title {
            font-size: 18px;
            font-weight: bold;
            color: #1A365D;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .doc-title {
            font-size: 16px;
            font-weight: bold;
            color: #3182CE;
            text-align: right;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* Garis Pembatas Modern */
        .divider {
            height: 2px;
            background: #E2E8F0;
            margin-bottom: 15px;
        }

        /* Informasi Pengiriman */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .info-table td {
            vertical-align: top;
            width: 50%;
        }
        .info-box {
            padding: 8px 12px;
            background: #F7FAFC;
            border-radius: 6px;
            border-left: 3px solid #3182CE;
            min-height: 55px;
        }
        .info-box-right {
            padding: 8px 12px;
            background: #F7FAFC;
            border-radius: 6px;
            min-height: 55px;
        }
        .info-label {
            font-size: 9px;
            color: #718096;
            text-transform: uppercase;
            margin-bottom: 3px;
            font-weight: bold;
        }
        .info-value {
            font-size: 11px;
            font-weight: 500;
        }

        /* Tabel Item Barang */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        .items-table th {
            background: #1A365D;
            color: #FFFFFF;
            text-transform: uppercase;
            font-size: 9px;
            font-weight: bold;
            padding: 8px 10px;
            letter-spacing: 0.5px;
        }
        .items-table th.left { text-align: left; border-top-left-radius: 4px; border-bottom-left-radius: 4px; }
        .items-table th.center { text-align: center; }
        .items-table th.right { text-align: right; border-top-right-radius: 4px; border-bottom-right-radius: 4px; }

        .items-table td {
            padding: 10px;
            border-bottom: 1px solid #E2E8F0;
            font-size: 11px;
        }
        .item-row:nth-child(even) {
            background-color: #F8FAFC;
        }
        .text-bold {
            font-weight: bold;
            color: #1A365D;
        }

        /* Bagian Tanda Tangan */
        .signature-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .signature-table td {
            width: 33.33%;
            text-align: center;
            vertical-align: bottom;
        }
        .signature-title {
            font-size: 9px;
            color: #718096;
            text-transform: uppercase;
            font-weight: bold;
            margin-bottom: 45px; /* Ruang untuk tanda tangan fisik */
        }
        .signature-name {
            font-size: 11px;
            font-weight: bold;
            border-top: 1px solid #A0AEC0;
            display: inline-block;
            width: 70%;
            padding-top: 4px;
        }
    </style>
</head>
<body>

    <table class="header-table">
        <tr>
            <td class="brand-title">Lamrimnesia</td>
            <td class="doc-title">Surat Jalan</td>
        </tr>
    </table>

    <div class="divider"></div>

    <table class="info-table">
        <tr>
            <td style="padding-right: 10px;">
                <div class="info-box">
                    <div class="info-label">Tujuan Pengiriman / Penerima</div>
                    <div class="info-value text-bold">{{ $data->tujuan }}</div>
                </div>
            </td>
            <td style="padding-left: 10px;">
                <div class="info-box-right">
                    <div class="info-label">Detail Surat Jalan</div>
                    <table style="width:100%; border-collapse:collapse; font-size: 11px;">
                        <tr>
                            <td style="color:#718096; width:40%;">Tanggal Keluar</td>
                            <td>: {{ \Carbon\Carbon::parse($data->created_at)->translatedFormat('d F Y') }}</td>
                        </tr>
                        <tr>
                            <td style="color:#718096;">Log ID</td>
                            <td>: #LOG-{{ str_pad($data->id, 5, '0', STR_PAD_LEFT) }}</td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th class="left" style="width: 10%;">No.</th>
                <th class="left" style="width: 70%;">Deskripsi Buku</th>
                <th class="center" style="width: 20%;">Jumlah (QTY)</th>
            </tr>
        </thead>
        <tbody>
            <tr class="item-row">
                <td>1</td>
                <td class="text-bold">{{ $data->book->judul ?? 'Buku Tidak Diketahui' }}</td>
                <td style="text-align: center; font-size: 12px; font-weight: bold;">{{ $data->qty_keluar }} pcs</td>
            </tr>
        </tbody>
    </table>

    <table class="signature-table">
        <tr>
            <td>
                <div class="signature-title">Diterima Oleh,</div>
                <div class="signature-name">( Agen / Ekspedisi )</div>
            </td>
            <td>
                <div class="signature-title">Diserahkan Oleh,</div>
                <div class="signature-name">Kurir / Sopir</div>
            </td>
            <td>
                <div class="signature-title">Hormat Kami,</div>
                <div class="signature-name">Tim Logistik</div>
            </td>
        </tr>
    </table>

</body>
</html>
