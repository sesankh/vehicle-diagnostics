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
  template: `
    <div class="vehicles-table-container">
      <!-- Table Header -->
      <div class="table-header">
        <div class="header-left">
          <h2 class="table-title">Vehicles</h2>
          <span class="vehicle-count">{{ vehicles.length }} vehicles</span>
        </div>
        <div class="header-right">
          <div class="search-box">
            <span class="material-icons search-icon">search</span>
            <input 
              type="text" 
              placeholder="Search vehicles..." 
              [(ngModel)]="searchTerm"
              (input)="onSearchChange()"
              class="search-input"
            >
          </div>
          <button class="add-btn" (click)="onAddVehicle.emit()">
            <span class="material-icons">add</span>
            Add Vehicle
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="table-wrapper">
        <table class="vehicles-table">
          <thead>
            <tr>
              <th class="sortable" (click)="sortBy('id')">
                Vehicle ID
                <span class="material-icons sort-icon">
                  {{ getSortIcon('id') }}
                </span>
              </th>
              <th class="sortable" (click)="sortBy('name')">
                Name
                <span class="material-icons sort-icon">
                  {{ getSortIcon('name') }}
                </span>
              </th>
              <th class="sortable" (click)="sortBy('model')">
                Model
                <span class="material-icons sort-icon">
                  {{ getSortIcon('model') }}
                </span>
              </th>
              <th class="sortable" (click)="sortBy('year')">
                Year
                <span class="material-icons sort-icon">
                  {{ getSortIcon('year') }}
                </span>
              </th>
              <th class="sortable" (click)="sortBy('status')">
                Status
                <span class="material-icons sort-icon">
                  {{ getSortIcon('status') }}
                </span>
              </th>
              <th>Last Diagnostic</th>
              <th>Error Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let vehicle of filteredVehicles" class="vehicle-row">
              <td class="vehicle-id">{{ vehicle.id }}</td>
              <td class="vehicle-name">{{ vehicle.name }}</td>
              <td class="vehicle-model">{{ vehicle.model }}</td>
              <td class="vehicle-year">{{ vehicle.year }}</td>
              <td class="vehicle-status">
                <span class="status-badge" [class]="'status-' + vehicle.status">
                  {{ getStatusText(vehicle.status) }}
                </span>
              </td>
              <td class="last-diagnostic">
                {{ vehicle.lastDiagnostic || 'No data' }}
              </td>
              <td class="error-count">
                <span class="error-badge" *ngIf="vehicle.errorCount && vehicle.errorCount > 0">
                  {{ vehicle.errorCount }}
                </span>
                <span *ngIf="!vehicle.errorCount || vehicle.errorCount === 0">-</span>
              </td>
              <td class="actions">
                <button class="action-btn view-btn" (click)="onViewVehicle.emit(vehicle)" title="View Details">
                  <span class="material-icons">visibility</span>
                </button>
                <button class="action-btn edit-btn" (click)="onEditVehicle.emit(vehicle)" title="Edit">
                  <span class="material-icons">edit</span>
                </button>
                <button class="action-btn delete-btn" (click)="onDeleteVehicle.emit(vehicle)" title="Delete">
                  <span class="material-icons">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div *ngIf="filteredVehicles.length === 0" class="empty-state">
          <span class="material-icons empty-icon">directions_car</span>
          <h3>No vehicles found</h3>
          <p>{{ searchTerm ? 'Try adjusting your search terms' : 'Add your first vehicle to get started' }}</p>
          <button *ngIf="!searchTerm" class="add-first-btn" (click)="onAddVehicle.emit()">
            Add First Vehicle
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="filteredVehicles.length > 0">
        <div class="pagination-info">
          Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ filteredVehicles.length }} vehicles
        </div>
        <div class="pagination-controls">
          <button 
            class="pagination-btn" 
            [disabled]="currentPage === 1"
            (click)="previousPage()"
          >
            <span class="material-icons">chevron_left</span>
          </button>
          <span class="page-info">{{ currentPage }} of {{ totalPages }}</span>
          <button 
            class="pagination-btn" 
            [disabled]="currentPage === totalPages"
            (click)="nextPage()"
          >
            <span class="material-icons">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vehicles-table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .table-header {
      padding: 24px 30px;
      border-bottom: 1px solid #e1e5e9;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 20px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .table-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }

    .vehicle-count {
      color: #666;
      font-size: 14px;
      background-color: #f8f9fa;
      padding: 4px 12px;
      border-radius: 12px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 15px;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      color: #999;
      font-size: 18px;
    }

    .search-input {
      padding: 10px 12px 10px 40px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      width: 250px;
      transition: border-color 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .add-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: transform 0.2s;
    }

    .add-btn:hover {
      transform: translateY(-1px);
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .vehicles-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 800px;
    }

    .vehicles-table th {
      background-color: #f8f9fa;
      padding: 16px 12px;
      text-align: left;
      font-weight: 600;
      color: #333;
      border-bottom: 1px solid #e1e5e9;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .sortable {
      cursor: pointer;
      user-select: none;
      transition: background-color 0.2s;
    }

    .sortable:hover {
      background-color: #e9ecef;
    }

    .sort-icon {
      font-size: 16px;
      margin-left: 5px;
      color: #999;
    }

    .vehicles-table td {
      padding: 16px 12px;
      border-bottom: 1px solid #f0f0f0;
      vertical-align: middle;
    }

    .vehicle-row:hover {
      background-color: #f8f9fa;
    }

    .vehicle-id {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: #667eea;
    }

    .vehicle-name {
      font-weight: 500;
      color: #333;
    }

    .vehicle-model {
      color: #666;
    }

    .vehicle-year {
      color: #666;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-active {
      background-color: #d4edda;
      color: #155724;
    }

    .status-maintenance {
      background-color: #fff3cd;
      color: #856404;
    }

    .status-offline {
      background-color: #f8d7da;
      color: #721c24;
    }

    .last-diagnostic {
      color: #666;
      font-size: 14px;
    }

    .error-badge {
      background-color: #dc3545;
      color: white;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      background: none;
      border: none;
      padding: 6px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
      color: #666;
    }

    .action-btn:hover {
      background-color: #f0f0f0;
    }

    .view-btn:hover {
      color: #667eea;
    }

    .edit-btn:hover {
      color: #28a745;
    }

    .delete-btn:hover {
      color: #dc3545;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .empty-icon {
      font-size: 48px;
      color: #ddd;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .empty-state p {
      margin: 0 0 20px 0;
      color: #666;
    }

    .add-first-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
    }

    .pagination {
      padding: 20px 30px;
      border-top: 1px solid #e1e5e9;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: #f8f9fa;
    }

    .pagination-info {
      color: #666;
      font-size: 14px;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .pagination-btn {
      background: white;
      border: 1px solid #ddd;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .pagination-btn:hover:not(:disabled) {
      background-color: #f0f0f0;
      border-color: #ccc;
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-info {
      color: #666;
      font-size: 14px;
      min-width: 60px;
      text-align: center;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .table-header {
        padding: 20px;
        flex-direction: column;
        align-items: stretch;
      }

      .header-left, .header-right {
        justify-content: space-between;
      }

      .search-input {
        width: 100%;
        max-width: 250px;
      }

      .pagination {
        padding: 15px 20px;
        flex-direction: column;
        gap: 15px;
      }

      .pagination-controls {
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .table-header {
        padding: 15px;
      }

      .table-title {
        font-size: 20px;
      }

      .search-input {
        max-width: 200px;
      }

      .add-btn {
        padding: 8px 16px;
        font-size: 14px;
      }
    }
  `]
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
    let filtered = this.vehicles;

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(vehicle =>
        vehicle.id.toLowerCase().includes(term) ||
        vehicle.name.toLowerCase().includes(term) ||
        vehicle.model.toLowerCase().includes(term) ||
        vehicle.year.toString().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[this.sortField];
      const bValue = b[this.sortField];
      
      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return this.sortDirection === 'asc' ? -1 : 1;
      if (bValue === undefined) return this.sortDirection === 'asc' ? 1 : -1;
      
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }

  get paginatedVehicles(): Vehicle[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredVehicles.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredVehicles.length / this.itemsPerPage);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.itemsPerPage, this.filteredVehicles.length);
  }

  onSearchChange() {
    this.currentPage = 1; // Reset to first page when searching
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
    return this.sortDirection === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
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
} 