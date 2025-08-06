import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DiagnosticService, VehicleStats } from '@vehicles-dashboard/ui-api-service';
import { ProgressLoaderComponent } from '@vehicles-dashboard/shared-ui';
import { VehicleData } from '../../vehicles/vehicle.resolver';

export interface VehicleDetails {
  id: string;
  name: string;
  model: string;
  year: number;
  status: 'active' | 'maintenance' | 'offline';
  lastDiagnostic?: string;
  errorCount?: number;
  lastUpdate?: string;
  vin?: string;
  licensePlate?: string;
  manufacturer?: string;
  fuelType?: string;
  mileage?: number;
  engineSize?: string;
  transmission?: string;
  color?: string;
  notes?: string;
}

@Component({
  selector: 'app-vehicle-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ProgressLoaderComponent],
  templateUrl: './vehicle-details.component.html',
  styleUrl: './vehicle-details.component.css'
})
export class VehicleDetailsComponent implements OnInit {
  @Input() vehicleId?: string;
  @Output() onBack = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<VehicleDetails>();

  vehicle: VehicleDetails | null = null;
  isLoading = false;
  isEditing = false;
  originalVehicle: VehicleDetails | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private diagnosticService: DiagnosticService
  ) {}

  ngOnInit(): void {
    // Get resolved data from route
    this.route.data.subscribe(data => {
      const vehicleData: VehicleData = data['vehicleData'];
      if (vehicleData && vehicleData.exists) {
        this.vehicleId = vehicleData.vehicleId;
        if (vehicleData.vehicleStats) {
          this.vehicle = this.convertToVehicleDetails(vehicleData.vehicleStats);
          this.originalVehicle = { ...this.vehicle };
        } else {
          this.loadVehicleDetails();
        }
      } else if (vehicleData) {
        this.vehicleId = vehicleData.vehicleId;
        this.loadVehicleDetails();
      }
    });
  }

  loadVehicleDetails(): void {
    this.isLoading = true;
    
    // In a real application, you would call a specific API endpoint
    // For now, we'll simulate loading from the vehicle stats
    this.diagnosticService.getVehicleStats().subscribe({
      next: (vehicleStats: VehicleStats[]) => {
        const vehicleIdNum = parseInt(this.vehicleId!.replace('V', ''));
        const stats = vehicleStats.find(v => v.vehicleId === vehicleIdNum);
        
        if (stats) {
          this.vehicle = this.convertToVehicleDetails(stats);
          this.originalVehicle = { ...this.vehicle };
        } else {
          // Create a default vehicle if not found
          this.vehicle = this.createDefaultVehicle(vehicleIdNum);
          this.originalVehicle = { ...this.vehicle };
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading vehicle details:', error);
        this.isLoading = false;
        // Create a default vehicle on error
        const vehicleIdNum = parseInt(this.vehicleId!.replace('V', ''));
        this.vehicle = this.createDefaultVehicle(vehicleIdNum);
        this.originalVehicle = { ...this.vehicle };
      }
    });
  }

  private convertToVehicleDetails(stats: VehicleStats): VehicleDetails {
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
      lastUpdate: lastUpdate,
      vin: `1HGBH41JXMN109${stats.vehicleId.toString().padStart(3, '0')}`,
      licensePlate: `ABC${stats.vehicleId.toString().padStart(3, '0')}`,
      manufacturer: 'Generic Motors',
      fuelType: 'Gasoline',
      mileage: 50000 + (stats.vehicleId * 1000),
      engineSize: '2.0L',
      transmission: 'Automatic',
      color: 'Silver',
      notes: 'Standard diagnostic vehicle for testing purposes.'
    };
  }

  private createDefaultVehicle(vehicleId: number): VehicleDetails {
    return {
      id: `V${vehicleId.toString().padStart(3, '0')}`,
      name: `Vehicle ${vehicleId}`,
      model: 'Unknown Model',
      year: 2024,
      status: 'offline',
      lastDiagnostic: 'No data',
      errorCount: 0,
      lastUpdate: 'No data',
      vin: `1HGBH41JXMN109${vehicleId.toString().padStart(3, '0')}`,
      licensePlate: `ABC${vehicleId.toString().padStart(3, '0')}`,
      manufacturer: 'Unknown',
      fuelType: 'Unknown',
      mileage: 0,
      engineSize: 'Unknown',
      transmission: 'Unknown',
      color: 'Unknown',
      notes: 'Vehicle information not available.'
    };
  }

  startEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    if (this.originalVehicle) {
      this.vehicle = { ...this.originalVehicle };
    }
    this.isEditing = false;
  }

  saveVehicle(): void {
    if (this.vehicle) {
      this.onSave.emit(this.vehicle);
      this.originalVehicle = { ...this.vehicle };
      this.isEditing = false;
      
      // In a real application, you would call an API to save the vehicle
      console.log('Saving vehicle:', this.vehicle);
    }
  }

  goBack(): void {
    this.router.navigate(['/vehicles']);
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'status-active';
      case 'maintenance': return 'status-maintenance';
      case 'offline': return 'status-offline';
      default: return 'status-default';
    }
  }
} 