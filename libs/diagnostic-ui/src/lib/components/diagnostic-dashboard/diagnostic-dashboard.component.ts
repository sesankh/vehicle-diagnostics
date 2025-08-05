import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchPanelComponent } from '../search-panel/search-panel.component';
import { LogsTableComponent } from '../logs-table/logs-table.component';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { DiagnosticService, ApiResponse, DiagnosticLogEntry, SearchLogsDto } from '../../services/diagnostic.service';

@Component({
  selector: 'app-diagnostic-dashboard',
  standalone: true,
  imports: [CommonModule, SearchPanelComponent, LogsTableComponent, FileUploadComponent],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>🚗 Vehicle Diagnostics Dashboard</h1>
        <p>Upload, search, and analyze vehicle diagnostic logs</p>
      </header>

      <div class="dashboard-content">
        <!-- File Upload Section -->
        <section class="dashboard-section">
          <app-file-upload (fileUpload)="onFileUpload($event)"></app-file-upload>
        </section>

        <!-- Search Section -->
        <section class="dashboard-section">
          <app-search-panel 
            (search)="onSearch($event)" 
            (clear)="onClearSearch()">
          </app-search-panel>
        </section>

        <!-- Results Section -->
        <section class="dashboard-section">
          <div class="results-header">
            <div class="results-info">
              <h2>Diagnostic Results</h2>
              <p *ngIf="logs.length > 0">
                Showing {{ logs.length }} log entries
                <span *ngIf="isFiltered">(filtered results)</span>
              </p>
            </div>
            <div class="results-actions">
              <button 
                class="btn btn-primary" 
                (click)="loadAllLogs()"
                [disabled]="isLoading">
                {{ isLoading ? 'Loading...' : 'Load All Logs' }}
              </button>
              <button 
                class="btn btn-danger" 
                (click)="clearAllLogs()"
                [disabled]="logs.length === 0 || isLoading">
                Clear All Logs
              </button>
            </div>
          </div>

          <app-logs-table [logs]="logs"></app-logs-table>
        </section>
      </div>

      <!-- Loading Overlay -->
      <div class="loading-overlay" *ngIf="isLoading">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .dashboard-header {
      text-align: center;
      color: white;
      margin-bottom: 30px;
    }

    .dashboard-header h1 {
      margin: 0 0 10px 0;
      font-size: 2.5rem;
      font-weight: 700;
    }

    .dashboard-header p {
      margin: 0;
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .dashboard-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-section {
      margin-bottom: 30px;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      background: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .results-info h2 {
      margin: 0 0 5px 0;
      color: #333;
      font-size: 1.5rem;
    }

    .results-info p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .results-actions {
      display: flex;
      gap: 10px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
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

    .btn-danger {
      background-color: #dc3545;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background-color: #c82333;
    }

    .btn-danger:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
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
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 10px;
      }

      .dashboard-header h1 {
        font-size: 2rem;
      }

      .results-header {
        flex-direction: column;
        gap: 15px;
      }

      .results-actions {
        width: 100%;
        justify-content: stretch;
      }

      .btn {
        flex: 1;
      }
    }
  `]
})
export class DiagnosticDashboardComponent implements OnInit {
  logs: DiagnosticLogEntry[] = [];
  isLoading = false;
  isFiltered = false;

  constructor(private diagnosticService: DiagnosticService) {}

  ngOnInit(): void {
    this.loadAllLogs();
  }

  onFileUpload(content: string): void {
    this.isLoading = true;
    
    this.diagnosticService.uploadLogs(content).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          console.log('File uploaded successfully:', response.message);
          // Reload logs after upload
          this.loadAllLogs();
        } else {
          console.error('Upload failed:', response.message);
        }
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch(searchDto: SearchLogsDto): void {
    this.isLoading = true;
    this.isFiltered = true;
    
    this.diagnosticService.searchLogs(searchDto).subscribe({
      next: (response: ApiResponse<DiagnosticLogEntry[]>) => {
        if (response.success && response.data) {
          this.logs = response.data;
        } else {
          console.error('Search failed:', response.message);
          this.logs = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.logs = [];
        this.isLoading = false;
      }
    });
  }

  onClearSearch(): void {
    this.isFiltered = false;
    this.loadAllLogs();
  }

  loadAllLogs(): void {
    this.isLoading = true;
    this.isFiltered = false;
    
    this.diagnosticService.getAllLogs().subscribe({
      next: (response: ApiResponse<DiagnosticLogEntry[]>) => {
        if (response.success && response.data) {
          this.logs = response.data;
        } else {
          console.error('Failed to load logs:', response.message);
          this.logs = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Load logs error:', error);
        this.logs = [];
        this.isLoading = false;
      }
    });
  }

  clearAllLogs(): void {
    if (confirm('Are you sure you want to clear all diagnostic logs? This action cannot be undone.')) {
      this.isLoading = true;
      
      this.diagnosticService.clearLogs().subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.success) {
            console.log('Logs cleared successfully');
            this.logs = [];
          } else {
            console.error('Clear failed:', response.message);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Clear error:', error);
          this.isLoading = false;
        }
      });
    }
  }
} 