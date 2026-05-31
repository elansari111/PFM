<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GeneratedDocument extends Model
{
    protected $fillable = [
        'request_id',
        'student_id',
        'type',
        'title',
        'file_path',
        'file_type',
        'generated_by',
        'generated_at',
        'is_official',
        'reference_number',
    ];

    protected $casts = [
        'generated_at' => 'datetime',
        'is_official' => 'boolean',
    ];

    public function request()
    {
        return $this->belongsTo(AdministrativeRequest::class, 'request_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function generator()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}
