<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreAbsenceJustificationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'reason' => 'required|string|min:10|max:1000',
            'document' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:5120',
            'absence_ids' => 'nullable|array',
            'absence_ids.*' => 'exists:absences,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'reason.required' => 'Reason is required',
            'reason.min' => 'Reason must be at least 10 characters',
            'reason.max' => 'Reason must not exceed 1000 characters',
            'document.mimes' => 'Document must be a PDF, DOC, DOCX, JPG, JPEG, or PNG file',
            'document.max' => 'Document must not exceed 5MB',
            'absence_ids.*.exists' => 'One or more selected absences do not exist',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
