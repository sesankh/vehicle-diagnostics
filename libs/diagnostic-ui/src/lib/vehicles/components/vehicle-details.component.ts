import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProgressLoaderComponent } from '@vehicles-dashboard/shared-ui';
import { DiagnosticService, VehicleStats, DiagnosticLogEntry } from '@vehicles-dashboard/ui-api-service';

export interface VehicleDetails {
  id: string;
  name: string;
  model: string;
  year: number;
  status: 'active' | 'maintenance' | 'offline';
  lastDiagnostic?: string;
  errorCount?: number;
  warningCount?: number;
  infoCount?: number;
  debugCount?: number;
  totalLogs?: number;
  lastUpdate?: string;
}

export interface VehicleData {
  vehicleId: string;
  exists: boolean;
  vehicleStats?: VehicleStats;
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
  isLoadingLogs = false;
  isEditing = false;
  originalVehicle: VehicleDetails | null = null;
  vehicleLogs: DiagnosticLogEntry[] = [];
  
  // Search and pagination properties
  searchTerm = '';
  filteredLogs: DiagnosticLogEntry[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  paginatedLogs: DiagnosticLogEntry[] = [];
  
  // Expose Math for template
  Math = Math;

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
        this.loadVehicleDetails();
        this.loadVehicleLogs();
      } else if (vehicleData) {
        this.vehicleId = vehicleData.vehicleId;
        this.loadVehicleDetails();
        this.loadVehicleLogs();
      }
    });
  }

  loadVehicleDetails(): void {
    this.isLoading = true;
    
    // Extract vehicle ID number from the string (e.g., "V1001" -> 1001)
    const vehicleIdNum = parseInt(this.vehicleId!.replace('V', ''));
    
    this.diagnosticService.getVehicleStats().subscribe({
      next: (vehicleStats: VehicleStats[]) => {
        const vehicleStat = vehicleStats.find(stat => stat.vehicleId === vehicleIdNum);
        
        if (vehicleStat) {
          this.vehicle = this.convertToVehicleDetails(vehicleStat);
          this.originalVehicle = { ...this.vehicle };
        } else {
          console.error('Vehicle not found in stats');
          // Create a default vehicle if not found
          this.vehicle = this.createDefaultVehicle(vehicleIdNum);
          this.originalVehicle = { ...this.vehicle };
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading vehicle details:', error);
        // Create a default vehicle on error
        const vehicleIdNum = parseInt(this.vehicleId!.replace('V', ''));
        this.vehicle = this.createDefaultVehicle(vehicleIdNum);
        this.originalVehicle = { ...this.vehicle };
        this.isLoading = false;
      }
    });
  }

  loadVehicleLogs(): void {
    this.isLoadingLogs = true;
    
    // Extract vehicle ID number from the string (e.g., "V1001" -> 1001)
    const vehicleIdNum = parseInt(this.vehicleId!.replace('V', ''));
    
    this.diagnosticService.getAllLogs().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          // Filter logs for this specific vehicle
          this.vehicleLogs = response.data.filter((log: DiagnosticLogEntry) => log.vehicleId === vehicleIdNum);
        } else {
          this.vehicleLogs = [];
        }
        // Initialize search and pagination
        this.filterLogs();
        this.updatePagination();
        this.isLoadingLogs = false;
      },
      error: (error: any) => {
        console.error('Error loading vehicle logs:', error);
        this.vehicleLogs = [];
        this.filterLogs();
        this.updatePagination();
        this.isLoadingLogs = false;
      }
    });
  }

  formatVehicleId(vehicleId: number): string {
    const padNumber = (num: number, size: number): string => {
      let str = num.toString();
      while (str.length < size) {
        str = '0' + str;
      }
      return str;
    };
    return `V${padNumber(vehicleId, 4)}`;
  }

  formatDateTime(dateTime: string): string {
    if (!dateTime) return 'No data';
    try {
      return new Date(dateTime).toLocaleString();
    } catch {
      return dateTime;
    }
  }

  // Search functionality
  onSearchChange(): void {
    this.currentPage = 1;
    this.filterLogs();
    this.updatePagination();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearchChange();
  }

  private filterLogs(): void {
    if (!this.searchTerm.trim()) {
      this.filteredLogs = [...this.vehicleLogs];
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredLogs = this.vehicleLogs.filter(log => 
        log.code.toLowerCase().includes(searchLower) ||
        log.message.toLowerCase().includes(searchLower) ||
        log.level.toLowerCase().includes(searchLower)
      );
    }
  }

  // Pagination functionality
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredLogs.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    if (this.currentPage < 1) this.currentPage = 1;
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedLogs = this.filteredLogs.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  private createDefaultVehicle(vehicleId: number): VehicleDetails {
    return {
      id: `V${vehicleId.toString().length < 3 ? '0'.repeat(3 - vehicleId.toString().length) + vehicleId.toString() : vehicleId.toString()}`,
      name: `Vehicle ${vehicleId}`,
      model: 'Unknown Model',
      year: 2024,
      status: 'offline',
      lastDiagnostic: 'No data',
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      debugCount: 0,
      totalLogs: 0,
      lastUpdate: 'No data',
    };
  }

  private convertToVehicleDetails(stats: VehicleStats): VehicleDetails {
    const padNumber = (num: number, size: number): string => {
      let str = num.toString();
      while (str.length < size) {
        str = '0' + str;
      }
      return str;
    };

    return {
      id: `V${padNumber(stats.vehicleId, 4)}`,
      name: `Vehicle ${padNumber(stats.vehicleId, 4)}`,
      model: `Model ${stats.vehicleId}`,
      year: 2020 + (stats.vehicleId % 5),
      status: this.calculateStatus(stats),
      lastDiagnostic: stats.lastDiagnostic,
      errorCount: stats.errorCount,
      warningCount: stats.warningCount,
      infoCount: stats.infoCount,
      debugCount: stats.debugCount,
      totalLogs: stats.totalLogs,
      lastUpdate: stats.lastUpdate,
    };
  }

  private calculateStatus(stats: VehicleStats): 'active' | 'maintenance' | 'offline' {
    if (stats.errorCount > 5) return 'maintenance';
    if (stats.totalLogs === 0) return 'offline';
    return 'active';
  }

  startEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
    if (this.originalVehicle) {
      this.vehicle = { ...this.originalVehicle };
    }
  }

  saveVehicle(): void {
    if (this.vehicle) {
      this.onSave.emit(this.vehicle);
      this.originalVehicle = { ...this.vehicle };
      this.isEditing = false;
    }
  }

  goBack(): void {
    this.onBack.emit();
    this.router.navigate(['/vehicles']);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'maintenance': return 'status-maintenance';
      case 'offline': return 'status-offline';
      default: return 'status-offline';
    }
  }
} 