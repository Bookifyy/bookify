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
            'content' => $request->input('content')
        ]);

        $message->load('user:id,name,email');

        // Notify members about new message
        // Optimized: queue or job in production, but direct create for now
        try {
            $members = $group->members()->where('user_id', '!=', $request->user()->id)->get();

            foreach ($members as $member) {
                \App\Models\Notification::create([
                    'user_id' => $member->user_id,
                    'type' => 'new_message',
                    'data' => [
                        'group_id' => $group->id,
                        'group_name' => $group->name,
                        'sender_name' => $request->user()->name,
                        'message_preview' => substr($request->input('content'), 0, 50)
                    ]
                ]);
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Notification failed: " . $e->getMessage());
        }

        return response()->json($message, 201);
    }
}
