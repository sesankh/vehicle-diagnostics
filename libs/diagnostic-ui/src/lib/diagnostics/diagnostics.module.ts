import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DiagnosticDashboardComponent } from './components/diagnostic-dashboard.component';
import { SearchPanelComponent } from './components/search-panel.component';
import { LogsTableComponent } from './components/logs-table.component';
import { DiagnosticsGuard } from './guards/diagnostics.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [DiagnosticsGuard],
    children: [
      {
        path: '',
        component: DiagnosticDashboardComponent,
        data: { 
          title: 'Diagnostics Dashboard',
          breadcrumb: 'Diagnostics'
        }
      },
      {
        path: 'logs',
        component: DiagnosticDashboardComponent,
        data: { 
          title: 'Diagnostic Logs',
          breadcrumb: 'Logs'
        }
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DiagnosticDashboardComponent,
    SearchPanelComponent,
    LogsTableComponent
  ],
  declarations: [],
  exports: [RouterModule]
})
export class DiagnosticsModule { } 