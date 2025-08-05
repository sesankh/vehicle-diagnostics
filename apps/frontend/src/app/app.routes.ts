import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { VehiclesComponent } from './pages/vehicles/vehicles.component';
import { DiagnosticDashboardComponent } from '@vehicles-dashboard/diagnostic-ui';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'vehicles', component: VehiclesComponent },
  { path: 'diagnostics', component: DiagnosticDashboardComponent },
  { path: 'logs', component: DiagnosticDashboardComponent },
];
