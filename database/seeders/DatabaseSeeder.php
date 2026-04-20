<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Account;
use App\Models\Divisi;
use App\Models\Identitas;
use App\Models\Transaksi;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Faker\Factory as Faker;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        // --- 1. SEED DATA DIVISI ---
        $divisiData = [
            ['id' => 1, 'nama_divisi' => 'Direktorat & HRD', 'kode' => 'DIR'],
            ['id' => 2, 'nama_divisi' => 'Bendahara', 'kode' => 'KEU'],
            ['id' => 3, 'nama_divisi' => 'Penerbitan', 'kode' => 'PNB'],
            ['id' => 4, 'nama_divisi' => 'Marketing & Distribution', 'kode' => 'MAD'],
            ['id' => 5, 'nama_divisi' => 'Fundraising', 'kode' => 'FUN'],
            ['id' => 6, 'nama_divisi' => 'Logistik', 'kode' => 'LOG']
        ];

        foreach ($divisiData as $d) {
            DB::table('divisi')->updateOrInsert(['id' => $d['id']], $d);
        }

        Schema::disableForeignKeyConstraints();
        DB::table('bukus')->truncate();
        Schema::enableForeignKeyConstraints();

        $prefix = ['Dharma', 'Sutra', 'Meditasi', 'Jalan Tengah', 'Kebahagiaan'];
        $suffix = ['Siddharta', 'Gautama', 'Dunia', 'Batin', 'Kedamaian'];

        for ($i = 1; $i <= 50; $i++) {
            $judulDummy = $faker->randomElement($prefix) . ' ' . $faker->randomElement($suffix) . ' ' . $faker->word;
            DB::table('bukus')->insert([
                'judul'      => ucwords($judulDummy),
                'penulis'    => $faker->name,
                'harga_jual' => $faker->numberBetween(45, 180) * 1000,
                'stok_gudang'=> $faker->numberBetween(0, 100),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }


        $divisiIds = Divisi::pluck('id')->toArray();

        for ($i = 1; $i <= 50; $i++) {
            $identitas = Identitas::create([
                'nama_lengkap'      => strtoupper($faker->name),
                'nomor_identitas'   => $faker->nik(),
                'jenis_identitas'   => 'KTP',
                'divisi_id'         => $faker->randomElement($divisiIds),
                'status_keamanan'   => $faker->randomElement(['Normal', 'VIP', 'Pengawasan']),
                'jenis_umat'        => $faker->randomElement(['Umat', 'Sangha']),
                'bhante_lay'        => $faker->randomElement(['Bhante', 'Lay']),
                'nomor_hp_primary'  => $faker->phoneNumber,
                'is_agen_purna'     => $faker->boolean(20),
                'is_dharma_patriot' => $faker->boolean(15),
                'created_by'        => 1,
                'created_at'        => $faker->dateTimeBetween('-1 year', 'now'),
            ]);

            for ($j = 0; $j < rand(1, 3); $j++) {
                Transaksi::create([
                    'identitas_id'      => $identitas->id,
                    'jenis'             => $faker->randomElement(['DONASI', 'SALUR']),
                    'nominal'           => $faker->numberBetween(10, 500) * 1000,
                    'tanggal_transaksi' => $faker->dateTimeBetween('-6 months', 'now'),
                    'keterangan'        => 'Partisipasi program MIS',
                ]);
            }
        }
    }
}