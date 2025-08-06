import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadChildren: () => import('@vehicles-dashboard/diagnostic-ui').then(m => m.DashboardModule)
  },
  {
    path: 'vehicles',
    loadChildren: () => import('@vehicles-dashboard/diagnostic-ui').then(m => m.VehiclesModule)
  },
  {
    path: 'diagnostics',
    loadChildren: () => import('@vehicles-dashboard/diagnostic-ui').then(m => m.DiagnosticsModule)
  },
  {
    path: 'logs',
    redirectTo: '/diagnostics/logs',
    pathMatch: 'full'
  }
];
