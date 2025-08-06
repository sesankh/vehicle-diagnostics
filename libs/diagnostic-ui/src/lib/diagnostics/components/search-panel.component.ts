import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Define SearchLogsDto to match the ui-api-service interface
interface SearchLogsDto {
  vehicle?: number;
  code?: string;
  from?: string;
  to?: string;
}

@Component({
  selector: 'app-search-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-panel">
      <h3>Search Diagnostic Logs</h3>
      <div class="search-form">
        <div class="form-row">
          <div class="form-group">
            <label for="vehicle">Vehicle ID:</label>
            <input 
              type="number" 
              id="vehicle" 
              [(ngModel)]="searchCriteria.vehicle" 
              class="form-control"
              placeholder="Enter vehicle ID">
          </div>
          <div class="form-group">
            <label for="code">Error Code:</label>
            <input 
              type="text" 
              id="code" 
              [(ngModel)]="searchCriteria.code" 
              class="form-control"
              placeholder="Enter error code">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="from">From Date:</label>
            <input 
              type="datetime-local" 
              id="from" 
              [(ngModel)]="searchCriteria.from" 
              class="form-control">
          </div>
          <div class="form-group">
            <label for="to">To Date:</label>
            <input 
              type="datetime-local" 
              id="to" 
              [(ngModel)]="searchCriteria.to" 
              class="form-control">
          </div>
        </div>
        <div class="search-actions">
          <button 
            class="btn btn-primary" 
            (click)="onSearch()"
            [disabled]="!hasSearchCriteria()">
            Search
          </button>
          <button 
            class="btn btn-secondary" 
            (click)="onClear()">
            Clear
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-panel {
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-bottom: 1rem;
      background: white;
    }

    .search-panel h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .search-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #495057;
    }

    .form-control {
      padding: 0.5rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .form-control:focus {
      outline: none;
      border-color: #80bdff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    .search-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background-color 0.2s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-primary:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #5a6268;
    }
  `]
})
export class SearchPanelComponent {
  @Output() search = new EventEmitter<SearchLogsDto>();
  @Output() clearSearch = new EventEmitter<void>();

  searchCriteria: SearchLogsDto = {
    vehicle: undefined,
    code: '',
    from: '',
    to: ''
  };

  onSearch(): void {
    // Clean up the search criteria - remove empty values
    const cleanCriteria: SearchLogsDto = {};
    
    if (this.searchCriteria.vehicle) {
      cleanCriteria.vehicle = this.searchCriteria.vehicle;
    }
    if (this.searchCriteria.code) {
      cleanCriteria.code = this.searchCriteria.code;
    }
    if (this.searchCriteria.from) {
      cleanCriteria.from = this.searchCriteria.from;
    }
    if (this.searchCriteria.to) {
      cleanCriteria.to = this.searchCriteria.to;
    }

    this.search.emit(cleanCriteria);
  }

  onClear(): void {
    this.searchCriteria = {
      vehicle: undefined,
      code: '',
      from: '',
      to: ''
    };
    this.clearSearch.emit();
  }

  hasSearchCriteria(): boolean {
    return !!(this.searchCriteria.vehicle || 
              this.searchCriteria.code || 
              this.searchCriteria.from || 
              this.searchCriteria.to);
  }
} 