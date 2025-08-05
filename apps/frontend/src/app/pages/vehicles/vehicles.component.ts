import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehiclesTableComponent, Vehicle } from '@vehicles-dashboard/diagnostic-ui';
import { DiagnosticService, VehicleStats } from '@vehicles-dashboard/diagnostic-ui';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, VehiclesTableComponent],
  template: `
    <div class="vehicles-page">
      <div class="loading-overlay" *ngIf="isLoading">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Loading vehicle data...</p>
        </div>
      </div>
      
      <app-vehicles-table 
        [vehicles]="vehicles"
        (onAddVehicle)="addVehicle()"
        (onViewVehicle)="viewVehicle($event)"
        (onEditVehicle)="editVehicle($event)"
        (onDeleteVehicle)="deleteVehicle($event)"
      ></app-vehicles-table>
    </div>
  `,
  styles: [`
    .vehicles-page {
      height: 100%;
      position: relative;
    }
    
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .loading-spinner {
      background: white;
      padding: 30px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class VehiclesComponent implements OnInit, OnDestroy {
  vehicles: Vehicle[] = [];
  isLoading = true;

  private subscriptions = new Subscription();

  constructor(private diagnosticService: DiagnosticService) {}

  ngOnInit(): void {
    this.loadVehicleData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadVehicleData(): void {
    this.isLoading = true;
    
    // Subscribe to loading state
    this.subscriptions.add(
      this.diagnosticService.isLoading$.subscribe(loading => {
        this.isLoading = loading;
      })
    );

    this.subscriptions.add(
      this.diagnosticService.getVehicleStats().subscribe({
        next: (vehicleStats: VehicleStats[]) => {
          this.vehicles = vehicleStats.map(stats => this.convertToVehicle(stats));
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading vehicle data:', error);
          this.isLoading = false;
        }
      })
    );
  }

  private convertToVehicle(stats: VehicleStats): Vehicle {
    let status: 'active' | 'maintenance' | 'offline' = 'active';
    if (stats.errorCount > 5) {
      status = 'maintenance';
    } else if (stats.totalLogs === 0 || !stats.lastUpdate) {
      status = 'offline';
    }

    const lastDiagnostic = stats.lastDiagnostic ? new Date(stats.lastDiagnostic).toLocaleString() : 'No data';
    const lastUpdate = stats.lastUpdate ? new Date(stats.lastUpdate).toLocaleString() : 'No data';

    return {
      id: `V${stats.vehicleId.toString().padStart(3, '0')}`,
      name: `Vehicle ${stats.vehicleId}`,
      model: 'Diagnostic Vehicle',
      year: 2024,
      status: status,
      lastDiagnostic: lastDiagnostic,
      errorCount: stats.errorCount,
      lastUpdate: lastUpdate
    };
  }

  addVehicle() {
    console.log('Add vehicle clicked');
    // TODO: Implement add vehicle functionality
  }

  viewVehicle(vehicle: Vehicle) {
    console.log('View vehicle clicked:', vehicle);
    // TODO: Implement view vehicle functionality
  }

  editVehicle(vehicle: Vehicle) {
    console.log('Edit vehicle clicked:', vehicle);
    // TODO: Implement edit vehicle functionality
  }

  deleteVehicle(vehicle: Vehicle) {
    console.log('Delete vehicle clicked:', vehicle);
    // TODO: Implement delete vehicle functionality
  }
} 