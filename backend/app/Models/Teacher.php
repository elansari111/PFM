<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'employee_number', 'first_name', 'last_name', 'specialization', 'hire_date'];

    protected $casts = [
        'hire_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function modules()
    {
        return $this->hasMany(Module::class, 'teacher_id');
    }

    public function administrativeRequests()
    {
        return $this->hasMany(AdministrativeRequest::class);
    }
}
