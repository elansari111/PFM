<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CourseMaterial extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'module_id',
        'title',
        'description',
        'file_path',
        'file_type',
        'file_size',
        'uploaded_by',
        'status',
        'published_at',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'published_at' => 'datetime',
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }
}
