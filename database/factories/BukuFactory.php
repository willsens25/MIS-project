<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class BukuFactory extends Factory
{
    protected $model = \App\Models\Buku::class;

    public function definition(): array
    {
        return [
            'judul' => $this->faker->sentence(3),
            'penulis' => $this->faker->name(),
            'harga_jual' => $this->faker->numberBetween(50000, 200000),
            'stok_gudang' => $this->faker->numberBetween(1, 100),
        ];
    }
}
