<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to this request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['sometimes', 'required', 'uuid', 'exists:categories,id'],
            'name' => ['sometimes', 'required', 'string', 'min:2', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'price' => ['sometimes', 'required', 'integer', 'min:0'],
            'stock_qty' => ['sometimes', 'required', 'integer', 'min:0'],
            'is_published' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'category_id.required' => 'A category is required.',
            'category_id.exists' => 'The selected category does not exist.',
            'name.required' => 'A product name is required.',
            'name.min' => 'The product name must be at least :min characters.',
            'name.max' => 'The product name may not exceed :max characters.',
            'description.max' => 'The description may not exceed :max characters.',
            'price.required' => 'A price is required.',
            'price.integer' => 'The price must be a whole number.',
            'price.min' => 'The price cannot be negative.',
            'stock_qty.required' => 'The stock quantity is required.',
            'stock_qty.integer' => 'The stock quantity must be a whole number.',
            'stock_qty.min' => 'The stock quantity cannot be negative.',
        ];
    }
}
