<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Absence extends Model
{
    protected $fillable = [
        'student_id',
        'module_id',
        'schedule_id',
        'date',
        'status',
        'justification_id',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    public function justification()
    {
        return $this->belongsTo(AbsenceJustification::class, 'justification_id');
    }
}
