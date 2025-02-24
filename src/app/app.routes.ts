import { Routes } from '@angular/router';
import { PublicComponent } from './public/public.component';
import { PrivateComponent } from './private/private.component';
import { LoginComponent } from './public/components/login/login.component';
import { RegisterComponent } from './public/components/register/register.component';
import { DashboardComponent } from './private/components/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: 'public',
    component: PublicComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
      {
        path: '**',
        redirectTo: 'register',
        pathMatch: 'full',
      },
    ],
  },

  {
    path: 'private',
    component: PrivateComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: '**',
        redirectTo: '',
        pathMatch: 'full',
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'public',
    pathMatch: 'full',
  },
];
