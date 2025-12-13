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
        Permission::create(['name' => 'edit articles']);
        Permission::create(['name' => 'delete articles']);
        Permission::create(['name' => 'publish articles']);
        Permission::create(['name' => 'unpublish articles']);

        // create roles and assign created permissions

        // this can be done as separate statements
        $role = Role::create(['name' => 'Student']);
        $role->givePermissionTo('edit articles');

        $role = Role::create(['name' => 'Teacher']);
        $role->givePermissionTo(['publish articles', 'unpublish articles']);

        $role = Role::create(['name' => 'Admin']);
        $role->givePermissionTo(Permission::all());
    }
}
