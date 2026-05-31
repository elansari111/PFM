<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Classroom extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'capacity',
        'building',
        'floor',
        'equipment',
        'status',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'equipment' => 'array',
    ];

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    public function roomReservations()
    {
        return $this->hasMany(RoomReservation::class);
    }
}
