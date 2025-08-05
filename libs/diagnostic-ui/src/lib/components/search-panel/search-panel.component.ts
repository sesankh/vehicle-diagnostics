import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { SearchLogsDto } from '../../services/diagnostic.service';

@Component({
  selector: 'app-search-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="search-panel">
      <h3>Search Diagnostic Logs</h3>
      <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="search-form">
        <div class="form-row">
          <div class="form-group">
            <label for="vehicle">Vehicle ID:</label>
            <input 
              type="number" 
              id="vehicle" 
              formControlName="vehicle" 
              placeholder="Enter Vehicle ID"
              class="form-control"
            >
          </div>
          
          <div class="form-group">
            <label for="code">Error Code:</label>
            <input 
              type="text" 
              id="code" 
              formControlName="code" 
              placeholder="Enter Error Code (e.g., U0420)"
              class="form-control"
            >
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="from">From Date:</label>
            <input 
              type="datetime-local" 
              id="from" 
              formControlName="from" 
              class="form-control"
            >
          </div>
          
          <div class="form-group">
            <label for="to">To Date:</label>
            <input 
              type="datetime-local" 
              id="to" 
              formControlName="to" 
              class="form-control"
            >
          </div>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="searchForm.invalid">
            Search
          </button>
          <button type="button" class="btn btn-secondary" (click)="onClear()">
            Clear
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .search-panel {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .search-panel h3 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 1.2rem;
    }

    .search-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      margin-bottom: 5px;
      font-weight: 500;
      color: #555;
    }

    .form-control {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }

    .form-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-start;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .btn-primary:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #545b62;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SearchPanelComponent {
  @Output() search = new EventEmitter<SearchLogsDto>();
  @Output() clear = new EventEmitter<void>();

  searchForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      vehicle: [''],
      code: [''],
      from: [''],
      to: ['']
    });
  }

  onSearch(): void {
    if (this.searchForm.valid) {
      const searchData: SearchLogsDto = {};
      
      // Only include non-empty values
      if (this.searchForm.value.vehicle) {
        searchData.vehicle = Number(this.searchForm.value.vehicle);
      }
      if (this.searchForm.value.code) {
        searchData.code = this.searchForm.value.code;
      }
      if (this.searchForm.value.from) {
        searchData.from = this.searchForm.value.from;
      }
      if (this.searchForm.value.to) {
        searchData.to = this.searchForm.value.to;
      }

      this.search.emit(searchData);
    }
  }

  onClear(): void {
    this.searchForm.reset();
    this.clear.emit();
  }
} 