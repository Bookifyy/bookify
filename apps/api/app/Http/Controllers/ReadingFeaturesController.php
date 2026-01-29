<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Bookmark;
use App\Models\Note;
use App\Models\Highlight;
use App\Models\Flashcard;
use Illuminate\Support\Facades\Auth;

class ReadingFeaturesController extends Controller
{
    public function index($bookId)
    {
        $userId = Auth::id();

        return response()->json([
            'bookmarks' => Bookmark::where('user_id', $userId)->where('book_id', $bookId)->latest()->get(),
            'notes' => Note::where('user_id', $userId)->where('book_id', $bookId)->latest()->get(),
            'highlights' => Highlight::where('user_id', $userId)->where('book_id', $bookId)->latest()->get(),
            'flashcards' => Flashcard::where('user_id', $userId)->where('book_id', $bookId)->latest()->get(),
        ]);
    }

    // Bookmarks
    public function storeBookmark(Request $request, $bookId)
    {
        $request->validate([
            'page_number' => 'required|integer',
            'title' => 'nullable|string|max:255',
        ]);

        $bookmark = Bookmark::create([
            'user_id' => Auth::id(),
            'book_id' => $bookId,
            'page_number' => $request->page_number,
            'title' => $request->title ?? 'Page ' . $request->page_number,
        ]);

        return response()->json($bookmark, 201);
    }

    public function deleteBookmark($id)
    {
        $bookmark = Bookmark::where('id', $id)->where('user_id', Auth::id())->firstOrFail();
        $bookmark->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    // Notes
    public function storeNote(Request $request, $bookId)
    {
        $request->validate([
            'page_number' => 'required|integer',
            'content' => 'required|string',
            'color' => 'nullable|string|max:20',
        ]);

        $note = Note::create([
            'user_id' => Auth::id(),
            'book_id' => $bookId,
            'page_number' => $request->page_number,
            'content' => $request->content,
            'color' => $request->color ?? 'yellow',
        ]);

        return response()->json($note, 201);
    }

    public function deleteNote($id)
    {
        $note = Note::where('id', $id)->where('user_id', Auth::id())->firstOrFail();
        $note->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    // Highlights
    public function storeHighlight(Request $request, $bookId)
    {
        $request->validate([
            'page_number' => 'required|integer',
            'text_content' => 'required|string',
            'title' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:20',
            'range_start' => 'nullable|string',
            'range_end' => 'nullable|string',
        ]);

        $highlight = Highlight::create([
            'user_id' => Auth::id(),
            'book_id' => $bookId,
            'page_number' => $request->page_number,
            'text_content' => $request->text_content,
            'title' => $request->title,
            'color' => $request->color ?? 'yellow',
            'range_start' => $request->range_start,
            'range_end' => $request->range_end,
        ]);

        return response()->json($highlight, 201);
    }

    public function deleteHighlight($id)
    {
        $highlight = Highlight::where('id', $id)->where('user_id', Auth::id())->firstOrFail();
        $highlight->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    // Flashcards
    public function storeFlashcard(Request $request, $bookId)
    {
        $request->validate([
            'front_content' => 'required|string',
            'back_content' => 'required|string',
        ]);

        $flashcard = Flashcard::create([
            'user_id' => Auth::id(),
            'book_id' => $bookId,
            'front_content' => $request->front_content,
            'back_content' => $request->back_content,
        ]);

        return response()->json($flashcard, 201);
    }

    public function deleteFlashcard($id)
    {
        $flashcard = Flashcard::where('id', $id)->where('user_id', Auth::id())->firstOrFail();
        $flashcard->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
