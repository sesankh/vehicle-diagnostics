import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  totalLogs?: number;
  warningCount?: number;
  infoCount?: number;
}

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.css'
})
export class VehiclesComponent implements OnInit, OnDestroy {
  vehicles: Vehicle[] = [];
  filteredVehicles: Vehicle[] = [];
  searchTerm = '';
  isLoading = false;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  paginatedVehicles: Vehicle[] = [];
  
  // Expose Math for template use
  Math = Math;
  
  private subscriptions = new Subscription();

  constructor(
    private diagnosticService: DiagnosticService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVehicleData();
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  loadVehicleData(): void {
    this.isLoading = true;
    
    this.subscriptions.add(
      this.diagnosticService.getVehicleStats().subscribe({
        next: (vehicleStats: VehicleStats[]) => {
          this.vehicles = vehicleStats.map(stats => this.convertToVehicle(stats));
          this.filteredVehicles = [...this.vehicles];
          this.updatePagination();
          this.isLoading = false;
        },
        error: (error: any) => {
          this.vehicles = [];
          this.filteredVehicles = [];
          this.isLoading = false;
        }
      })
    );
  }

  onSearchChange(): void {
    if (!this.searchTerm.trim()) {
      this.filteredVehicles = [...this.vehicles];
    } else {
      const search = this.searchTerm.toLowerCase();
      this.filteredVehicles = this.vehicles.filter(vehicle =>
        vehicle.id.toLowerCase().includes(search) ||
        vehicle.name.toLowerCase().includes(search) ||
        vehicle.model.toLowerCase().includes(search) ||
        vehicle.status.toLowerCase().includes(search)
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredVehicles.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedVehicles = this.filteredVehicles.slice(startIndex, endIndex);
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
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1);
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(this.totalPages);
      }
    }
    
    return pages;
  }

  formatDateTime(dateString: string | undefined): string {
    if (!dateString) return 'No data';
    
    try {
      // Parse UTC date and format without timezone conversion
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'UTC' // Keep UTC timezone
      });
    } catch (error) {
      return 'Invalid date';
    }
  }

  convertToVehicle(stats: VehicleStats): Vehicle {
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
      lastUpdate: stats.lastUpdate,
      totalLogs: stats.totalLogs,
      warningCount: stats.warningCount,
      infoCount: stats.infoCount,
    };
  }

  private calculateStatus(stats: VehicleStats): 'active' | 'maintenance' | 'offline' {
    if (stats.errorCount > 5) return 'maintenance';
    if (stats.totalLogs === 0) return 'offline';
    return 'active';
  }

  handleTableAction(event: { action: string; item: Vehicle }): void {
    switch (event.action) {
      case 'view':
        this.router.navigate(['/vehicles', event.item.id]);
        break;
      case 'edit':
        this.router.navigate(['/vehicles', event.item.id, 'edit']);
        break;
      case 'delete':
        // Handle delete action
        break;
    }
  }
  
  handleRowClick(vehicle: Vehicle): void {
    this.router.navigate(['/vehicles', vehicle.id]);
  }

  navigateToVehicleDetails(vehicleId: string): void {
    console.log('Navigating to vehicle details:', vehicleId);
    this.router.navigate(['/vehicles', vehicleId]);
  }

  addVehicle(): void {
    console.log('Add vehicle clicked');
    this.router.navigate(['/vehicles/new']);
  }

  deleteVehicle(vehicle: Vehicle): void {
    console.log('Delete vehicle:', vehicle);
    // TODO: Implement delete functionality
    alert(`Delete vehicle ${vehicle.name}?`);
  }
} 