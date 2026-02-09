<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Question;
use Illuminate\Http\Request;

class AdminQuizController extends Controller
{
    // List all quizzes for admin
    public function index()
    {
        $quizzes = Quiz::with('book')
            ->withCount(['questions', 'attempts'])
            ->latest()
            ->get();
        return response()->json($quizzes);
    }

    // Create a new quiz
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'book_id' => 'nullable|exists:books,id',
            'time_limit_minutes' => 'integer|min:1',
            'passing_score' => 'integer|min:0|max:100',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx|max:10240', // Max 10MB
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('quiz-attachments', 'public');
        }

        $quiz = Quiz::create([
            'title' => $request->title,
            'description' => $request->description,
            'book_id' => $request->book_id,
            'time_limit_minutes' => $request->time_limit_minutes ?? 30,
            'passing_score' => $request->passing_score ?? 70,
            'created_by' => $request->user()->id,
            'attachment_path' => $attachmentPath
        ]);

        return response()->json($quiz, 201);
    }

    // Get quiz details including questions
    public function show($id)
    {
        $quiz = Quiz::with(['questions', 'book', 'attempts.user'])->findOrFail($id);
        return response()->json($quiz);
    }

    // Add a question to a quiz
    public function addQuestion(Request $request, $id)
    {
        $quiz = Quiz::findOrFail($id);

        $request->validate([
            'question_text' => 'required|string',
            'type' => 'required|in:multiple_choice,true_false',
            'options' => 'required_if:type,multiple_choice|array',
            'correct_answer' => 'required|string',
            'points' => 'integer|min:1'
        ]);

        $question = $quiz->questions()->create([
            'question_text' => $request->question_text,
            'type' => $request->type,
            'options' => $request->options,
            'correct_answer' => $request->correct_answer,
            'points' => $request->points ?? 1
        ]);

        return response()->json($question, 201);
    }

    // Delete a quiz
    public function destroy($id)
    {
        $quiz = Quiz::findOrFail($id);
        $quiz->delete();
        return response()->json(['message' => 'Quiz deleted successfully']);
    }

    // Delete a question
    public function destroyQuestion($id, $questionId)
    {
        $question = Question::where('quiz_id', $id)->findOrFail($questionId);
        $question->delete();
        return response()->json(['message' => 'Question deleted successfully']);
    }
}
