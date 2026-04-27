<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateCategoryRequest extends FormRequest
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
        $category = $this->route('category');

        return [
            'name' => ['sometimes', 'required', 'string', 'min:2', 'max:120'],
            'slug' => [
                'sometimes',
                'required',
                'string',
                'min:2',
                'max:160',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('categories', 'slug')
                    ->ignore($category instanceof Category ? $category : null)
                    ->whereNull('deleted_at'),
            ],
            'description' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'A category name is required when updating the name.',
            'name.min' => 'The category name must be at least :min characters.',
            'name.max' => 'The category name may not exceed :max characters.',
            'slug.required' => 'A slug is required when updating the slug.',
            'slug.min' => 'The slug must be at least :min characters.',
            'slug.max' => 'The slug may not exceed :max characters.',
            'slug.regex' => 'The slug may only contain lowercase letters, numbers, and single hyphens between segments (e.g. "home-and-kitchen").',
            'slug.unique' => 'This slug is already in use by another category.',
            'description.max' => 'The description may not exceed :max characters.',
        ];
    }
}
