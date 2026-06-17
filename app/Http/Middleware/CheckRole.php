<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // 1. Amankan jika user belum terautentikasi
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        // 2. Izinkan akses jika divisi_id user terdaftar di dalam parameter middleware
        if (in_array((string) $user->divisi_id, $roles, true)) {
            return $next($request);
        }

        // 3. Kembalikan ke dashboard jika tidak memiliki hak akses (Sesuai logic awal)
        return redirect('/dashboard')->with('error', 'Maaf, divisi Anda tidak memiliki izin untuk mengakses halaman tersebut.');
    }
}
