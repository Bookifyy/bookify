<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class AdminController extends Controller
{
    public function index()
    {
        // Return all users with their roles
        return User::with('roles')->get();
    }

    public function assignRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|exists:roles,name'
        ]);

        $user = User::findOrFail($id);
        $user->syncRoles([$request->role]);

        return response()->json([
            'message' => 'Role assigned successfully',
            'user' => $user->load('roles')
        ]);
    }
}
