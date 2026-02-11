<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupNote;
use Illuminate\Http\Request;

class GroupNoteController extends Controller
{
    public function index($groupId)
    {
        $group = Group::findOrFail($groupId);
        // Ensure user is member
        if (!$group->members()->where('user_id', request()->user()->id)->exists()) {
            return response()->json(['message' => 'Not a member'], 403);
        }

        $notes = $group->notes()->with('user')->latest()->get();
        return response()->json($notes);
    }

    public function store(Request $request, $groupId)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string'
        ]);

        $group = Group::findOrFail($groupId);
        if (!$group->members()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Not a member'], 403);
        }

        $note = GroupNote::create([
            'group_id' => $groupId,
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'content' => $request->content
        ]);

        return response()->json($note->load('user'), 201);
    }

    public function destroy($groupId, $id)
    {
        $note = GroupNote::where('group_id', $groupId)->findOrFail($id);

        // Only creator or group owner/admin can delete? 
        // For now, let's allow creator.
        if ($note->user_id !== request()->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $note->delete();
        return response()->json(['message' => 'Note deleted']);
    }
}
