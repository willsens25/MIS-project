<script>
    // 1. Fungsi Jam Real-time
    function updateTime() {
        const now = new Date();
        const clockElement = document.getElementById('live-clock');
        const dateElement = document.getElementById('live-date');
        
        clockElement.innerText = now.toLocaleTimeString('id-ID', { hour12: false });
        dateElement.innerText = now.toLocaleDateString('id-ID', { 
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
        });
    }

    // 2. Refresh Statistik (Total & Tabel)
    function refreshDashboard() {
        muatAktivitasGlobal('/api/aktivitas-terbaru', 'tabel-aktivitas');
        if (typeof updateAngkaGlobal === "function") {
            updateAngkaGlobal('/api/total-anggota', 'total-anggota-display');
        }
    }

    // 3. Modal List Anggota
    function bukaModalAnggota() {
        const modal = new bootstrap.Modal(document.getElementById('modalAnggota'));
        const tbody = document.getElementById('list-anggota-modal');
        
        tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr>';
        modal.show();

        fetch('/api/list-anggota-lengkap')
            .then(res => res.json())
            .then(data => {
                let html = '';
                if(data.length > 0) {
                    data.forEach(user => {
                        html += `
                            <tr>
                                <td class="ps-4">
                                    <div class="fw-bold text-dark">${user.name}</div>
                                    <div class="text-muted small">${user.email}</div>
                                </td>
                                <td><span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">${user.nama_divisi}</span></td>
                                <td class="text-center">
                                    <a href="/edit-orang/${user.id}" class="btn btn-sm btn-outline-primary rounded-circle shadow-sm">
                                        <i class="bi bi-pencil-fill"></i>
                                    </a>
                                    <button onclick="hapusUser(${user.id}, '${user.name}')" class="btn btn-sm btn-outline-danger rounded-circle shadow-sm ms-1">
                                        <i class="bi bi-trash-fill"></i>
                                    </button>
                                </td>
                            </tr>`;
                    });
                } else {
                    html = '<tr><td colspan="3" class="text-center py-4">Data tidak ditemukan.</td></tr>';
                }
                tbody.innerHTML = html;
            });
    }

    // 4. Hapus User
    function hapusUser(id, nama) {
        if (confirm(`Apakah Anda yakin ingin menghapus "${nama}"?`)) {
            fetch(`/api/hapus-user/${id}`, {
                method: 'DELETE',
                headers: { 
                    'X-CSRF-TOKEN': '{{ csrf_token() }}',
                    'Content-Type': 'application/json'
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    refreshDashboard();
                    bukaModalAnggota();
                }
            });
        }
    }

    // Inisialisasi
    document.addEventListener('DOMContentLoaded', function() {
        refreshDashboard();
        updateTime();
        setInterval(refreshDashboard, 5000);
        setInterval(updateTime, 1000);
    });
</script>