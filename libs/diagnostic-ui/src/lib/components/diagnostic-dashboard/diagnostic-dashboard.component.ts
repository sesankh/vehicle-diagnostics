import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchPanelComponent } from '../search-panel/search-panel.component';
import { CustomTableComponent, TableColumn, TableAction, ProgressLoaderComponent, FileUploadComponent } from '@vehicles-dashboard/shared-ui';
import { DiagnosticService, ApiResponse, DiagnosticLogEntry, SearchLogsDto } from '@vehicles-dashboard/ui-api-service';

@Component({
  selector: 'app-diagnostic-dashboard',
  standalone: true,
  imports: [CommonModule, SearchPanelComponent, CustomTableComponent, ProgressLoaderComponent, FileUploadComponent],
  templateUrl: './diagnostic-dashboard.component.html',
  styleUrl: './diagnostic-dashboard.component.css'
})
export class DiagnosticDashboardComponent implements OnInit {
  logs: DiagnosticLogEntry[] = [];
  isLoading = false;
  isFiltered = false;

  columns: TableColumn[] = [
    { key: 'timestamp', label: 'Timestamp', sortable: true, type: 'date' },
    { key: 'vehicleId', label: 'Vehicle ID', sortable: true, type: 'number', width: '100px' },
    { key: 'level', label: 'Level', sortable: true, type: 'status', width: '100px' },
    { key: 'code', label: 'Code', sortable: true, width: '120px' },
    { key: 'message', label: 'Message', sortable: false }
  ];

  actions: TableAction[] = [
    { label: 'View', icon: 'visibility', action: 'view', color: 'primary' }
  ];

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
          // Sort logs from latest to oldest
          this.logs = response.data.sort((a: DiagnosticLogEntry, b: DiagnosticLogEntry) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
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
          // Sort logs from latest to oldest
          this.logs = response.data.sort((a: DiagnosticLogEntry, b: DiagnosticLogEntry) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
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

  handleTableAction(event: { action: string; item: DiagnosticLogEntry }): void {
    switch (event.action) {
      case 'view':
        console.log('View log entry:', event.item);
        // TODO: Implement view log details
        break;
    }
  }

  handleRowClick(log: DiagnosticLogEntry): void {
    console.log('Log entry clicked:', log);
    // TODO: Implement log details view
  }
}