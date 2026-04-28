<?php

namespace App\Http\Requests\Review;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'product_id' => ['required', 'uuid', 'exists:products,id'],
            'reviewer_name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email', 'string', 'max:255'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'body' => ['required', 'string', 'min:10', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'product_id.required' => 'A product is required.',
            'product_id.exists' => 'The selected product does not exist.',
            'reviewer_name.required' => 'Your name is required.',
            'reviewer_name.min' => 'Your name must be at least :min characters.',
            'reviewer_name.max' => 'Your name may not exceed :max characters.',
            'email.required' => 'Your email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'rating.required' => 'A rating is required.',
            'rating.integer' => 'The rating must be a whole number.',
            'rating.min' => 'The rating must be at least 1.',
            'rating.max' => 'The rating may not exceed 5.',
            'body.required' => 'A review body is required.',
            'body.min' => 'The review must be at least :min characters.',
            'body.max' => 'The review may not exceed :max characters.',
        ];
    }
}
