import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  selector: 'app-vehicles-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicles-table.component.html',
  styleUrl: './vehicles-table.component.css'
})
export class VehiclesTableComponent {
  @Input() vehicles: Vehicle[] = [];
  @Output() onAddVehicle = new EventEmitter<void>();
  @Output() onViewVehicle = new EventEmitter<Vehicle>();
  @Output() onEditVehicle = new EventEmitter<Vehicle>();
  @Output() onDeleteVehicle = new EventEmitter<Vehicle>();

  searchTerm = '';
  sortField: keyof Vehicle = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage = 1;
  itemsPerPage = 10;

  get filteredVehicles(): Vehicle[] {
    const term = this.searchTerm.toLowerCase();
    return this.vehicles.filter(vehicle =>
      vehicle.id.toLowerCase().includes(term) ||
      vehicle.name.toLowerCase().includes(term) ||
      vehicle.model.toLowerCase().includes(term) ||
      vehicle.status.toLowerCase().includes(term)
    );
  }

  get paginatedVehicles(): Vehicle[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredVehicles.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredVehicles.length / this.itemsPerPage);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredVehicles.length);
  }

  onSearchChange() {
    this.currentPage = 1;
  }

  sortBy(field: keyof Vehicle) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  getSortIcon(field: keyof Vehicle): string {
    if (this.sortField !== field) return 'unfold_more';
    return this.sortDirection === 'asc' ? 'expand_less' : 'expand_more';
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  getStatusText(status: Vehicle['status']): string {
    switch (status) {
      case 'active': return 'Active';
      case 'maintenance': return 'Maintenance';
      case 'offline': return 'Offline';
      default: return status;
    }
  }

  getErrorBadgeClass(errorCount: number): string {
    if (errorCount === 0) return 'low';
    if (errorCount <= 3) return 'medium';
    return 'high';
  }
}