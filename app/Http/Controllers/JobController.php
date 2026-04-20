<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;

class JobController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'identitas_id' => 'required|exists:identitas,id',
            'nama_job' => 'required|string|max:255',
            'job_advance' => 'required',
            'status_job' => 'required|in:Progres,Selesai,Pending,Batal',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_deadline' => 'nullable|date',
            'keterangan' => 'nullable|string',
        ]);

        Job::create($validated);

        return redirect()->back()->with('success', 'Tugas baru berhasil ditambahkan!');
    }

    public function update(Request $request, $id)
    {
    $job = Job::findOrFail($id);
    
    $validated = $request->validate([
        'nama_job' => 'required|string|max:255',
        'job_advance' => 'required',
        'status_job' => 'required|in:Progres,Selesai,Pending,Batal',
        'tanggal_mulai' => 'nullable|date',
        'tanggal_deadline' => 'nullable|date',
        'keterangan' => 'nullable|string',
    ]);

    $job->update($validated);

    return redirect()->back()->with('success', 'Data tugas berhasil diperbarui!');
    }

public function destroy($id)
    {
    $job = Job::findOrFail($id);
    $job->delete();

    return redirect()->back()->with('success', 'Tugas telah dihapus.');
    }
}