<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /*
         * Login validates only that the fields are present + email-shaped.
         * Password length / complexity rules belong in registration; on
         * login we accept any non-empty string and let the credential
         * check decide. Otherwise legacy accounts get locked out by a
         * length rule that only ever made sense at signup time.
         */
        return [
            'email' => ['required', 'email', 'string', 'max:255'],
            'password' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Please enter your email address.',
            'email.email' => 'The email address format is not valid.',
            'email.max' => 'The email address must not exceed 255 characters.',
            'password.required' => 'Please enter your password.',
        ];
    }
}
