<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

final class IndexProductRequest extends FormRequest
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
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'category_id' => ['sometimes', 'uuid', 'exists:categories,id'],
        ];
    }
}
