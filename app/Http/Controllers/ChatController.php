<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index()
    {
        $userId = auth()->id();
        
        $users = User::where('id', '!=', $userId)
            ->select('id', 'name')
            ->get();

        $chats = Chat::with(['sender', 'receiver'])
            ->where(function ($query) use ($userId) {
                $query->where('sender_id', $userId)
                    ->orWhere('receiver_id', $userId);
            })
            ->whereNull('deleted_at')
            ->whereRaw('NOT JSON_CONTAINS(COALESCE(deleted_for, "[]"), ?)', [json_encode($userId)])
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($chat) use ($userId) {
                return [
                    'id' => $chat->id,
                    'message' => $chat->message,
                    'sender_id' => $chat->sender_id,
                    'receiver_id' => $chat->receiver_id,
                    'is_read' => $chat->is_read,
                    'is_edited' => $chat->edited_at !== null,
                    'created_at' => $chat->created_at,
                    'updated_at' => $chat->updated_at,
                    'edited_at' => $chat->edited_at,
                    'sender' => [
                        'id' => $chat->sender->id,
                        'name' => $chat->sender->name,
                    ],
                    'receiver' => [
                        'id' => $chat->receiver->id,
                        'name' => $chat->receiver->name,
                    ],
                ];
            });

        // return $chats;
        return Inertia::render('Chat/Index', [
            'users' => $users,
            'chats' => $chats
        ]);
    }

    public function getMessages(Request $request)
    {
        $messages = Chat::with(['sender', 'receiver'])
            ->where(function ($query) use ($request) {
                $query->where('sender_id', auth()->id())
                    ->where('receiver_id', $request->user_id);
            })
            ->orWhere(function ($query) use ($request) {
                $query->where('sender_id', $request->user_id)
                    ->where('receiver_id', auth()->id());
            })
            ->orderBy('created_at', 'asc')
            ->get();

        Chat::where('sender_id', $request->user_id)
            ->where('receiver_id', auth()->id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json($messages);
    }

    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required|string',
        ]);

        $chat = Chat::create([
            'sender_id' => auth()->id(),
            'receiver_id' => $validated['receiver_id'],
            'message' => $validated['message'],
        ]);

        $chat->load(['sender', 'receiver']);

        return redirect()->back();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required|string'
        ]);

        $chat = Chat::create([
            'sender_id' => auth()->id(),
            'receiver_id' => $validated['receiver_id'],
            'message' => $validated['message'],
            'is_read' => false
        ]);

        $chat->load(['sender', 'receiver']);

        return redirect()->back(); 
        
        // return back()->with('chat', [
        //     'id' => $chat->id,
        //     'message' => $chat->message,
        //     'sender_id' => $chat->sender_id,
        //     'receiver_id' => $chat->receiver_id,
        //     'is_read' => $chat->is_read,
        //     'is_edited' => false,
        //     'created_at' => $chat->created_at,
        //     'sender' => [
        //         'id' => $chat->sender->id,
        //         'name' => $chat->sender->name,
        //     ],
        //     'receiver' => [
        //         'id' => $chat->receiver->id,
        //         'name' => $chat->receiver->name,
        //     ],
        // ]);
    }

    public function update(Request $request, Chat $chat)
    {
        if ($chat->sender_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }
        
        $validated = $request->validate([
            'message' => 'required|string'
        ]);

        $chat->editMessage($validated['message']);
        $chat->load(['sender', 'receiver']);

        return back()->with('chat', [
            'id' => $chat->id,
            'message' => $chat->message,
            'sender_id' => $chat->sender_id,
            'receiver_id' => $chat->receiver_id,
            'is_read' => $chat->is_read,
            'is_edited' => true,
            'created_at' => $chat->created_at,
            'sender' => [
                'id' => $chat->sender->id,
                'name' => $chat->sender->name,
            ],
            'receiver' => [
                'id' => $chat->receiver->id,
                'name' => $chat->receiver->name,
            ],
        ]);
    }

    public function deleteForMe(Chat $chat)
    {
        $userId = auth()->id();
        if ($chat->sender_id === $userId || $chat->receiver_id === $userId) {
            $chat->deleteForMe($userId);
        }

        return back();
    }

    public function deleteForEveryone(Chat $chat)
    {
        if ($chat->sender_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }
        
        $chat->deleteForEveryone();
        return back();
    }

    public function markAsRead(Chat $chat)
    {
        if (auth()->id() === $chat->receiver_id) {
            $chat->update(['is_read' => true]);
        }

        return back();
    }

    public function unreadCount()
    {
        $userId = auth()->id();
        $count = Chat::where('receiver_id', $userId)
            ->where('is_read', false)
            ->whereNull('deleted_at')
            ->whereRaw('NOT JSON_CONTAINS(COALESCE(deleted_for, "[]"), ?)', [json_encode($userId)])
            ->count();

        return response()->json(['count' => $count]);
    }

    public function markAllAsRead(Request $request)
    {
        $validated = $request->validate([
            'sender_id' => 'required|exists:users,id'
        ]);

        Chat::where('sender_id', $validated['sender_id'])
            ->where('receiver_id', auth()->id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return back();
    }
} 