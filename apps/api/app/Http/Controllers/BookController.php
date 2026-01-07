<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use App\Http\Requests\StoreBookRequest;
use Illuminate\Support\Facades\Storage;

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response|\Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function index(Request $request)
    {
        $query = Book::with('subject');

        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%");
            });
        }

        return $query->latest()->paginate(20);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    public function store(StoreBookRequest $request)
    {
        try {
            $validated = $request->validated();

            // Handle File Upload
            if ($request->hasFile('book_file')) {
                $path = $request->file('book_file')->store('books', 'public');
                $validated['file_path'] = url(Storage::url($path));
            }

            // Handle Cover Image
            if ($request->hasFile('cover_image')) {
                $coverPath = $request->file('cover_image')->store('covers', 'public');
                $validated['cover_image'] = url(Storage::url($coverPath));
            }

            // Ensure is_premium is a boolean (handles string "true"/"false" from FormData)
            if (isset($validated['is_premium'])) {
                $validated['is_premium'] = filter_var($validated['is_premium'], FILTER_VALIDATE_BOOLEAN);
            }

            $book = Book::create($validated);

            return response()->json([
                'message' => 'Book uploaded successfully',
                'book' => $book->load('subject')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Upload failed: ' . $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Book  $book
     * @return \App\Models\Book
     */
    public function show(Book $book)
    {
        return $book->load('subject');
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Book  $book
     * @return \Illuminate\Http\Response
     */
    public function edit(Book $book)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Book  $book
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Book $book)
    {
        //
    }

}
