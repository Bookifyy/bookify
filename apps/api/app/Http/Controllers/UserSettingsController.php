<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class UserSettingsController extends Controller
{
    /**
     * Update user settings and core profile details.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        // Separate core fields (e.g. name, email) from dynamic settings
        $coreFields = $request->only(['name', 'email']);
        
        // Dynamic settings (everything else essentially, or explicit keys)
        // From visual mockups: theme, readerFontSize, language, emailNotifications, pushNotifications, streakReminders, quizResults, twoFactorAuth, publicProfile
        $dynamicSettingsKeys = [
            'theme', 
            'readerFontSize', 
            'language', 
            'emailNotifications', 
            'pushNotifications', 
            'streakReminders', 
            'quizResults', 
            'twoFactorAuth', 
            'publicProfile'
        ];
        
        $incomingSettings = $request->only($dynamicSettingsKeys);

        // Update core User structure if sent
        if (!empty($coreFields['name'])) {
            $user->name = $coreFields['name'];
        }
        if (!empty($coreFields['email'])) {
            // Usually requires re-verification, but for MVP updating directly
            $user->email = $coreFields['email'];
        }

        // Merge existing settings with incoming modifications
        $currentSettings = is_array($user->settings) ? $user->settings : [];
        $mergedSettings = array_merge($currentSettings, $incomingSettings);
        
        $user->settings = $mergedSettings;
        $user->save();

        return response()->json([
            'message' => 'Settings updated successfully',
            'user' => $user->fresh()
        ]);
    }
}
