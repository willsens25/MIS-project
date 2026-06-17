<!DOCTYPE html>
<html>
<head>
    <title>Katalog Buku S-SALUR</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .header h2 { margin: 0; padding: 0; color: #111; }
        .header p { margin: 5px 0 0 0; color: #666; font-size: 11px; }
        .meta-info { margin-bottom: 15px; width: 100%; font-size: 11px; }
        .meta-info td { vertical-align: top; }
        .table-data { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .table-data th { bg-color: #f5f5f5; background: #f5f5f5; color: #000; font-weight: bold; padding: 8px; border: 1px solid #ddd; text-align: left; }
        .table-data td { padding: 8px; border: 1px solid #ddd; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .badge-danger { color: #a94442; background-color: #f2dede; padding: 2px 5px; border-radius: 3px; font-weight: bold; }
        .badge-success { color: #3c763d; background-color: #dff0d8; padding: 2px 5px; border-radius: 3px; }
    </style>
</head>
<body>

    <div class="header">
        <h2>SAPA ALL MIS - DIVISI PENERBITAN</h2>
        <p>Laporan Data Katalog & Stok Gudang Manajemen S-SALUR</p>
    </div>

    <table class="meta-info">
        <tr>
            <td style="width: 70%;"><strong>Dicetak Oleh:</strong> {{ auth()->user()->name ?? 'Administrator' }}</td>
            <td style="width: 30%; text-align: right;"><strong>Tanggal Unduh:</strong> {{ date('d-m-Y H:i') }} WIB</td>
        </tr>
    </table>

    <table class="table-data">
        <thead>
            <tr>
                <th style="width: 5%;" class="text-center">No</th>
                <th style="width: 15%;">Kode Buku</th>
                <th style="width: 35%;">Judul Buku</th>
                <th style="width: 20%;">Penulis</th>
                <th style="width: 10%;" class="text-center">Stok</th>
                <th style="width: 15%;" class="text-right">Harga Jual</th>
            </tr>
        </thead>
        <tbody>
            @foreach($books as $key => $b)
            <tr>
                <td class="text-center">{{ $key + 1 }}</td>
                <td style="font-family: monospace; color: #0066cc;">PNB-SALUR-{{ str_pad($b->id, 4, '0', STR_PAD_LEFT) }}</td>
                <td><strong>{{ $b->judul }}</strong></td>
                <td>{{ $b->penulis ?? '-' }}</td>
                <td class="text-center">
                    @if($b->stok_gudang <= 10)
                        <span class="badge-danger">{{ $b->stok_gudang }} Eks</span>
                    @else
                        <span class="badge-success">{{ $b->stok_gudang }} Eks</span>
                    @endif
                </td>
                <td class="text-right">Rp {{ number_format($b->harga_jual, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

</body>
</html>
