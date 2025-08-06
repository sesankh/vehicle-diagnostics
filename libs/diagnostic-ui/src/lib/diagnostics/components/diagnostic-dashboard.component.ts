import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchPanelComponent } from '../../components/search-panel/search-panel.component';
import { CustomTableComponent, TableColumn, TableAction, ProgressLoaderComponent, FileUploadComponent } from '@vehicles-dashboard/shared-ui';
import { DiagnosticService, ApiResponse, DiagnosticLogEntry, SearchLogsDto } from '@vehicles-dashboard/ui-api-service';

// Display interface for formatted logs
interface DisplayLogEntry {
  timestamp: string;
  vehicleId: string;
  level: string;
  code: string;
  message: string;
}

@Component({
  selector: 'app-diagnostic-dashboard',
  standalone: true,
  imports: [CommonModule, SearchPanelComponent, CustomTableComponent, ProgressLoaderComponent, FileUploadComponent],
  templateUrl: './diagnostic-dashboard.component.html',
  styleUrl: './diagnostic-dashboard.component.css'
})
export class DiagnosticDashboardComponent implements OnInit {
  logs: DisplayLogEntry[] = [];
  isLoading = false;
  isFiltered = false;

  columns: TableColumn[] = [
    { key: 'timestamp', label: 'Timestamp', sortable: true, type: 'date' },
    { key: 'vehicleId', label: 'Vehicle ID', sortable: true, type: 'text', width: '120px' },
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
          this.loadAllLogs();
        } else {
          this.isLoading = false;
        }
      },
      error: (error) => {
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
          this.logs = response.data.map(log => this.convertToDisplayLog(log));
        } else {
          this.logs = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
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
          this.logs = response.data.map(log => this.convertToDisplayLog(log));
        } else {
          this.logs = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.logs = [];
        this.isLoading = false;
      }
    });
  }

  private convertToDisplayLog(log: DiagnosticLogEntry): DisplayLogEntry {
    return {
      timestamp: log.timestamp,
      vehicleId: this.formatVehicleId(log.vehicleId),
      level: log.level,
      code: log.code,
      message: log.message
    };
  }

  private formatVehicleId(vehicleId: number): string {
    const padNumber = (num: number, size: number): string => {
      let str = num.toString();
      while (str.length < size) {
        str = '0' + str;
      }
      return str;
    };
    return `V${padNumber(vehicleId, 4)}`;
  }

  clearAllLogs(): void {
    if (confirm('Are you sure you want to clear all diagnostic logs? This action cannot be undone.')) {
      this.isLoading = true;
      
      this.diagnosticService.clearLogs().subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.success) {
            this.logs = [];
          } else {
            this.isLoading = false;
          }
        },
        error: (error) => {
          this.isLoading = false;
        }
      });
    }
  }

  handleTableAction(event: { action: string; item: DisplayLogEntry }): void {
    switch (event.action) {
      case 'view':
        // TODO: Implement view log details
        break;
    }
  }

  handleRowClick(log: DisplayLogEntry): void {
    // TODO: Implement log details view
  }
} 