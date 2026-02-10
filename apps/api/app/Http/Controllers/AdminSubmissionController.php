<?php

namespace App\Http\Controllers;

use App\Models\QuizAttempt;
use Illuminate\Http\Request;

class AdminSubmissionController extends Controller
{
    public function index()
    {
        // Fetch all attempts that are submitted (completed or pending_review)
        // We include 'quiz.book' to show book info as requested
        $attempts = QuizAttempt::with(['user', 'quiz.book'])
            ->whereIn('status', ['completed', 'pending_review'])
            ->latest()
            ->get();

        return response()->json($attempts);
    }

    public function show($id)
    {
        $attempt = QuizAttempt::with(['user', 'quiz.questions', 'answers', 'quiz.book'])
            ->findOrFail($id);

        return response()->json($attempt);
    }

    public function grade(Request $request, $id)
    {
        $attempt = QuizAttempt::findOrFail($id);

        $request->validate([
            'score' => 'required|numeric|min:0|max:100',
            'feedback' => 'nullable|string'
        ]);

        $attempt->update([
            'score' => $request->score,
            'status' => 'completed', // Mark as completed so user can see result
            // 'feedback' => $request->feedback // TODO: Add feedback column if needed
        ]);

        return response()->json(['message' => 'Quiz graded successfully.', 'attempt' => $attempt]);
    }
}
