@extends('layouts.app')

@section('content')
<div class="container-fluid px-4 py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div class="d-flex align-items-center">
            <a href="{{ route('marketing') }}" class="btn btn-outline-secondary btn-sm rounded-circle mr-3" title="Kembali ke Form Input" style="width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center;">
                <i class="fas fa-arrow-left"></i>
            </a>
            <h1 class="h3 mb-0 text-gray-800 font-weight-bold">Riwayat Invoice Pesanan</h1>
        </div>

        <a href="{{ route('marketing') }}" class="btn btn-primary rounded-pill shadow-sm px-3">
            <i class="fas fa-plus mr-1"></i> Input Pesanan Baru
        </a>
    </div>

    @if(session('success'))
        <div class="alert alert-success border-0 shadow-sm">{{ session('success') }}</div>
    @endif
    @if(session('error'))
        <div class="alert alert-danger border-0 shadow-sm">{{ session('error') }}</div>
    @endif

    <div class="card shadow border-0 rounded-lg mb-4">
        <div class="card-body">
            <form action="{{ route('order.index') }}" method="GET" class="row g-3 align-items-center">
                <div class="col-md-4">
                    <input type="text" name="search" class="form-control rounded-pill" placeholder="Cari No. Invoice / Nama Agen..." value="{{ request('search') }}">
                </div>
                <div class="col-md-3">
                    <select name="status" class="form-control rounded-pill">
                        <option value="">-- Semua Status --</option>
                        <option value="Pending" {{ request('status') == 'Pending' ? 'selected' : '' }}>Pending</option>
                        <option value="Lunas" {{ request('status') == 'Lunas' ? 'selected' : '' }}>Lunas</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <button type="submit" class="btn btn-secondary w-100 rounded-pill">Filter</button>
                </div>
            </form>
        </div>
    </div>

    <div class="card shadow border-0 rounded-lg mb-4">
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-bordered table-hover" width="100%" cellspacing="0">
                    <thead class="table-light">
                        <tr>
                            <th>No. Invoice</th>
                            <th>Tanggal</th>
                            <th>Agen / Pembeli</th>
                            <th>Via</th>
                            <th>Total Tagihan</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($orders as $order)
                            <tr>
                                <td class="fw-bold text-primary">{{ $order->no_invoice }}</td>
                                <td>{{ \Carbon\Carbon::parse($order->tanggal_pesan)->format('d/m/Y') }}</td>
                                <td>
                                    <div class="font-weight-bold text-dark">{{ $order->nama_pembeli }}</div>
                                    @if($order->nama_penerima && $order->nama_penerima != $order->nama_pembeli)
                                        <small class="text-muted">ke: {{ $order->nama_penerima }}</small>
                                    @endif
                                </td>
                                <td><span class="badge bg-light border text-dark">{{ $order->via }}</span></td>
                                <td class="text-end font-weight-bold">Rp {{ number_format($order->total_tagihan, 0, ',', '.') }}</td>
                                <td>
                                    @if(strtolower($order->status) == 'lunas')
                                        <span class="badge bg-success text-white px-2 py-1 rounded-pill">Lunas</span>
                                    @else
                                        <span class="badge bg-warning text-dark px-2 py-1 rounded-pill">Pending</span>
                                    @endif
                                </td>
                                <td>
                                    <div class="btn-group" role="group">
                                        <a href="{{ route('marketing.order.print', $order->id) }}" target="_blank" class="btn btn-info btn-sm text-white" title="Cetak Nota" style="border-radius: 6px 0 0 6px;">
                                            <i class="fas fa-print"></i> Cetak
                                        </a>

                                        @if(strtolower($order->status) != 'lunas')
                                            <form action="{{ route('mad.tandai-lunas', $order->id) }}" method="POST" style="display:inline;" onsubmit="return confirm('Tandai invoice ini sebagai LUNAS? Kas finance akan otomatis bertambah.')">
                                                @csrf
                                                <button type="submit" class="btn btn-success btn-sm" style="border-radius: 0;">
                                                    <i class="fas fa-check"></i> Lunas
                                                </button>
                                            </form>

                                            <form action="{{ route('mad.hapus-invoice', $order->id) }}" method="POST" style="display:inline;" onsubmit="return confirm('Yakin ingin membatalkan invoice ini? Stok akan dikembalikan ke gudang.')">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="btn btn-danger btn-sm" style="border-radius: 0 6px 6px 0;">
                                                    <i class="fas fa-trash"></i> Batal
                                                </button>
                                            </form>
                                        @endif
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="text-center text-muted py-4">Tidak ada data invoice ditemukan.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="d-flex justify-content-end mt-3">
                {{ $orders->appends(request()->query())->links() }}
            </div>
        </div>
    </div>
</div>
@endsection
