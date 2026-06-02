<?php

namespace App\Services;

use PDF;
use App\Models\AdministrativeRequest;
use App\Models\Student;
use App\Models\Grade;
use Illuminate\Support\Facades\Storage;

class PdfService
{
    /**
     * Generate academic transcript PDF
     */
    public function generateTranscript(AdministrativeRequest $request)
    {
        $student = $request->student;
        $grades = Grade::whereHas('module', function($query) use ($student) {
            $query->where('group_id', $student->group_id);
        })->with('module')->get();

        $pdf = PDF::loadView('pdf.transcript', [
            'student' => $student,
            'grades' => $grades,
            'request' => $request,
        ]);

        $filename = 'transcript_' . $student->id . '_' . time() . '.pdf';
        $path = 'documents/' . $filename;
        
        Storage::disk('public')->put($path, $pdf->output());

        return $path;
    }

    /**
     * Generate certificate PDF
     */
    public function generateCertificate(AdministrativeRequest $request)
    {
        $student = $request->student;

        $pdf = PDF::loadView('pdf.certificate', [
            'student' => $student,
            'request' => $request,
        ]);

        $filename = 'certificate_' . $student->id . '_' . time() . '.pdf';
        $path = 'documents/' . $filename;
        
        Storage::disk('public')->put($path, $pdf->output());

        return $path;
    }

    /**
     * Generate attestation PDF
     */
    public function generateAttestation(AdministrativeRequest $request)
    {
        $student = $request->student;

        $pdf = PDF::loadView('pdf.attestation', [
            'student' => $student,
            'request' => $request,
        ]);

        $filename = 'attestation_' . $student->id . '_' . time() . '.pdf';
        $path = 'documents/' . $filename;
        
        Storage::disk('public')->put($path, $pdf->output());

        return $path;
    }

    /**
     * Generate document based on request type
     */
    public function generateDocument(AdministrativeRequest $request)
    {
        switch ($request->type) {
            case 'transcript':
                return $this->generateTranscript($request);
            case 'certificate':
                return $this->generateCertificate($request);
            case 'attestation':
                return $this->generateAttestation($request);
            default:
                throw new \Exception('Unsupported document type');
        }
    }
}
