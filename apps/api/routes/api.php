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

Route::get('/version', function () {
    return response()->json([
        'version' => '1.0.0',
        'php' => phpversion(),
        'laravel' => app()->version(),
        'db_connection' => config('database.default'),
        'db_host' => config('database.connections.' . config('database.default') . '.host'),
    ]);
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

        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        $books = $query->paginate(20);

        // Map to ensure absolute URLs
        $books->through(function ($book) {
            if ($book->cover_image && !str_starts_with($book->cover_image, 'http')) {
                $book->cover_image = url(Storage::url(str_replace('/storage/', '', $book->cover_image)));
            }
            if ($book->file_path && !str_starts_with($book->file_path, 'http')) {
                $book->file_path = url(Storage::url(str_replace('/storage/', '', $book->file_path)));
            }
            return $book;
        });

        return $books;
    });

    Route::get('/books/{book}', function (Book $book) {
        $book->load('subject');
        if ($book->cover_image && !str_starts_with($book->cover_image, 'http')) {
            $book->cover_image = url(Storage::url(str_replace('/storage/', '', $book->cover_image)));
        }
        if ($book->file_path && !str_starts_with($book->file_path, 'http')) {
            $book->file_path = url(Storage::url(str_replace('/storage/', '', $book->file_path)));
        }
        return $book;
    });
    Route::get('/subjects', [\App\Http\Controllers\SubjectController::class, 'index']);
});

Route::get('/version', function () {
    return response()->json([
        'version' => '1.0.0',
        'php' => phpversion(),
        'laravel' => app()->version(),
        'db_connection' => config('database.default'),
        'db_host' => config('database.connections.' . config('database.default') . '.host'),
    ]);
});
