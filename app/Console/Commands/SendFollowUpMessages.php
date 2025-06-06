<?php

namespace App\Console\Commands;

use App\Models\Chat;
use App\Models\FollowUp;
use Illuminate\Console\Command;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class SendFollowUpMessages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'followups:send {--debug : Show debug information}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send scheduled follow-up messages';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = Carbon::now('Asia/Kolkata');
        $this->info("Current time (IST): " . $now->format('Y-m-d H:i:s'));
        
        try {
            // First, let's see all pending follow-ups regardless of time
            $allPending = FollowUp::where('is_sent', false)->get();
            $this->info("Total pending follow-ups (regardless of time): " . $allPending->count());

            // Filter follow-ups that are due using PHP
            $pendingFollowUps = $allPending->filter(function($followUp) use ($now) {
                $followUpTime = Carbon::parse($followUp->follow_up_at)->setTimezone('Asia/Kolkata');
                
                $this->info("Checking follow-up #{$followUp->id}:");
                $this->info("- Scheduled for (IST): " . $followUpTime->format('Y-m-d H:i:s'));
                $this->info("- Current time (IST): " . $now->format('Y-m-d H:i:s'));
                $this->info("- Is due: " . ($followUpTime->lte($now) ? 'Yes' : 'No'));
                
                return $followUpTime->lte($now);
            });

            if ($pendingFollowUps->isEmpty()) {
                $this->info("No follow-ups are due for processing at this time.");
                return;
            }

            $this->info("Found " . $pendingFollowUps->count() . " follow-ups to process");
            
            foreach ($pendingFollowUps as $followUp) {
                $followUpTime = Carbon::parse($followUp->follow_up_at)->setTimezone('Asia/Kolkata');
                $this->info("Processing follow-up #{$followUp->id} scheduled for (IST): " . $followUpTime->format('Y-m-d H:i:s'));

                try {
                    // Send the chat message
                    Chat::create([
                        'sender_id' => $followUp->sender_user_id,
                        'receiver_id' => $followUp->user_id,
                        'message' => $followUp->message,
                        'is_read' => false
                    ]);

                    // Mark as sent
                    $followUp->update(['is_sent' => true]);

                    $this->info("Successfully sent follow-up #{$followUp->id}");
                    Log::info("Follow-up message sent successfully", [
                        'follow_up_id' => $followUp->id,
                        'sender_id' => $followUp->sender_user_id,
                        'receiver_id' => $followUp->user_id,
                        'scheduled_time_utc' => $followUp->follow_up_at,
                        'scheduled_time_ist' => $followUpTime->format('Y-m-d H:i:s'),
                        'sent_time_ist' => $now->format('Y-m-d H:i:s')
                    ]);
                } catch (\Exception $e) {
                    $this->error("Error sending follow-up #{$followUp->id}: " . $e->getMessage());
                    Log::error("Error sending individual follow-up message", [
                        'follow_up_id' => $followUp->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }
        } catch (\Exception $e) {
            $this->error("Error processing follow-up messages: " . $e->getMessage());
            Log::error("Error in follow-up command", ['error' => $e->getMessage()]);
        }
    }
} 