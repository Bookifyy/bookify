<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation()
    {
        $this->merge([
            'is_premium' => filter_var($this->is_premium, FILTER_VALIDATE_BOOLEAN),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'subject_id' => 'required|exists:subjects,id',
            'description' => 'nullable|string',
            'isbn' => 'nullable|string|max:20',
            'language' => 'nullable|string|max:10',
            'publisher' => 'nullable|string|max:255',
            'is_premium' => 'nullable|boolean',
            'book_file' => 'required|file|mimes:pdf,epub|max:20480', // 20MB limit
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB limit
            'edition' => 'nullable|string|max:255',
            'format' => 'nullable|string|max:255',
            'print_length' => 'nullable|integer|min:1',
            'publication_date' => 'nullable|date',
            'accessibility' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'author_bio' => 'nullable|string',
            'author_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB limit
            'author_license' => 'nullable|string|max:255',
            'author_linkedin' => 'nullable|string|max:255',
            'rating' => 'nullable|numeric|min:0|max:5',
            'review_count' => 'nullable|integer|min:0',
        ];
    }
}
