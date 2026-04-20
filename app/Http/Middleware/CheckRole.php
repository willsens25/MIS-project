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
     * @param  \Closure  $next
     * @param  string  ...$roles
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        if (in_array((string)$user->divisi_id, $roles)) {
            return $next($request);
        }

        // 3. Lempar balik jika tidak ada akses
        return redirect('/dashboard')->with('error', 'Maaf, divisi Anda tidak memiliki izin untuk mengakses halaman tersebut.');
    }
}
