<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddStatusToGroupMembersTable extends Migration
{
    public function up()
    {
        Schema::table('group_members', function (Blueprint $table) {
            $table->string('status')->default('active'); // 'pending', 'active' (Default active for existing members)
        });
    }

    public function down()
    {
        Schema::table('group_members', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
}
