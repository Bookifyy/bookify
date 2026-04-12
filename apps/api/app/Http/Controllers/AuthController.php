<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $fields = $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|unique:users,email',
            'password' => 'required|string|confirmed'
        ]);

        $user = User::create([
            'name' => $fields['name'],
            'email' => strtolower(trim($fields['email'])),
            'password' => bcrypt($fields['password'])
        ]);

        $user->assignRole('Student'); // Default role
        $user->load('roles');

        $token = $user->createToken('myapptoken')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ], 201);
    }

    public function login(Request $request)
    {
        $fields = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string'
        ]);

        // Check email (forcing lowercase for SQLite compatibility)
        $email = strtolower(trim($fields['email']));
        $user = User::where('email', $email)->first();
        
        \Illuminate\Support\Facades\Log::info('Login attempt for '.$email.':', [
            'found' => $user !== null,
            'password_is_hashed' => $user ? str_starts_with((string)$user->password, '$2y$') : false,
        ]);

        // Check password
        if (!$user || !Hash::check($fields['password'], $user->password)) {
            return response()->json([
                'message' => 'Bad creds'
            ], 401);
        }

        $user->load('roles');
        $token = $user->createToken('myapptoken')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ], 201);
    }

    public function logout(Request $request)
    {
        auth()->user()->tokens()->delete();

        return [
            'message' => 'Logged out'
        ];
    }
}
