<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

trait UploadsSecureProcessing
{
    /**
     * Store an uploaded file securely with a unique obfuscated name.
     *
     * @param UploadedFile $file
     * @param string $directory
     * @param string $disk
     * @return string
     */
    public function storeSecurely(UploadedFile $file, string $directory, string $disk = 'public'): string
    {
        // Get extension safely
        $extension = $file->getClientOriginalExtension();
        if (empty($extension)) {
            $extension = $file->guessExtension() ?? 'bin';
        }

        // Clean extension and force lowercase
        $extension = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $extension));

        // Generate obfuscated filename
        $secureName = Str::uuid()->toString() . '_' . time() . '.' . $extension;

        // Store the file and return the path
        return $file->storeAs($directory, $secureName, $disk);
    }
}
