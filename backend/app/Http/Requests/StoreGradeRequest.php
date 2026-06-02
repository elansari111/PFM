<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreGradeRequest extends FormRequest
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
            'student_id' => 'required|exists:students,id',
            'module_id' => 'required|exists:modules,id',
            'grade_type' => 'required|in:cc1,cc2,exam,final',
            'score' => 'required|numeric|min:0|max:20',
            'date' => 'nullable|date',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'student_id.required' => 'Student is required',
            'student_id.exists' => 'Student not found',
            'module_id.required' => 'Module is required',
            'module_id.exists' => 'Module not found',
            'grade_type.required' => 'Grade type is required',
            'grade_type.in' => 'Invalid grade type',
            'score.required' => 'Score is required',
            'score.numeric' => 'Score must be a number',
            'score.min' => 'Score must be at least 0',
            'score.max' => 'Score must not exceed 20',
            'date.date' => 'Invalid date format',
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
