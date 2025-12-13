<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

use Illuminate\Support\Str;

class SocialAuthController extends Controller
{
    public function redirectToProvider($provider)
    {
        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function handleProviderCallback($provider)
    {
        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception $e) {
            return redirect(env('FRONTEND_URL') . '/login?error=social_login_failed');
        }

        $user = User::where('email', $socialUser->getEmail())->first();

        if (!$user) {
            $user = User::create([
                'name' => $socialUser->getName(),
                'email' => $socialUser->getEmail(),
                'password' => bcrypt(Str::random(16)), // Random password
                $provider . '_id' => $socialUser->getId(),
            ]);
            $user->assignRole('Student'); // Default role
        } else {
            // Link account if not already linked
            if (!$user->{$provider . '_id'}) {
                $user->update([
                    $provider . '_id' => $socialUser->getId()
                ]);
            }
        }

        $token = $user->createToken('myapptoken')->plainTextToken;

        return redirect(env('FRONTEND_URL') . '/auth/social/callback?token=' . $token . '&user_name=' . urlencode($user->name));
    }
}
