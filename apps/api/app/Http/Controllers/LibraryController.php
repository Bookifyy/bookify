<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\ReadingProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LibraryController extends Controller
{
    /**
     * Get the authenticated user's library.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $progress = ReadingProgress::where('user_id', $user->id)
            ->with(['book.subject'])
            ->latest('last_read_at')
            ->get();

        return response()->json($progress);
    }

    /**
     * Add a book to the user's library.
     */
    public function add(Request $request)
    {
        $request->validate([
            'book_id' => 'required|exists:books,id'
        ]);

        $user = $request->user();
        $bookId = $request->book_id;

        $progress = ReadingProgress::firstOrCreate(
            ['user_id' => $user->id, 'book_id' => $bookId],
            ['current_page' => 1, 'percentage_completed' => 0]
        );

        return response()->json([
            'message' => 'Book added to library',
            'progress' => $progress->load('book')
        ]);
    }

    /**
     * Update reading progress for a book.
     */
    public function updateProgress(Request $request, $bookId)
    {
        $request->validate([
            'current_page' => 'required|integer|min:1',
            'total_pages' => 'sometimes|integer|min:1'
        ]);

        $user = $request->user();

        $progress = ReadingProgress::where('user_id', $user->id)
            ->where('book_id', $bookId)
            ->first();

        $isNew = false;
        if (!$progress) {
            $progress = new ReadingProgress();
            $progress->user_id = $user->id;
            $progress->book_id = $bookId;
            $isNew = true;
        }

        $progress->current_page = $request->current_page;
        if ($request->has('total_pages')) {
            $progress->total_pages = $request->total_pages;
        }

        if ($progress->total_pages > 0) {
            $progress->percentage_completed = ($progress->current_page / $progress->total_pages) * 100;
        }

        $progress->last_read_at = now();
        $progress->save();

        // Notify groups if just started (New record & > 0% progress)
        if ($isNew && $progress->percentage_completed > 0) {
            try {
                // Find groups where this user is a member
                $groups = \App\Models\Group::whereHas('members', function ($q) use ($user) {
                    $q->where('user_id', $user->id)->where('status', 'active');
                })->get();

                $book = Book::find($bookId);

                foreach ($groups as $group) {
                    // Notify other members of the group
                    $members = $group->members()->where('user_id', '!=', $user->id)->where('status', 'active')->get();
                    foreach ($members as $member) {
                        \App\Models\Notification::create([
                            'user_id' => $member->user_id,
                            'type' => 'book_started', // New type
                            'data' => [
                                'group_id' => $group->id,
                                'group_name' => $group->name,
                                'book_title' => $book ? $book->title : 'Unknown Book',
                                'user_name' => $user->name,
                                'book_id' => $bookId
                            ]
                        ]);
                    }
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to send book started notification: " . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Progress updated',
            'progress' => $progress
        ]);
    }
}
