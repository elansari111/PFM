<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code', 'description', 'capacity', 'level_id'];

    public function students()
    {
        return $this->hasMany(Student::class);
    }

    public function modules()
    {
        return $this->hasMany(Module::class);
    }
}
