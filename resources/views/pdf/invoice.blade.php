<!DOCTYPE html>
<html>
<head>
    <title>Invoice {{ $invoice->no_invoice }}</title>
    <style>
        body { font-family: sans-serif; font-size: 14px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4361ee; padding-bottom: 10px; }
        .info { margin-bottom: 20px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th, .table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        .table th { background-color: #f8f9fa; color: #4361ee; }
        .total { text-align: right; margin-top: 30px; font-weight: bold; font-size: 18px; color: #4361ee; }
        /* Badge Status */
        .status { 
            padding: 5px 12px; 
            border-radius: 4px; 
            background: #2ec4b6; 
            color: white; 
            font-size: 12px;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2 style="margin: 0; color: #4361ee;">SAPA-ALL ORGANIZATION</h2>
        <p style="margin: 5px 0;">Laporan Invoice Penjualan Resmi</p>
    </div>

    <div class="info">
        <table style="width: 100%">
            <tr>
                <td style="width: 50%"><strong>No. Invoice:</strong> #{{ $invoice->no_invoice }}</td>
                <td style="text-align: right"><strong>Tanggal:</strong> {{ $invoice->created_at->format('d/m/Y') }}</td>
            </tr>
            <tr>
                <td><strong>Agen:</strong> {{ $invoice->nama_agen }}</td>
                <td style="text-align: right">
                    <strong>Status:</strong> 
                    <span class="status">{{ $invoice->status }}</span>
                </td>
            </tr>
        </table>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th>Deskripsi Buku</th>
                <th style="text-align: right">Harga Satuan</th>
                <th style="text-align: center">Jumlah</th>
                <th style="text-align: right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ $invoice->book->judul ?? 'Buku Tidak Terdaftar' }}</td>
                <td style="text-align: right">Rp {{ number_format($invoice->harga_satuan, 0, ',', '.') }}</td>
                <td style="text-align: center">{{ $invoice->jumlah }} Eks</td>
                <td style="text-align: right">Rp {{ number_format($invoice->total_tagihan, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <div class="total">
        Total Tagihan: Rp {{ number_format($invoice->total_tagihan, 0, ',', '.') }}
    </div>

    <div style="margin-top: 60px; border-top: 1px dashed #ddd; padding-top: 10px;">
        <p style="margin-bottom: 5px;"><strong>Catatan:</strong></p>
        <small style="color: #777;">
            * Dokumen ini sah dan diterbitkan secara otomatis oleh sistem SAPA-ALL Finance.<br>
            * Silakan simpan invoice ini sebagai bukti transaksi yang valid.
        </small>
    </div>
</body>
</html>