<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('module_id')->constrained('modules')->onDelete('cascade');
            $table->enum('grade_type', ['cc1', 'cc2', 'exam', 'final']);
            $table->decimal('score', 5, 2); // e.g., 15.50 out of 20
            $table->decimal('max_score', 5, 2)->default(20);
            $table->date('date');
            $table->text('comments')->nullable();
            $table->timestamps();
            
            $table->index(['student_id']);
            $table->index(['module_id']);
            $table->index(['grade_type']);
            $table->index(['date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
