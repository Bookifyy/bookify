<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Collection;
use App\Models\CollectionMember;
use App\Models\CollectionBook;
use App\Models\CollectionActivity;

class CollectionController extends Controller
{
    // GET /api/collections
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        
        // Find collections where user is owner or member
        $collections = Collection::where('owner_id', $userId)
            ->orWhereHas('members', function($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->with(['members.user:id,name', 'books.book:id,title,cover_image'])
            ->get()
            ->map(function ($c) {
                return [
                    'id' => (string)$c->id,
                    'name' => $c->name,
                    'description' => $c->description,
                    'visibility' => $c->visibility,
                    'isSmart' => $c->isSmart,
                    'bookIds' => $c->books->pluck('book_id')->toArray(),
                    'notes' => []
                ];
            });
            
        return response()->json($collections);
    }

    // POST /api/collections
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'visibility' => 'required|in:Private,Group,Public'
        ]);

        $collection = Collection::create([
            'name' => $request->name,
            'description' => $request->description,
            'visibility' => $request->visibility,
            'isSmart' => false,
            'owner_id' => $request->user()->id
        ]);

        CollectionActivity::create([
            'collection_id' => $collection->id,
            'user_id' => $request->user()->id,
            'action' => 'created the collection'
        ]);

        return response()->json([
            'id' => (string)$collection->id,
            'name' => $collection->name,
            'description' => $collection->description,
            'visibility' => $collection->visibility,
            'isSmart' => $collection->isSmart,
            'bookIds' => [],
            'notes' => []
        ]);
    }

    // GET /api/collections/{id}
    public function show(Request $request, $id)
    {
        $collection = Collection::with([
            'activities' => function($q) {
                $q->latest()->with('user:id,name');
            },
            'books'
        ])->findOrFail($id);
        
        // Append flat bookIds array
        $collection->bookIds = $collection->books->pluck('book_id')->toArray();
        
        return response()->json($collection);
    }

    // POST /api/collections/{id}/books
    public function addBook(Request $request, $id)
    {
        $request->validate(['book_id' => 'required']);
        
        $exists = CollectionBook::where('collection_id', $id)
            ->where('book_id', $request->book_id)
            ->exists();
            
        if (!$exists) {
            CollectionBook::create([
                'collection_id' => $id,
                'book_id' => $request->book_id,
                'added_by_user_id' => $request->user()->id,
            ]);
            
            CollectionActivity::create([
                'collection_id' => $id,
                'user_id' => $request->user()->id,
                'action' => 'added a book',
                'book_id' => $request->book_id
            ]);
        }
        
        return response()->json(['message' => 'Book added']);
    }

    // DELETE /api/collections/{id}/books/{bookId}
    public function removeBook(Request $request, $id, $bookId)
    {
        CollectionBook::where('collection_id', $id)->where('book_id', $bookId)->delete();
        
        CollectionActivity::create([
            'collection_id' => $id,
            'user_id' => $request->user()->id,
            'action' => 'removed a book',
            'book_id' => $bookId
        ]);
        
        return response()->json(['message' => 'Book removed']);
    }

    // POST /api/collections/{id}/accept
    public function acceptInvite(Request $request, $id)
    {
        $userId = $request->user()->id;
        
        $exists = CollectionMember::where('collection_id', $id)
            ->where('user_id', $userId)
            ->exists();
            
        if (!$exists) {
            CollectionMember::create([
                'collection_id' => $id,
                'user_id' => $userId,
                'role' => 'viewer'
            ]);
            
            CollectionActivity::create([
                'collection_id' => $id,
                'user_id' => $userId,
                'action' => 'joined the collection',
            ]);
        }
        
        return response()->json(['message' => 'Joined collection']);
    }
}
