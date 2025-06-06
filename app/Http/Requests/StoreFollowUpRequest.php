<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Carbon\Carbon;

class StoreFollowUpRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'message' => ['required', 'string', 'min:3', 'max:500'],
            'follow_up_at' => ['required', 'date', 'after:now'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'user_id.required' => 'Please select a user.',
            'user_id.exists' => 'The selected user does not exist.',
            'message.required' => 'Please enter a message.',
            'message.min' => 'The message must be at least 3 characters.',
            'message.max' => 'The message cannot be longer than 500 characters.',
            'follow_up_at.required' => 'Please select a follow-up date and time.',
            'follow_up_at.date' => 'Please provide a valid date and time.',
            'follow_up_at.after' => 'The follow-up date must be in the future.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('follow_up_at')) {
            // Parse the date in IST timezone
            $date = Carbon::parse($this->follow_up_at, 'Asia/Kolkata');
            
            // Store in UTC
            $this->merge([
                'follow_up_at' => $date->setTimezone('UTC')->format('Y-m-d H:i:s')
            ]);
        }
    }
} 