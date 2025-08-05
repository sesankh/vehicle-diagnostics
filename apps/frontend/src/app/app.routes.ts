import { Routes } from '@angular/router';
import { DashboardComponent, VehiclesComponent, DiagnosticDashboardComponent, VehicleDetailsComponent } from '@vehicles-dashboard/diagnostic-ui';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'vehicles', component: VehiclesComponent },
  { path: 'vehicles/:id', component: VehicleDetailsComponent },
  { path: 'diagnostics', component: DiagnosticDashboardComponent },
  { path: 'logs', component: DiagnosticDashboardComponent },
];
