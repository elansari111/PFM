<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreRoomReservationRequest extends FormRequest
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
            'classroom_id' => 'required|exists:classrooms,id',
            'module_id' => 'nullable|exists:modules,id',
            'date' => 'required|date|after:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'purpose' => 'required|string|min:5|max:500',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'classroom_id.required' => 'Classroom is required',
            'classroom_id.exists' => 'Classroom not found',
            'module_id.exists' => 'Module not found',
            'date.required' => 'Date is required',
            'date.date' => 'Invalid date format',
            'date.after' => 'Date must be after today',
            'start_time.required' => 'Start time is required',
            'start_time.date_format' => 'Invalid time format (use HH:MM)',
            'end_time.required' => 'End time is required',
            'end_time.date_format' => 'Invalid time format (use HH:MM)',
            'end_time.after' => 'End time must be after start time',
            'purpose.required' => 'Purpose is required',
            'purpose.min' => 'Purpose must be at least 5 characters',
            'purpose.max' => 'Purpose must not exceed 500 characters',
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
