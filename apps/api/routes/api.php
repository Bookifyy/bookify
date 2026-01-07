<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

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

// Public Routes
Route::middleware(['throttle:auth'])->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Diagnostic: Check Database
Route::get('/db-check', function () {
    try {
        $tables = \Illuminate\Support\Facades\DB::select('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != \'pg_catalog\' AND schemaname != \'information_schema\'');
        // Handle MySQL fallback just in case
        if (empty($tables) && config('database.default') === 'mysql') {
            $tables = \Illuminate\Support\Facades\DB::select('SHOW TABLES');
        }

        return response()->json([
            'connection' => config('database.default'),
            'database' => \Illuminate\Support\Facades\DB::connection()->getDatabaseName(),
            'tables' => $tables,
            'subjects_count' => \Illuminate\Support\Facades\DB::table('subjects')->count(),
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
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
        return $request->user();
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
    Route::get('/books', [\App\Http\Controllers\BookController::class, 'index']);
    Route::get('/books/{book}', [\App\Http\Controllers\BookController::class, 'show']);
    Route::get('/subjects', [\App\Http\Controllers\SubjectController::class, 'index']);
});

Route::get('/version', function () {
    return response()->json([
        'version' => '1.0.0',
        'php' => phpversion(),
        'laravel' => app()->version(),
        'db_connection' => \Illuminate\Support\Facades\DB::connection()->getDatabaseName() ? 'connected' : 'failed'
    ]);
});
