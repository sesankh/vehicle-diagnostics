import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchPanelComponent } from '../search-panel/search-panel.component';
import { LogsTableComponent } from '../logs-table/logs-table.component';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { DiagnosticService, ApiResponse, DiagnosticLogEntry, SearchLogsDto } from '../../../../../ui-api-service/src/lib/diagnostic.service';

@Component({
  selector: 'app-diagnostic-dashboard',
  standalone: true,
  imports: [CommonModule, SearchPanelComponent, LogsTableComponent, FileUploadComponent],
  templateUrl: './diagnostic-dashboard.component.html',
  styleUrl: './diagnostic-dashboard.component.css'
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