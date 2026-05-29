<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    protected $fillable = ['name', 'code', 'description', 'capacity', 'level_id'];

    public function students()
    {
        return $this->hasMany(Student::class);
    }
}
