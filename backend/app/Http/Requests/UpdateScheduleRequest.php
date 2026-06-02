<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateScheduleRequest extends FormRequest
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
            'module_id' => 'nullable|exists:modules,id',
            'classroom_id' => 'nullable|exists:classrooms,id',
            'day_of_week' => 'nullable|in:monday,tuesday,wednesday,thursday,friday,saturday',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'type' => 'nullable|in:lecture,lab,exam,tutorial',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'module_id.exists' => 'Module not found',
            'classroom_id.exists' => 'Classroom not found',
            'day_of_week.in' => 'Day of week must be a valid day (monday, tuesday, wednesday, thursday, friday, saturday)',
            'start_time.date_format' => 'Invalid time format (use HH:MM)',
            'end_time.date_format' => 'Invalid time format (use HH:MM)',
            'end_time.after' => 'End time must be after start time',
            'type.in' => 'Invalid type',
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
