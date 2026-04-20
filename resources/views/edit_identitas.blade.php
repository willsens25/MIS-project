<!DOCTYPE html>
<html>
<head>
    <title>Edit Identitas</title>
    <style>
        body { font-family: sans-serif; margin: 40px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; font-weight: bold; margin-bottom: 5px; }
        input, select, textarea { width: 100%; padding: 8px; box-sizing: border-box; }
        button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
    </style>
</head>
<body>
    <h2>Edit Data Identitas</h2>

    <form action="/update-orang/{{ $orang->id }}" method="POST">
        @csrf
        <div class="form-group">
            <label>Nama Lengkap:</label>
            <input type="text" name="nama_lengkap" value="{{ $orang->nama_lengkap }}" required>
        </div>

        <div class="form-group">
            <label>Email:</label>
            <input type="email" name="email" value="{{ $orang->email }}" required>
        </div>

        <div class="form-group">
            <label>No. HP:</label>
            <input type="text" name="no_hp" value="{{ $orang->no_hp }}">
        </div>

        <div class="form-group">
            <label>Alamat:</label>
            <textarea name="alamat" rows="3">{{ $orang->alamat }}</textarea>
        </div>

        <div class="form-group">
            <label>Divisi:</label>
            <select name="divisi_id" required>
                @foreach($divisi as $d)
                    <option value="{{ $d->id }}" {{ $d->id == $orang->divisi_id ? 'selected' : '' }}>
                        {{ $d->kode }} - {{ $d->nama_divisi }}
                    </option>
                @endforeach
            </select>
        </div>

        <button type="submit">Update Data</button>
        <a href="/tambah-orang">Batal</a>
    </form>
</body>
</html>