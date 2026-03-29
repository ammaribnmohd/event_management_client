import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AdminDashboardPageComponent } from './pages/admin-dashboard-page.component';
import { AdminLoginPageComponent } from './pages/admin-login-page.component';
import { AdminRegisterPageComponent } from './pages/admin-register-page.component';
import { EventFormPageComponent } from './pages/event-form-page.component';
import { EventRegisterPageComponent } from './pages/event-register-page.component';
import { HomePageComponent } from './pages/home-page.component';

export const routes: Routes = [
	{ path: '', component: HomePageComponent },
	{ path: 'events/:id/register', component: EventRegisterPageComponent },
	{ path: 'admin/login', component: AdminLoginPageComponent },
	{ path: 'admin/register', component: AdminRegisterPageComponent },
	{ path: 'admin/dashboard', component: AdminDashboardPageComponent, canActivate: [authGuard] },
	{ path: 'admin/events/new', component: EventFormPageComponent, canActivate: [authGuard] },
	{ path: 'admin/events/:id/edit', component: EventFormPageComponent, canActivate: [authGuard] },
	{ path: '**', redirectTo: '' },
];
