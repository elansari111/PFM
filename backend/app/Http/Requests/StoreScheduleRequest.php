<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreScheduleRequest extends FormRequest
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
            'module_id' => 'required|exists:modules,id',
            'classroom_id' => 'required|exists:classrooms,id',
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'type' => 'required|in:lecture,lab,exam,tutorial',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'module_id.required' => 'Module is required',
            'module_id.exists' => 'Module not found',
            'classroom_id.required' => 'Classroom is required',
            'classroom_id.exists' => 'Classroom not found',
            'day_of_week.required' => 'Day of week is required',
            'day_of_week.in' => 'Day of week must be a valid day (monday, tuesday, wednesday, thursday, friday, saturday)',
            'start_time.required' => 'Start time is required',
            'start_time.date_format' => 'Invalid time format (use HH:MM)',
            'end_time.required' => 'End time is required',
            'end_time.date_format' => 'Invalid time format (use HH:MM)',
            'end_time.after' => 'End time must be after start time',
            'type.required' => 'Type is required',
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
