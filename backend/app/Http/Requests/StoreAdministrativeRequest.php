<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreAdministrativeRequest extends FormRequest
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
            'type' => 'required|in:transcript,certificate,attestation,other',
            'title' => 'required|string|min:3|max:255',
            'description' => 'required|string|min:10|max:2000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'type.required' => 'Request type is required',
            'type.in' => 'Invalid request type',
            'title.required' => 'Title is required',
            'title.min' => 'Title must be at least 3 characters',
            'title.max' => 'Title must not exceed 255 characters',
            'description.required' => 'Description is required',
            'description.min' => 'Description must be at least 10 characters',
            'description.max' => 'Description must not exceed 2000 characters',
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
