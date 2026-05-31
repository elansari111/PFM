<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Module;
use App\Models\Grade;
use App\Models\Absence;
use App\Policies\ModulePolicy;
use App\Policies\GradePolicy;
use App\Policies\AbsencePolicy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register policies
        Gate::policy(Module::class, ModulePolicy::class);
        Gate::policy(Grade::class, GradePolicy::class);
        Gate::policy(Absence::class, AbsencePolicy::class);

        // Define gates for authorization
        Gate::define('is-admin', fn ($user) => $user->isAdmin());
        Gate::define('is-teacher', fn ($user) => $user->isTeacher());
        Gate::define('is-student', fn ($user) => $user->isStudent());
        
        Gate::define('manage-users', fn ($user) => $user->isAdmin());
        Gate::define('manage-modules', fn ($user) => $user->isAdmin() || $user->isTeacher());
        Gate::define('view-own-grades', fn ($user, $grade) => $user->student && $user->student->id === $grade->student_id);
        Gate::define('approve-justifications', fn ($user) => $user->isAdmin() || $user->isTeacher());
    }
}
