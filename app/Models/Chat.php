<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Chat extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'message',
        'is_read',
        'deleted_for',
        'original_message',
        'edited_at'
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'deleted_for' => 'array',
        'edited_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $with = ['sender', 'receiver'];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function scopeUnreadCount($query, $userId)
    {
        return $query->where('receiver_id', $userId)
                    ->where('is_read', false)
                    ->whereNull('deleted_at')
                    ->whereRaw('NOT JSON_CONTAINS(COALESCE(deleted_for, "[]"), ?)', [json_encode($userId)])
                    ->count();
    }

    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now()
        ]);
    }

    public function editMessage($newMessage)
    {
        if (!$this->original_message) {
            $this->original_message = $this->message;
        }
        $this->message = $newMessage;
        $this->edited_at = now();
        $this->save();
    }

    public function deleteForMe($userId)
    {
        $deletedFor = $this->deleted_for ?? [];
        $deletedFor[] = $userId;
        $this->update(['deleted_for' => array_unique($deletedFor)]);
    }

    public function deleteForEveryone()
    {
        $this->delete(); // This uses soft delete
    }

    public function isVisibleTo($userId)
    {
        $deletedFor = $this->deleted_for ?? [];
        return !in_array($userId, $deletedFor) && !$this->trashed();
    }

    public function wasEdited()
    {
        return $this->edited_at !== null;
    }
} 