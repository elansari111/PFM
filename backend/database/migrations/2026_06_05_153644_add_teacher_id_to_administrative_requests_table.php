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
        Schema::table('administrative_requests', function (Blueprint $table) {
            $table->foreignId('student_id')->nullable()->change();
            $table->foreignId('teacher_id')->nullable()->constrained('teachers')->onDelete('cascade')->after('student_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('administrative_requests', function (Blueprint $table) {
            $table->dropForeign(['teacher_id']);
            $table->dropColumn('teacher_id');
            $table->foreignId('student_id')->nullable(false)->change();
        });
    }
};
