<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizAnswer;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuizController extends Controller
{
    // List available quizzes for the student
    public function index()
    {
        $user = request()->user();

        $query = Quiz::with('book')
            ->withCount('questions');

        // Filter: Show quizzes that are NOT linked to a book OR linked to a book the user has started reading
        if ($user) {
            $startedBookIds = \App\Models\ReadingProgress::where('user_id', $user->id)->pluck('book_id');

            $query->where(function ($q) use ($startedBookIds) {
                $q->whereNull('book_id')
                    ->orWhereIn('book_id', $startedBookIds);
            });
        }

        $quizzes = $query->get();

        // Attach user's latest attempt status
        if ($user) {
            $quizzes->each(function ($quiz) use ($user) {
                $latestAttempt = QuizAttempt::where('user_id', $user->id)
                    ->where('quiz_id', $quiz->id)
                    ->latest()
                    ->first();
                $quiz->latest_attempt = $latestAttempt;
            });
        }

        return response()->json($quizzes);
    }

    // Get specific quiz details
    public function show($id)
    {
        $quiz = Quiz::with('book')->findOrFail($id);

        // If user has an active attempt, return questions too
        $user = request()->user();
        $activeAttempt = QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $id)
            ->where('status', 'in_progress')
            ->first();

        if ($activeAttempt) {
            $quiz->load([
                'questions' => function ($q) {
                    $q->select('id', 'quiz_id', 'question_text', 'type', 'options', 'points'); // Hide correct_answer
                }
            ]);
            $quiz->active_attempt = $activeAttempt;
        }

        return response()->json([
            'quiz' => $quiz,
            'server_time' => now()->toIso8601String()
        ]);
    }

    // Start a quiz attempt
    public function start(Request $request, $id)
    {
        $user = $request->user();
        $quiz = Quiz::findOrFail($id);

        // Check for existing active attempt
        $existingAttempt = QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $id)
            ->where('status', 'in_progress')
            ->first();

        if ($existingAttempt) {
            // Check if it's expired
            $startedAt = \Carbon\Carbon::parse($existingAttempt->started_at);
            $limitMinutes = $quiz->time_limit_minutes;

            if ($startedAt->addMinutes($limitMinutes)->isPast()) {
                // Time limit has passed. Mark as expired and allow a new attempt.
                $existingAttempt->update(['status' => 'expired']);
            } else {
                return response()->json([
                    'message' => 'You already have an active attempt.',
                    'attempt' => $existingAttempt
                ]);
            }
        }

        // Check for max attempts (Limit: 2)
        $attemptsCount = QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $id)
            ->whereIn('status', ['completed', 'pending_review'])
            ->count();

        if ($attemptsCount >= 2) {
            return response()->json(['message' => 'Maximum attempts (2) reached for this quiz.'], 403);
        }

        $attempt = QuizAttempt::create([
            'user_id' => $user->id,
            'quiz_id' => $id,
            'started_at' => now(),
            'status' => 'in_progress'
        ]);

        return response()->json([
            'message' => 'Quiz started successfully.',
            'attempt' => $attempt
        ]);
    }

    // Submit quiz answers
    public function submit(Request $request, $id)
    {
        $user = $request->user();
        $quiz = Quiz::with('questions')->findOrFail($id);

        $attempt = QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $id)
            ->where('status', 'in_progress')
            ->firstOrFail();

        // --- VALIDATION RULES ---
        $hasQuestions = $quiz->questions->count() > 0;
        $hasAttachment = !empty($quiz->attachment_path);

        $rules = [
            'answers' => 'nullable|array',
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
        ];

        if ($hasAttachment) {
            $rules['attachment'] = 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240';
        }

        $request->validate($rules);

        // --- HANDLE SUBMISSION ---
        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            if (!$hasAttachment && $hasQuestions) {
                return response()->json(['message' => 'File submission is not allowed for this quiz.'], 422);
            }
            $attachmentPath = $request->file('attachment')->store('quiz-submissions', 'public');
        }

        $answers = $request->input('answers') ?? [];
        $totalScore = 0;
        $maxScore = 0;

        DB::beginTransaction();
        try {
            if ($hasQuestions) {
                foreach ($quiz->questions as $question) {
                    $maxScore += $question->points;
                    $userAnswerData = collect($answers)->firstWhere('question_id', $question->id);
                    $userValue = $userAnswerData ? $userAnswerData['user_answer'] : null;

                    $isCorrect = false;
                    if ($userValue && strtolower(trim($userValue)) === strtolower(trim($question->correct_answer))) {
                        $isCorrect = true;
                        $totalScore += $question->points;
                    }

                    if ($userValue !== null) {
                        QuizAnswer::create([
                            'quiz_attempt_id' => $attempt->id,
                            'question_id' => $question->id,
                            'user_answer' => $userValue,
                            'is_correct' => $isCorrect
                        ]);
                    }
                }
            }

            $percentageObj = ($maxScore > 0) ? round(($totalScore / $maxScore) * 100) : 0;

            // --- DETERMINE STATUS ---
            // ALL submissions go to 'pending_review' for manual grading by Admin.
            // We save the auto-calculated score for Admin reference, but status is pending.
            $status = 'pending_review';

            $attempt->update([
                'status' => $status,
                'score' => $percentageObj, // Saved for admin, but pending review
                'completed_at' => now(),
                'attachment_path' => $attachmentPath
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Submission received. Your quiz will be graded shortly.',
                'score' => null, // Hide score
                'passed' => null,
                'status' => $status,
                'attempt' => $attempt
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Submission failed', 'details' => $e->getMessage()], 500);
        }
    }
}
