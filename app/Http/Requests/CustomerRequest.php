<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => 'required|max:50',
            'last_name' => 'nullable|max:50',
            'age' => 'nullable|integer|between:0,150',
            'dob' => 'required|date',
            'email' => ['required', 'email', Rule::unique('customers')->ignore($this->customer)]
        ];
    }

    public function messages()
    {
        return [
            'first_name.required' => 'Please enter the first name.',
            'first_name.max' => 'First name cannot exceed 50 characters.',
            'last_name.max' => 'Last name cannot exceed 50 characters.',
            'age.integer' => 'Age must be a number.',
            'age.min' => 'Age cannot be negative.',
            'age.max' => 'Age cannot exceed 150.',
            'dob.required' => 'Please enter the date of birth.',
            'dob.date' => 'Please enter a valid date.',
            'email.required' => 'Please enter an email address.',
            'email.email' => 'Please enter a valid email address.',
            'email.max' => 'Email cannot exceed 100 characters.',
            'email.unique' => 'This email address is already in use.',
        ];
    }
} 