import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagnosticLogEntry } from '../../services/diagnostic.service';

@Component({
  selector: 'app-logs-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logs-table-container">
      <div class="table-header">
        <h3>Diagnostic Logs ({{ logs.length }} entries)</h3>
        <div class="table-actions">
          <button class="btn btn-secondary" (click)="exportToCSV()" [disabled]="logs.length === 0">
            Export CSV
          </button>
        </div>
      </div>
      
      <div class="table-wrapper">
        <table class="logs-table" *ngIf="logs.length > 0; else noData">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Vehicle ID</th>
              <th>Level</th>
              <th>Code</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of logs; trackBy: trackByLog" [class]="getLogRowClass(log.level)">
              <td>{{ formatTimestamp(log.timestamp) }}</td>
              <td>{{ log.vehicleId }}</td>
              <td>
                <span class="badge" [class]="getBadgeClass(log.level)">
                  {{ log.level }}
                </span>
              </td>
              <td>
                <code class="error-code">{{ log.code }}</code>
              </td>
              <td>{{ log.message }}</td>
            </tr>
          </tbody>
        </table>
        
        <ng-template #noData>
          <div class="no-data">
            <p>No diagnostic logs found.</p>
            <p>Upload a log file or adjust your search criteria.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .logs-table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e9ecef;
      background: #f8f9fa;
    }

    .table-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.2rem;
    }

    .table-actions {
      display: flex;
      gap: 10px;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .logs-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .logs-table th {
      background: #f8f9fa;
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      color: #495057;
      border-bottom: 2px solid #dee2e6;
      white-space: nowrap;
    }

    .logs-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #e9ecef;
      vertical-align: top;
    }

    .logs-table tbody tr:hover {
      background-color: #f8f9fa;
    }

    .logs-table tbody tr.error-row {
      background-color: #fff5f5;
    }

    .logs-table tbody tr.warning-row {
      background-color: #fffbf0;
    }

    .logs-table tbody tr.info-row {
      background-color: #f0f8ff;
    }

    .badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .badge-error {
      background-color: #dc3545;
      color: white;
    }

    .badge-warning {
      background-color: #ffc107;
      color: #212529;
    }

    .badge-info {
      background-color: #17a2b8;
      color: white;
    }

    .error-code {
      background: #f8f9fa;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #495057;
    }

    .no-data {
      padding: 40px 20px;
      text-align: center;
      color: #6c757d;
    }

    .no-data p {
      margin: 5px 0;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #545b62;
    }

    .btn-secondary:disabled {
      background-color: #adb5bd;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .table-header {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
      }

      .logs-table th,
      .logs-table td {
        padding: 8px 12px;
        font-size: 13px;
      }
    }
  `]
})
export class LogsTableComponent {
  @Input() logs: DiagnosticLogEntry[] = [];

  trackByLog(index: number, log: DiagnosticLogEntry): number {
    return log.vehicleId;
  }

  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }

  getLogRowClass(level: string): string {
    switch (level.toLowerCase()) {
      case 'error':
        return 'error-row';
      case 'warning':
        return 'warning-row';
      case 'info':
        return 'info-row';
      default:
        return '';
    }
  }

  getBadgeClass(level: string): string {
    switch (level.toLowerCase()) {
      case 'error':
        return 'badge-error';
      case 'warning':
        return 'badge-warning';
      case 'info':
        return 'badge-info';
      default:
        return 'badge-info';
    }
  }

  exportToCSV(): void {
    if (this.logs.length === 0) return;

    const headers = ['Timestamp', 'Vehicle ID', 'Level', 'Code', 'Message'];
    const csvContent = [
      headers.join(','),
      ...this.logs.map(log => [
        `"${this.formatTimestamp(log.timestamp)}"`,
        log.vehicleId,
        `"${log.level}"`,
        `"${log.code}"`,
        `"${log.message}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagnostic-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
} 