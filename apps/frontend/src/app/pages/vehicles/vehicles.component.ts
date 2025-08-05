import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehiclesTableComponent, Vehicle } from '@vehicles-dashboard/diagnostic-ui';
import { DiagnosticService, VehicleStats } from '@vehicles-dashboard/diagnostic-ui';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, VehiclesTableComponent],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.css'
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