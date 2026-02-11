<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupMessage;
use Illuminate\Http\Request;

class GroupChatController extends Controller
{
    public function index(Request $request, $groupId)
    {
        $group = Group::findOrFail($groupId);
        // Check membership
        if (!$group->members()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Not a member'], 403);
        }

        $messages = $group->messages()
            ->with('user:id,name,email') // return minimal user info
            ->orderBy('created_at', 'asc') // chat verification
            ->get();

        return response()->json($messages);
    }

    public function store(Request $request, $groupId)
    {
        $request->validate(['content' => 'required|string']);

        $group = Group::findOrFail($groupId);
        if (!$group->members()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Not a member'], 403);
        }

        $message = GroupMessage::create([
            'group_id' => $groupId,
            'user_id' => $request->user()->id,
            'content' => $request->content
        ]);

        $message->load('user:id,name,email');

        return response()->json($message, 201);
    }
}
