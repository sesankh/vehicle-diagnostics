import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CustomTableComponent, TableColumn, TableAction, ProgressLoaderComponent } from '@vehicles-dashboard/shared-ui';
import { DiagnosticService, VehicleStats } from '@vehicles-dashboard/ui-api-service';
import { Subscription } from 'rxjs';

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  year: number;
  status: 'active' | 'maintenance' | 'offline';
  lastDiagnostic?: string;
  errorCount?: number;
  lastUpdate?: string;
}

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, CustomTableComponent, ProgressLoaderComponent],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.css'
})
export class VehiclesComponent implements OnInit, OnDestroy {
  vehicles: Vehicle[] = [];
  isLoading = true;
  
  columns: TableColumn[] = [
    { key: 'id', label: 'Vehicle ID', sortable: true, width: '120px' },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'model', label: 'Model', sortable: true },
    { key: 'year', label: 'Year', sortable: true, type: 'number', width: '80px' },
    { key: 'status', label: 'Status', sortable: true, type: 'status', width: '120px' },
    { key: 'errorCount', label: 'Errors', sortable: true, type: 'number', width: '80px' },
    { key: 'lastDiagnostic', label: 'Last Diagnostic', sortable: true, type: 'date' },
    { key: 'lastUpdate', label: 'Last Update', sortable: true, type: 'date' }
  ];

  actions: TableAction[] = [
    { label: 'View', icon: 'visibility', action: 'view', color: 'primary' },
    { label: 'Edit', icon: 'edit', action: 'edit', color: 'secondary' },
    { label: 'Delete', icon: 'delete', action: 'delete', color: 'danger' }
  ];

  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private diagnosticService: DiagnosticService
  ) {}

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
      this.diagnosticService.isLoading$.subscribe((loading: boolean) => {
        this.isLoading = loading;
      })
    );

    this.subscriptions.add(
      this.diagnosticService.getVehicleStats().subscribe({
        next: (vehicleStats: VehicleStats[]) => {
          this.vehicles = vehicleStats.map(stats => this.convertToVehicle(stats));
          this.isLoading = false;
        },
        error: (error: any) => {
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

  handleTableAction(event: { action: string; item: Vehicle }): void {
    switch (event.action) {
      case 'view':
      case 'edit':
        this.navigateToVehicleDetails(event.item.id);
        break;
      case 'delete':
        this.deleteVehicle(event.item);
        break;
    }
  }

  handleRowClick(vehicle: Vehicle): void {
    this.navigateToVehicleDetails(vehicle.id);
  }

  addVehicle() {
    console.log('Add vehicle clicked');
    // TODO: Implement add vehicle functionality
  }

  navigateToVehicleDetails(vehicleId: string): void {
    this.router.navigate(['/vehicles', vehicleId]);
  }

  deleteVehicle(vehicle: Vehicle) {
    console.log('Delete vehicle clicked:', vehicle);
    // TODO: Implement delete vehicle functionality
  }
} 