<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest()
            ->limit(20)
            ->get();

        return response()->json($notifications);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = Notification::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $notification->update(['read_at' => now()]);

        return response()->json(['message' => 'Marked as read']);
    }

    public function markAllAsRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'All marked as read']);
    }

    public function destroyAll(Request $request)
    {
        Notification::where('user_id', $request->user()->id)->delete();
        return response()->json(['message' => 'All notifications cleared']);
    }

    // Internal helper to send notification
    public static function send($userId, $type, $data)
    {
        try {
            return Notification::create([
                'user_id' => $userId,
                'type' => $type,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Illuminate\Support\Facades\Log::error('Failed to send notification: ' . $e->getMessage());
        }
    }

    public function sendShareInvite(Request $request)
    {
        $request->validate([
            'user_id' => 'required',
            'collection_id' => 'required',
            'collection_name' => 'required'
        ]);

        self::send(
            $request->user_id,
            'collection_invite',
            [
                'collection_id' => $request->collection_id,
                'collection_name' => $request->collection_name,
                'sender_name' => $request->user()->name
            ]
        );

        return response()->json(['message' => 'Invite sent successfully.']);
    }

    public function sendEmailInvite(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'collection_name' => 'required'
        ]);

        $senderName = $request->user() ? $request->user()->name : 'Someone';
        
        try {
            \Illuminate\Support\Facades\Mail::raw("{$senderName} has invited you to view their collection: {$request->collection_name}. Sign up to Bookify to view it!", function ($message) use ($request) {
                $message->to($request->email)
                        ->subject("You've been invited to a collection on Bookify");
            });
            return response()->json(['message' => 'Email sent successfully.']);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send email invite: ' . $e->getMessage());
            return response()->json(['message' => 'Email send attempted (check logs if failed).']);
        }
    }
}
