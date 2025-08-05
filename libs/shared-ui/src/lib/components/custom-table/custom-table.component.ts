import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'date' | 'number' | 'status' | 'action';
  width?: string;
}

export interface TableAction {
  label: string;
  icon: string;
  action: string;
  color?: 'primary' | 'secondary' | 'danger' | 'warning';
}

@Component({
  selector: 'app-custom-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-table.component.html',
  styleUrl: './custom-table.component.css'
})
export class CustomTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: TableAction[] = [];
  @Input() itemsPerPage: number = 10;
  @Input() showSearch: boolean = true;
  @Input() showPagination: boolean = true;
  @Input() loading: boolean = false;

  @Output() onAction = new EventEmitter<{ action: string; item: any }>();
  @Output() onRowClick = new EventEmitter<any>();

  searchTerm = '';
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage = 1;

  get filteredData(): any[] {
    if (!this.searchTerm) return this.data;
    
    return this.data.filter(item =>
      Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    );
  }

  get sortedData(): any[] {
    if (!this.sortField) return this.filteredData;

    return [...this.filteredData].sort((a, b) => {
      const aValue = a[this.sortField];
      const bValue = b[this.sortField];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  get paginatedData(): any[] {
    if (!this.showPagination) return this.sortedData;
    
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.sortedData.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.sortedData.length / this.itemsPerPage);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.sortedData.length);
  }

  onSearchChange() {
    this.currentPage = 1;
  }

  sortBy(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  getSortIcon(field: string): string {
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

  handleAction(action: string, item: any) {
    this.onAction.emit({ action, item });
  }

  handleRowClick(item: any) {
    this.onRowClick.emit(item);
  }

  getCellValue(item: any, column: TableColumn): any {
    return item[column.key];
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'status-active';
      case 'maintenance': return 'status-maintenance';
      case 'offline': return 'status-offline';
      default: return 'status-default';
    }
  }

  getCellClass(column: TableColumn): string {
    return `cell-${column.type || 'text'}`;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
} 