import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagnosticLogEntry } from '../../services/diagnostic.service';

@Component({
  selector: 'app-logs-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logs-table.component.html',
  styleUrl: './logs-table.component.css'
})
export class LogsTableComponent {
  @Input() logs: DiagnosticLogEntry[] = [];

  sortField: keyof DiagnosticLogEntry = 'timestamp';
  sortDirection: 'asc' | 'desc' = 'desc';
  currentPage = 1;
  itemsPerPage = 20;

  get sortedLogs(): DiagnosticLogEntry[] {
    return [...this.logs].sort((a, b) => {
      const aValue = a[this.sortField];
      const bValue = b[this.sortField];
      
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  get paginatedLogs(): DiagnosticLogEntry[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.sortedLogs.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.logs.length / this.itemsPerPage);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.logs.length);
  }

  sortBy(field: keyof DiagnosticLogEntry): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  getSortIcon(field: keyof DiagnosticLogEntry): string {
    if (this.sortField !== field) return 'unfold_more';
    return this.sortDirection === 'asc' ? 'expand_less' : 'expand_more';
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  getBadgeClass(level: string): string {
    switch (level.toLowerCase()) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  exportToCSV(): void {
    const headers = ['Timestamp', 'Vehicle ID', 'Level', 'Code', 'Message'];
    const csvContent = [
      headers.join(','),
      ...this.logs.map(log => [
        log.timestamp,
        log.vehicleId,
        log.level,
        log.code,
        `"${log.message.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostic-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}