<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;
use App\Http\Controllers\AuthController;
use App\Models\Book;
use App\Models\Subject;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned to the "api" middleware group. Enjoy building your API!
|
*/

use App\Http\Controllers\VerificationController;
use App\Http\Controllers\NewPasswordController;
use App\Http\Controllers\AdminController;

use App\Http\Controllers\SocialAuthController;

// ... imports

// --- Diagnostic Routes ---
Route::get('/', function () {
    return response()->json(['status' => 'Bookify API is running', 'time' => now()]);
});


Route::get('/db-check', function () {
    try {
        $tables = \Illuminate\Support\Facades\DB::select('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != \'pg_catalog\' AND schemaname != \'information_schema\'');
        if (empty($tables) && config('database.default') === 'mysql') {
            $tables = \Illuminate\Support\Facades\DB::select('SHOW TABLES');
        }

        $books = Book::with('subject')->latest()->limit(5)->get();

        return response()->json([
            'status' => 'success',
            'app_url' => config('app.url'),
            'env' => config('app.env'),
            'db' => [
                'connection' => config('database.default'),
                'database' => \Illuminate\Support\Facades\DB::connection()->getDatabaseName(),
                'tables' => $tables,
                'subjects_count' => Subject::count(),
                'books_count' => Book::count(),
            ],
            'last_5_books' => $books,
            'storage' => [
                'books_path' => storage_path('app/public/books'),
                'books_exists' => File::exists(storage_path('app/public/books')),
                'books_writable' => is_writable(storage_path('app/public/books')),
                'public_disk_root' => config('filesystems.disks.public.root'),
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], 500);
    }
});
// --- End Diagnostic Routes ---

// Public Routes
Route::middleware(['throttle:auth'])->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::post('/forgot-password', [NewPasswordController::class, 'forgotPassword']);
Route::post('/reset-password', [NewPasswordController::class, 'reset'])->name('password.reset');

// Social Auth
Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirectToProvider']);
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);

// Protected Routes
Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user()->load('roles');
    });

    // Groups
    Route::get('/groups', [GroupController::class, 'index']);
    Route::post('/groups', [GroupController::class, 'store']);
    Route::get('/groups/{id}', [GroupController::class, 'show']);
    Route::post('/groups/{id}/join', [GroupController::class, 'join']);
    Route::post('/groups/{id}/leave', [GroupController::class, 'leave']);
    Route::post('/groups/{id}/invite', [GroupController::class, 'invite']);

    // Group Books
    Route::post('/groups/{id}/books', [GroupController::class, 'addBook']);

    // Group Chat
    Route::get('/groups/{id}/messages', [GroupChatController::class, 'index']);
    Route::post('/groups/{id}/messages', [GroupChatController::class, 'store']);

    // Email Verification
    Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])->name('verification.verify');
    Route::post('/email/resend', [VerificationController::class, 'resend'])->name('verification.send');

    // Admin Routes
    Route::group(['middleware' => ['role:Admin']], function () {
        Route::get('/admin/users', [AdminController::class, 'index']);
        Route::post('/admin/users/{id}/role', [AdminController::class, 'assignRole']);

        // Book Management
        Route::post('/books', [\App\Http\Controllers\BookController::class, 'store']);
    });

    // General Book & Subject Routes
    Route::get('/books', function (Request $request) {
        $query = Book::with('subject')->latest();
        // ... (existing code)
        // We need to add a similar mapping for Quizzes if we want to expose the full URL
        // But for now, let's just make sure the QuizController returns the correct URL
        // Actually, the storage link logic handles /storage prefix.
        // We will modify the QuizController to append the full URL or handle it in Frontend.
        // Let's stick to the current plan and handle URL generation in the Controller or Model accessor.
        // Let's stick to the current plan and handle URL generation in the Controller or Model accessor.

        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        $books = $query->paginate(20);

        // Map to ensure relative URLs starting with /storage
        $books->through(function ($book) {
            if ($book->cover_image) {
                $path = parse_url($book->cover_image, PHP_URL_PATH) ?? $book->cover_image;
                $book->cover_image = '/' . ltrim($path, '/');
                if (!str_starts_with($book->cover_image, '/storage') && !str_starts_with($book->cover_image, 'http')) {
                    $book->cover_image = '/storage/' . ltrim($book->cover_image, '/');
                }
            }
            if ($book->file_path) {
                $path = parse_url($book->file_path, PHP_URL_PATH) ?? $book->file_path;
                $book->file_path = '/' . ltrim($path, '/');
                if (!str_starts_with($book->file_path, '/storage') && !str_starts_with($book->file_path, 'http')) {
                    $book->file_path = '/storage/' . ltrim($book->file_path, '/');
                }
            }
            return $book;
        });

        return $books;
    });

    Route::get('/books/{book}', function (Book $book) {
        $book->load('subject');
        if ($book->cover_image) {
            $path = parse_url($book->cover_image, PHP_URL_PATH) ?? $book->cover_image;
            $book->cover_image = '/' . ltrim($path, '/');
        }
        if ($book->file_path) {
            $path = parse_url($book->file_path, PHP_URL_PATH) ?? $book->file_path;
            $book->file_path = '/' . ltrim($path, '/');
        }

        // Attach progress if user is authenticated
        if (request()->user()) {
            $progress = \App\Models\ReadingProgress::where('user_id', request()->user()->id)
                ->where('book_id', $book->id)
                ->first();
            if ($progress) {
                $book->progress = $progress;
            }
        }

        return $book;
    });

    // Library & Progress
    Route::get('/library', [\App\Http\Controllers\LibraryController::class, 'index']);
    Route::post('/library/add', [\App\Http\Controllers\LibraryController::class, 'add']);
    Route::post('/books/{id}/progress', [\App\Http\Controllers\LibraryController::class, 'updateProgress']);
    Route::get('/books/{book}/view', function (Book $book) {
        $path = $book->file_path;

        // If it's an absolute URL, extract the path part
        if (str_starts_with($path, 'http')) {
            $path = parse_url($path, PHP_URL_PATH);
        }

        // Strip /storage/ if present to get the path relative to public disk
        $path = str_replace('/storage/', '', $path);
        $path = ltrim($path, '/');

        if (!\Illuminate\Support\Facades\Storage::disk('public')->exists($path)) {
            abort(404, 'File not found on storage: ' . $path);
        }
        return \Illuminate\Support\Facades\Storage::disk('public')->response($path);
    });

    Route::get('/subjects', [\App\Http\Controllers\SubjectController::class, 'index']);

    // Global Reading Features (All Books)
    Route::get('/reading-features', [App\Http\Controllers\ReadingFeaturesController::class, 'getAllUserFeatures']);

    // Reading Features Routes
    Route::group(['prefix' => 'books/{bookId}'], function () {
        Route::get('/features', [App\Http\Controllers\ReadingFeaturesController::class, 'index']);

        Route::post('/bookmarks', [App\Http\Controllers\ReadingFeaturesController::class, 'storeBookmark']);
        Route::delete('/bookmarks/{id}', [App\Http\Controllers\ReadingFeaturesController::class, 'deleteBookmark']);

        Route::post('/notes', [App\Http\Controllers\ReadingFeaturesController::class, 'storeNote']);
        Route::delete('/notes/{id}', [App\Http\Controllers\ReadingFeaturesController::class, 'deleteNote']);

        Route::post('/highlights', [App\Http\Controllers\ReadingFeaturesController::class, 'storeHighlight']);
        Route::delete('/highlights/{id}', [App\Http\Controllers\ReadingFeaturesController::class, 'deleteHighlight']);

        Route::post('/flashcards', [App\Http\Controllers\ReadingFeaturesController::class, 'storeFlashcard']);
        Route::delete('/flashcards/{id}', [App\Http\Controllers\ReadingFeaturesController::class, 'deleteFlashcard']);
    });

    // --- Quiz Routes (Student) ---
    Route::get('/quizzes', [\App\Http\Controllers\QuizController::class, 'index']);
    Route::get('/quizzes/{id}', [\App\Http\Controllers\QuizController::class, 'show']);
    Route::post('/quizzes/{id}/start', [\App\Http\Controllers\QuizController::class, 'start']);
    Route::post('/quizzes/{id}/submit', [\App\Http\Controllers\QuizController::class, 'submit']);

    // --- Admin Quiz Routes ---
    Route::group(['prefix' => 'admin', 'middleware' => ['role:Admin']], function () {
        Route::get('/quizzes', [\App\Http\Controllers\AdminQuizController::class, 'index']);
        Route::post('/quizzes', [\App\Http\Controllers\AdminQuizController::class, 'store']);
        Route::get('/quizzes/{id}', [\App\Http\Controllers\AdminQuizController::class, 'show']);
        Route::delete('/quizzes/{id}', [\App\Http\Controllers\AdminQuizController::class, 'destroy']);

        // Question Management
        Route::post('/quizzes/{id}/questions', [\App\Http\Controllers\AdminQuizController::class, 'addQuestion']);
        Route::delete('/quizzes/{id}/questions/{questionId}', [\App\Http\Controllers\AdminQuizController::class, 'destroyQuestion']);

        // Quiz Submissions & Grading
        Route::get('/submissions', [\App\Http\Controllers\AdminSubmissionController::class, 'index']);
        Route::get('/submissions/{id}', [\App\Http\Controllers\AdminSubmissionController::class, 'show']);
        Route::post('/submissions/{id}/grade', [\App\Http\Controllers\AdminSubmissionController::class, 'grade']);
    });


    // Temporary Migration Route (Delete after use)
    Route::get('/migrate-groups', function () {
        try {
            \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
            return response()->json([
                'message' => 'Migration completed successfully',
                'output' => \Illuminate\Support\Facades\Artisan::output()
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });
});

