<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run()
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // create permissions
        $permissions = [
            'edit articles',
            'delete articles',
            'publish articles',
            'unpublish articles',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // create roles and assign created permissions
        Role::firstOrCreate(['name' => 'Student'])
            ->givePermissionTo('edit articles');

        Role::firstOrCreate(['name' => 'Teacher'])
            ->givePermissionTo(['publish articles', 'unpublish articles']);

        // Create or find the Admin role and assign all permissions
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $adminRole->givePermissionTo(Permission::all());

        // Create or find the Admin user and assign the role
        $admin = \App\Models\User::firstOrCreate(
            ['email' => 'predit@gmail.com'],
            [
                'name' => 'PreDit Admin',
                'password' => \Illuminate\Support\Facades\Hash::make('pr@1122'),
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole($adminRole);
    }
}
