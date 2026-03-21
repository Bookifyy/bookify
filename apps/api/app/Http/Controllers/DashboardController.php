<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ReadingProgress;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // 1. Fetch all reading progress with book & subject
        $progress = ReadingProgress::where('user_id', $user->id)
            ->with(['book.subject'])
            ->get();

        // 2. Books In Progress (0 to 99%)
        $booksInProgressModel = $progress->filter(function($p) {
            return $p->percentage_completed > 0 && $p->percentage_completed < 100;
        })->sortByDesc('last_read_at')->take(5);

        $booksInProgress = $booksInProgressModel->map(function($p) {
            return [
                'title' => $p->book ? $p->book->title : 'Unknown Title',
                'author' => ($p->book && $p->book->author) ? $p->book->author : 'Wait, Who Wrote This?',
                'progress' => (int) $p->percentage_completed
            ];
        })->values();

        // 3. Completed Books
        $completedBooks = $progress->filter(function($p) {
            return $p->percentage_completed >= 100;
        })->count();

        // 4. Study Distribution (Donut Chart)
        $subjectCounts = [];
        foreach ($progress as $p) {
            if ($p->book && $p->book->subject) {
                $subjName = $p->book->subject->name;
                if (!isset($subjectCounts[$subjName])) {
                    $subjectCounts[$subjName] = 0;
                }
                $subjectCounts[$subjName]++;
            }
        }
        
        $colors = ['#4f46e5', '#0ea5e9', '#0284c7', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#6366f1'];
        $studyDistribution = [];
        $colorIndex = 0;
        
        $totalSubjects = array_sum($subjectCounts);
        foreach ($subjectCounts as $name => $count) {
            $percentage = $totalSubjects > 0 ? round(($count / $totalSubjects) * 100) : 0;
            $studyDistribution[] = [
                'name' => $name,
                'value' => $percentage,
                'fill' => $colors[$colorIndex % count($colors)]
            ];
            $colorIndex++;
        }

        // 5. Weekly Activity Mock
        $weeklyActivity = [
            ['name' => 'Mon', 'minutes' => rand(30, 120)],
            ['name' => 'Tue', 'minutes' => rand(30, 120)],
            ['name' => 'Wed', 'minutes' => rand(30, 120)],
            ['name' => 'Thu', 'minutes' => rand(30, 120)],
            ['name' => 'Fri', 'minutes' => rand(30, 120)],
            ['name' => 'Sat', 'minutes' => rand(30, 120)],
            ['name' => 'Sun', 'minutes' => rand(30, 120)],
        ];

        return response()->json([
            'studyDistribution' => $studyDistribution,
            'booksInProgress' => $booksInProgress,
            'stats' => [
                'completedBooks' => $completedBooks,
                'streak' => rand(2, 14), 
                'thisWeekHours' => rand(4, 20),
                'readingSpeed' => rand(20, 45)
            ],
            'weeklyActivity' => $weeklyActivity
        ]);
    }
}
