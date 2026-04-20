<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Invoice #INV-{{ $invoice->id }}</title>
    <style>
        body { font-family: 'Courier New', Courier, monospace; color: #333; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; }
        .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; }
        .total { text-align: right; margin-top: 20px; font-weight: bold; font-size: 1.2em; }
        .footer { margin-top: 50px; display: flex; justify-content: space-between; }
        .stempel { border: 2px solid #d00; color: #d00; padding: 10px; transform: rotate(-15deg); font-weight: bold; width: fit-content; }
        @media print { .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="no-print" style="text-align:center; margin-bottom:20px;">
        <button onclick="window.print()" style="padding:10px 20px; cursor:pointer;">CETAK SEKARANG / SIMPAN PDF</button>
        <button onclick="window.history.back()" style="padding:10px 20px; cursor:pointer;">KEMBALI</button>
    </div>

    <div class="invoice-box">
        <div class="header">
            <h2>DHARMA PATRIOT PUBLISHING</h2>
            <p>Sistem Distribusi Marketing (MAD)</p>
        </div>

        <div class="info">
            <div>
                <strong>KEPADA:</strong><br>
                {{ $invoice->agen->nama_agen }}<br>
                {{ $invoice->agen->wilayah }}<br>
                {{ $invoice->agen->no_telp }}
            </div>
            <div style="text-align: right;">
                <strong>NO INVOICE:</strong> #INV-{{ $invoice->id }}<br>
                <strong>TANGGAL:</strong> {{ $invoice->created_at->format('d/m/Y') }}<br>
                <strong>STATUS:</strong> {{ strtoupper($invoice->status_bayar) }}
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width: 40px;">No</th>
                    <th>Item Buku</th>
                    <th>Tipe</th>
                    <th>Jumlah</th>
                    <th>Harga Satuan</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($invoice->details as $key => $detail)
                <tr>
                    <td>{{ $key + 1 }}</td>
                    <td>{{ $detail->buku->judul }}</td>
                    <td>{{ $invoice->tipe }}</td>
                    <td>{{ $detail->qty }} Eks</td>
                    <td>Rp {{ number_format($detail->harga_satuan) }}</td>
                    <td>Rp {{ number_format($detail->subtotal) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="total">
            TOTAL TAGIHAN: Rp {{ number_format($invoice->total_harga) }}
        </div>

        <div class="footer">
            <div>
                <p>Penerima,</p>
                <br><br><br>
                ( ........................ )
            </div>
            <div style="text-align: center;">
                @if($invoice->status_bayar == 'Lunas' || $invoice->tipe == 'D-DONASI')
                    <div class="stempel">LUNAS / TERKIRIM</div>
                @endif
                <p>Admin MAD,</p>
                <br><br><br>
                ( {{ auth()->user()->name }} )
            </div>
        </div>
    </div>
</body>
</html>