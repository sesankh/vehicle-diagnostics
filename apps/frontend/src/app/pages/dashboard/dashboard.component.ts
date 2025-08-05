import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DiagnosticService, VehicleStats, DiagnosticLogEntry } from '@vehicles-dashboard/diagnostic-ui';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  totalVehicles = 0;
  activeVehicles = 0;
  maintenanceVehicles = 0;
  offlineVehicles = 0;
  isLoading = true;

  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private diagnosticService: DiagnosticService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Subscribe to loading state
    this.subscriptions.add(
      this.diagnosticService.isLoading$.subscribe(loading => {
        this.isLoading = loading;
      })
    );

    // Load vehicle stats
    this.subscriptions.add(
      this.diagnosticService.getVehicleStats().subscribe({
        next: (vehicleStats: VehicleStats[]) => {
          this.calculateDashboardStats(vehicleStats);
        },
        error: (error) => {
          console.error('Error loading vehicle stats:', error);
        }
      })
    );


  }

  private calculateDashboardStats(vehicleStats: VehicleStats[]): void {
    this.totalVehicles = vehicleStats.length;
    
    let active = 0;
    let maintenance = 0;
    let offline = 0;

    vehicleStats.forEach(stats => {
      if (stats.errorCount > 5) {
        maintenance++;
      } else if (stats.totalLogs === 0 || !stats.lastUpdate) {
        offline++;
      } else {
        active++;
      }
    });

    this.activeVehicles = active;
    this.maintenanceVehicles = maintenance;
    this.offlineVehicles = offline;
  }



  addVehicle() {
    console.log('Add vehicle clicked');
    this.router.navigate(['/vehicles']);
  }



  uploadLogs() {
    console.log('Upload logs clicked');
    this.router.navigate(['/diagnostics']);
  }
}