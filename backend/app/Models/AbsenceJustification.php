<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AbsenceJustification extends Model
{
    protected $fillable = [
        'student_id',
        'reason',
        'document_path',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function absences()
    {
        return $this->hasMany(Absence::class, 'justification_id');
    }
}
