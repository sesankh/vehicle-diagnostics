import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DiagnosticDashboardComponent } from '../components/diagnostic-dashboard/diagnostic-dashboard.component';
import { SearchPanelComponent } from '../components/search-panel/search-panel.component';
import { LogsTableComponent } from '../components/logs-table/logs-table.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: DiagnosticDashboardComponent },
      { path: 'logs', component: DiagnosticDashboardComponent }
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
export class DiagnosticsFeatureModule { } 