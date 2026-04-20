<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['nama_kategori' => 'Penjualan Buku (S-SALUR)', 'jenis' => 'Masuk'],
            ['nama_kategori' => 'Donasi Umum', 'jenis' => 'Masuk'],
            ['nama_kategori' => 'Pemasukan Ajar', 'jenis' => 'Masuk'],

            ['nama_kategori' => 'Gaji & Honorarium', 'jenis' => 'Keluar'],
            ['nama_kategori' => 'Operasional Kantor', 'jenis' => 'Keluar'],
            ['nama_kategori' => 'Biaya Cetak Buku', 'jenis' => 'Keluar'],
            ['nama_kategori' => 'Transportasi & Logistik', 'jenis' => 'Keluar'],
            ['nama_kategori' => 'Makanan', 'jenis' => 'Keluar'],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(
                ['nama_kategori' => $cat['nama_kategori']],
                ['jenis' => $cat['jenis']]
            );
        }
    }
}
