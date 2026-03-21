<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserSecurityController extends Controller
{
    /**
     * Update the user's password securely.
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        // Verify current password matches safely
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'The provided password does not match your current password.'
            ], 422);
        }

        $user->forceFill([
            'password' => Hash::make($request->new_password)
        ])->save();

        return response()->json([
            'message' => 'Password securely updated.'
        ]);
    }

    /**
     * Terminate the account securely.
     */
    public function deleteAccount(Request $request)
    {
        $user = $request->user();

        // Wipe sanctum tokens
        $user->tokens()->delete();
        
        // Destruct the record
        $user->delete();

        return response()->json([
            'message' => 'Account permanently deleted from system.'
        ]);
    }
}
