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
        $quizzes = Quiz::with('book')
            ->withCount('questions')
            ->get();

        // Attach user's latest attempt status
        $user = request()->user();
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

        return response()->json($quiz);
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
            return response()->json([
                'message' => 'You already have an active attempt.',
                'attempt' => $existingAttempt
            ]);
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

        $request->validate([
            'attachment' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            'answers' => 'nullable|array' // Optional if attachment is provided
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('quiz-submissions', 'public');
        }

        // If file is uploaded but no answers, mark as pending review (or completed with 0 score for now)
        // If answers are provided, grade them as usual

        $answers = $request->input('answers') ?? []; // Array of {question_id, user_answer}
        $totalScore = 0;
        $maxScore = 0;

        DB::beginTransaction();
        try {
            // Process structured questions if any
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

            // If we have an attachment, the score might need manual grading.
            // For now, we calculate score based on structured answers only.
            // If strictly file-based, maxScore might be 0 here if no questions exist.

            $percentageObj = ($maxScore > 0) ? round(($totalScore / $maxScore) * 100) : 0;

            // If manually uploaded file exists, maybe set status to 'pending_review' instead of completed?
            // For simplicity based on user request, we mark as completed.

            $attempt->update([
                'status' => 'completed',
                'score' => $percentageObj,
                'completed_at' => now(),
                'attachment_path' => $attachmentPath
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Quiz submitted successfully.',
                'score' => $percentageObj,
                'passed' => $percentageObj >= $quiz->passing_score,
                'attempt' => $attempt
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Submission failed', 'details' => $e->getMessage()], 500);
        }
    }
}
