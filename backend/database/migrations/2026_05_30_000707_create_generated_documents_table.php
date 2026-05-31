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
        Schema::create('generated_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->nullable()->constrained('administrative_requests')->onDelete('set null');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->enum('type', ['transcript', 'certificate', 'attestation', 'grade_report', 'other']);
            $table->string('title');
            $table->string('file_path');
            $table->string('file_type'); // pdf, docx, etc.
            $table->foreignId('generated_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('generated_at');
            $table->boolean('is_official')->default(false);
            $table->string('reference_number')->nullable();
            $table->timestamps();
            
            $table->index(['request_id']);
            $table->index(['student_id']);
            $table->index(['type']);
            $table->index(['generated_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('generated_documents');
    }
};
