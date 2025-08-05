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
  recentLogs: DiagnosticLogEntry[] = [];
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

    // Load recent logs
    this.subscriptions.add(
      this.diagnosticService.getAllLogs().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.recentLogs = response.data.slice(0, 10); // Get latest 10 logs
          }
        },
        error: (error) => {
          console.error('Error loading recent logs:', error);
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

  getActivityIcon(level: string): string {
    switch (level.toLowerCase()) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }

  getActivityIconClass(level: string): string {
    switch (level.toLowerCase()) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  addVehicle() {
    console.log('Add vehicle clicked');
    this.router.navigate(['/vehicles']);
  }

  runDiagnostic() {
    console.log('Run diagnostic clicked');
    this.router.navigate(['/diagnostics']);
  }

  viewReports() {
    console.log('View reports clicked');
    this.router.navigate(['/diagnostics']);
  }

  uploadLogs() {
    console.log('Upload logs clicked');
    this.router.navigate(['/diagnostics']);
  }
}