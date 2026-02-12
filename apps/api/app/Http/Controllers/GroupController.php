<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupMember;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GroupController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        // meaningful query: groups the user is a member of
        $groups = Group::whereHas('members', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->withCount('members')->get();

        return response()->json($groups);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:60',
            'privacy' => 'required|in:invite_only,open',
            'description' => 'nullable|string'
        ]);

        $group = DB::transaction(function () use ($request) {
            $group = Group::create([
                'name' => $request->name,
                'description' => $request->description,
                'privacy' => $request->privacy,
                'owner_id' => $request->user()->id
            ]);

            GroupMember::create([
                'group_id' => $group->id,
                'user_id' => $request->user()->id,
                'role' => 'owner'
            ]);

            return $group;
        });

        return response()->json($group, 201);
    }

    public function show($id)
    {
        $group = Group::with(['members.user', 'books', 'owner'])->withCount('members')->findOrFail($id);
        return response()->json($group);
    }

    public function join(Request $request, $id)
    {
        $group = Group::findOrFail($id);
        $user = $request->user();

        // Check if already member
        if ($group->members()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Already a member'], 400);
        }

        if ($group->privacy === 'invite_only') {
            return response()->json(['message' => 'This group is invite only'], 403);
        }

        GroupMember::create([
            'group_id' => $group->id,
            'user_id' => $user->id,
            'role' => 'member'
        ]);

        return response()->json(['message' => 'Joined successfully']);
    }

    public function leave(Request $request, $id)
    {
        $user = $request->user();
        $member = GroupMember::where('group_id', $id)->where('user_id', $user->id)->firstOrFail();

        if ($member->role === 'owner') {
            // Logic to transfer ownership or delete group if owner leaves? 
            // For now, prevent leaving if owner
            return response()->json(['message' => 'Owner cannot leave group. Delete the group instead or transfer ownership.'], 400);
        }

        $member->delete();
        return response()->json(['message' => 'Left group successfully']);
    }

    public function addBook(Request $request, $id)
    {
        $request->validate(['book_id' => 'required|exists:books,id']);

        $group = Group::findOrFail($id);
        // Check membership
        if (!$group->members()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Not a member'], 403);
        }

        // Check if book already added
        if ($group->books()->where('book_id', $request->book_id)->exists()) {
            return response()->json(['message' => 'Book already in group'], 400);
        }

        $group->books()->attach($request->book_id, [
            'added_by_user_id' => $request->user()->id,
            'added_at' => now()
        ]);

        // Notify members about new book
        try {
            $members = $group->members()->where('user_id', '!=', $request->user()->id)->get();
            $book = Book::find($request->book_id);

            foreach ($members as $member) {
                \App\Models\Notification::create([
                    'user_id' => $member->user_id,
                    'type' => 'book_added',
                    'data' => [
                        'group_id' => $group->id,
                        'group_name' => $group->name,
                        'book_title' => $book ? $book->title : 'Unknown Book',
                        'added_by' => $request->user()->name
                    ]
                ]);
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Notification failed: " . $e->getMessage());
        }

        return response()->json(['message' => 'Book added to group']);
    }

    public function removeMember(Request $request, $groupId, $userId)
    {
        $group = Group::findOrFail($groupId);

        // Only owner can remove members
        if ($group->owner_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Cannot remove owner
        if ($group->owner_id == $userId) {
            return response()->json(['message' => 'Cannot remove owner'], 400);
        }

        $member = GroupMember::where('group_id', $groupId)->where('user_id', $userId)->first();
        if ($member) {
            $member->delete();
        }

        return response()->json(['message' => 'Member removed']);
    }

    public function invite(Request $request, $id)
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id'
        ]);

        $group = Group::findOrFail($id);
        if (!$group->members()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Not a member'], 403);
        }

        $count = 0;
        foreach ($request->user_ids as $uid) {
            if (!$group->members()->where('user_id', $uid)->exists()) {
                GroupMember::create([
                    'group_id' => $group->id,
                    'user_id' => $uid,
                    'role' => 'member',
                    'status' => 'pending' // Default is active in migration, but let's be explicit for invites
                ]);

                // Send Notification (Safely)
                try {
                    \App\Models\Notification::create([
                        'user_id' => $uid,
                        'type' => 'group_invite',
                        'data' => [
                            'group_id' => $group->id,
                            'group_name' => $group->name,
                            'invited_by' => $request->user()->name
                        ]
                    ]);
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error("Notification failed: " . $e->getMessage());
                }

                $count++;
            }
        }

        return response()->json(['message' => "Invited $count members successfully"]);
    }

    public function acceptInvite(Request $request, $id)
    {
        $member = GroupMember::where('group_id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($member->status === 'active') {
            return response()->json(['message' => 'Already joined']);
        }

        $member->update(['status' => 'active']);

        return response()->json(['message' => 'Joined group successfully']);
    }

    public function rejectInvite(Request $request, $id)
    {
        $member = GroupMember::where('group_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($member) {
            // Send Rejection Notification to Owner
            try {
                $group = Group::find($id);
                // Notify Owner
                if ($group) {
                    \App\Models\Notification::create([
                        'user_id' => $group->owner_id,
                        'type' => 'invite_rejected',
                        'data' => [
                            'group_id' => $id,
                            'group_name' => $group->name,
                            'user_name' => $request->user()->name
                        ]
                    ]);
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Notification failed: " . $e->getMessage());
            }

            $member->delete();
        }

        return response()->json(['message' => 'Invite rejected']);
    }
}
