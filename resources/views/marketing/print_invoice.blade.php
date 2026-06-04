<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cetak Invoice #{{ $order->no_invoice }}</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <style>
        /* Optimasi khusus saat tombol cetak browser ditekan */
        @media print {
            body {
                background-color: #ffffff;
                color: #000000;
            }
            .no-print {
                display: none !important;
            }
            .print-card {
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
            }
        }
    </style>
</head>
<body class="bg-slate-100 font-sans text-slate-800 antialiased min-h-screen py-8">

    <div class="max-w-4xl mx-auto mb-6 flex justify-between items-center px-4 no-print">
        <a href="/marketing/order" class="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2.5 rounded-lg shadow-sm transition">
            ⬅️ Kembali
        </a>
        <button onclick="window.print()" class="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg shadow-sm transition inline-flex items-center gap-2">
            🖨️ Cetak / Simpan PDF
        </button>
    </div>

    <div class="max-w-4xl mx-auto bg-white border border-slate-200 shadow-xl rounded-xl p-8 md:p-12 print-card">

        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-8 gap-4">
            <div class="flex items-center gap-4">
                <img src="{{ asset('img/Logo Lamrimnesia.png') }}" alt="Logo Lamrimnesia" class="h-16 w-auto object-contain">
                <div>
                    <h1 class="text-2xl font-black tracking-tight text-slate-900">Lamrimnesia</h1>
                    <p class="text-sm text-slate-500 mt-0.5">Sistem Manajemen Penjualan & Distribusi Buku</p>
                </div>
            </div>
            <div class="text-left sm:text-right">
                <h2 class="text-2xl font-bold tracking-wider text-slate-400 uppercase">Invoice</h2>
                <p class="text-lg font-semibold text-slate-700 mt-1">{{ $order->no_invoice }}</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 text-sm">
            <div class="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <h3 class="text-xs font-bold tracking-wider text-slate-400 uppercase mb-3">Tujuan Pengiriman:</h3>
                <p class="font-bold text-base text-slate-900 mb-1">{{ $order->nama_penerima }}</p>
                @if($order->nama_pembeli !== $order->nama_penerima)
                    <p class="text-xs text-slate-500 mb-2">(Agen Pembeli: {{ $order->nama_pembeli }})</p>
                @endif
                <p class="text-slate-600 leading-relaxed">{{ $order->alamat_penerima }}</p>
            </div>

            <div class="flex flex-col justify-between p-1">
                <div class="grid grid-cols-2 gap-y-3 gap-x-4">
                    <span class="text-slate-500 font-medium">Tanggal Pesan:</span>
                    <span class="text-slate-900 font-semibold">{{ \Carbon\Carbon::parse($order->tanggal_pesan)->translatedFormat('d F Y') }}</span>

                    <span class="text-slate-500 font-medium">Metode Order (Via):</span>
                    <span class="text-slate-900"><span class="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-md font-semibold border border-blue-100">{{ $order->via }}</span></span>

                    <span class="text-slate-500 font-medium">Ekspedisi:</span>
                    <span class="text-slate-900 font-medium">{{ $order->ekspedisi }}</span>

                    <span class="text-slate-500 font-medium">Status Nota:</span>
                    <span>
                        @if(strtolower($order->status) == 'lunas')
                            <span class="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-md font-bold border border-green-100">LUNAS</span>
                        @else
                            <span class="bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-md font-bold border border-amber-100">PENDING / UTANG</span>
                        @endif
                    </span>
                </div>
            </div>
        </div>

        <div class="overflow-x-auto border border-slate-200 rounded-xl mt-8">
            <table class="w-full text-left border-collapse text-sm">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th class="py-3 px-4 w-12 text-center">No</th>
                        <th class="py-3 px-4">Judul Buku / Item</th>
                        <th class="py-3 px-4 text-right w-32">Harga Satuan</th>
                        <th class="py-3 px-4 text-center w-24">QTY</th>
                        <th class="py-3 px-4 text-right w-36">Subtotal</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">
                    @forelse($order->details as $index => $detail)
                        <tr class="hover:bg-slate-50/50 transition">
                            <td class="py-3.5 px-4 text-center text-slate-400 font-medium">{{ $index + 1 }}</td>
                            <td class="py-3.5 px-4 font-medium text-slate-900">
                                {{ $detail->book->judul ?? 'Buku Tidak Diketahui (ID: '.$detail->buku_id.')' }}
                            </td>
                            <td class="py-3.5 px-4 text-right text-slate-600">
                                Rp {{ number_format($detail->harga_satuan, 0, ',', '.') }}
                            </td>
                            <td class="py-3.5 px-4 text-center font-semibold text-slate-900">
                                {{ $detail->jumlah }}
                            </td>
                            <td class="py-3.5 px-4 text-right font-semibold text-slate-900">
                                Rp {{ number_format($detail->subtotal, 0, ',', '.') }}
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="py-8 px-4 text-center text-slate-400 italic">
                                Tidak ada rincian item buku untuk invoice ini.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="mt-8 flex justify-end text-sm">
            <div class="w-full sm:w-80 bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
                <div class="flex justify-between text-slate-600 font-medium">
                    <span>Total Item (Buku):</span>
                    <span class="text-slate-900 font-semibold">
                        {{ $order->details->sum('jumlah') }} pcs
                    </span>
                </div>
                <div class="flex justify-between text-slate-600 font-medium">
                    <span>Subtotal Produk:</span>
                    <span class="text-slate-900">
                        Rp {{ number_format(($order->total_tagihan - ($order->ongkir ?? 0)), 0, ',', '.') }}
                    </span>
                </div>
                <div class="flex justify-between text-slate-600 font-medium pb-2 border-b border-slate-200">
                    <span>Ongkos Kirim:</span>
                    <span class="text-slate-900">
                        Rp {{ number_format($order->ongkir ?? 0, 0, ',', '.') }}
                    </span>
                </div>
                <div class="flex justify-between items-baseline pt-1">
                    <span class="text-base font-bold text-slate-900">Total Tagihan:</span>
                    <span class="text-xl font-black text-blue-600">
                        Rp {{ number_format($order->total_tagihan, 0, ',', '.') }}
                    </span>
                </div>
            </div>
        </div>

        <div class="mt-12 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            <p class="font-medium text-slate-500 mb-1">Terima kasih atas kepercayaan Anda berbelanja bersama kami!</p>
            <p>Invoice ini sah dibuat secara otomatis oleh sistem komputer internal.</p>
        </div>

    </div>

</body>
</html>
