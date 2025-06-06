<?php

namespace App\Http\Controllers;

use App\Models\FollowUp;
use App\Models\User;
use App\Http\Requests\StoreFollowUpRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FollowUpController extends Controller
{

    public function index()
    {
        $followUps = FollowUp::with(['user', 'sender'])
            ->where('sender_user_id', auth()->id())
            ->latest('follow_up_at')
            ->get()
            ->map(function ($followUp) {
                return [
                    'id' => $followUp->id,
                    'user_id' => $followUp->user_id,
                    'user_name' => $followUp->user->name,
                    'message' => $followUp->message,
                    'follow_up_at' => $followUp->follow_up_at,
                    'is_sent' => $followUp->is_sent,
                    'created_at' => $followUp->created_at,
                ];
            });

        return Inertia::render('FollowUps/Index', [
            'followUps' => $followUps
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('FollowUps/Create', [
            'users' => User::where('id', '!=', auth()->id())
                ->select('id', 'name')
                ->orderBy('name')
                ->get()
        ]);
    }

    public function store(StoreFollowUpRequest $request)
    {
        $validated = $request->validated();
        
        FollowUp::create([
            'user_id' => $validated['user_id'],
            'sender_user_id' => auth()->id(),
            'message' => $validated['message'],
            'follow_up_at' => $validated['follow_up_at'],
            'is_sent' => false,
        ]);

        return redirect()->route('followups.index')
            ->with('message', 'Follow-up scheduled successfully.');
    }

    public function edit(FollowUp $followUp): Response
    {
        // $this->authorize('update', $followUp);

        return Inertia::render('FollowUps/Edit', [
            'followUp' => $followUp,
            'users' => User::where('id', '!=', auth()->id())
                ->select('id', 'name')
                ->orderBy('name')
                ->get()
        ]);
    }

    public function update(Request $request, FollowUp $followUp)
    {
        // $this->authorize('update', $followUp);

        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'message' => ['required', 'string', 'min:3', 'max:500'],
            'follow_up_at' => ['required', 'date', 'after:now'],
        ]);

        if (!$followUp->is_sent) {
            $followUp->update([
                'user_id' => $validated['user_id'],
                'message' => $validated['message'],
                'follow_up_at' => $validated['follow_up_at'],
            ]);

            return redirect()->route('followups.index')
                ->with('message', 'Follow-up updated successfully.');
        }

        return redirect()->route('followups.index')
            ->with('error', 'Cannot update a follow-up that has already been sent.');
    }

    public function destroy(FollowUp $followUp)
    {
        // $this->authorize('delete', $followUp);

        if (!$followUp->is_sent) {
            $followUp->delete();
            return redirect()->route('followups.index')
                ->with('message', 'Follow-up deleted successfully.');
        }

        return redirect()->route('followups.index')
            ->with('error', 'Cannot delete a follow-up that has already been sent.');
    }
} 