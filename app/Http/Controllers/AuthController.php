<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Divisi;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function showRegister()
    {
        $divisi = Divisi::all();
        return view('register', compact('divisi'));
    }

    public function showLogin()
    {
        return view('login');
    }

    public function login(Request $request)
    {
        // 1. Validasi format input
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'password.required' => 'Password wajib diisi.',
        ]);

        // 2. Percobaan Login
        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();

            $user = Auth::user();

            // SINKRONISASI REDIRECT BERDASARKAN DIVISI
            switch ((int)$user->divisi_id) {
                case 1: return redirect()->intended('/dashboard');
                case 2: return redirect()->intended('/finance');
                case 3: return redirect()->intended('/penerbitan');
                case 4: return redirect()->intended('/marketing');
                case 5: return redirect()->intended('/produksi');
                case 6: return redirect()->intended('/logistik');
                default: return redirect()->intended('/dashboard');
            }
        }

        // 3. Jika gagal, kembalikan ke form dengan pesan error pada field email
        return back()->withErrors([
            'email' => 'Email atau password yang Anda masukkan salah.',
        ])->withInput($request->only('email'));
    }

    public function logout(Request $request)
    {
    auth()->logout();
    $request.session()->invalidate();
    $request.session()->regenerateToken();

    return redirect('/login');
    }

    public function register(Request $request)
    {
        // Validasi pendaftaran dengan pesan kustom
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'email'     => 'required|email|unique:users,email',
            'password'  => 'required|min:3',
            'divisi_id' => 'required|exists:divisi,id',
        ], [
            'name.required'      => 'Nama lengkap tidak boleh kosong.',
            'email.required'     => 'Alamat email wajib diisi.',
            'email.unique'       => 'Email ini sudah terdaftar, silakan gunakan email lain.',
            'password.min'       => 'Password minimal harus 3 karakter.',
            'divisi_id.required' => 'Silakan pilih divisi Anda.',
        ]);

        // Create User
        User::create([
            'name'      => $validated['name'],
            'email'     => $validated['email'],
            'password'  => Hash::make($validated['password']),
            'divisi_id' => $validated['divisi_id'],
        ]);

        // Redirect ke login dengan pesan sukses (Alert)
        return redirect('/login')->with('success', 'Registrasi berhasil! Silakan login.');
    }

    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email'     => 'required|email|unique:users,email',
            'password' => 'required|min:3',
            'divisi_id' => 'required|exists:divisi,id',
        ], [
            'email.required' => 'Email sudah terdaftar.',
            'divisi_id.required' => 'Divisi wajib dipilih.',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'divisi_id' => $validated['divisi_id'],
        ]);

        return back()->with('success', 'Anggota berhasil ditambahkan!');
    }
}
