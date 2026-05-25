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

{{-- Trik mempassing link pagination baru agar ikut diperbarui JavaScript --}}
<tr class="d-none">
    <td id="ajax-pagination-links">
        {{ $orders->appends(request()->query())->links() }}
    </td>
</tr>
