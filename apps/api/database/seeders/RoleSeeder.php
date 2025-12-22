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

        Role::firstOrCreate(['name' => 'Admin'])
            ->givePermissionTo(Permission::all());
    }
}
