import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { SearchLogsDto } from '../../services/diagnostic.service';

@Component({
  selector: 'app-search-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './search-panel.component.html',
  styleUrl: './search-panel.component.css'
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
      const searchData: SearchLogsDto = {
        vehicle: this.searchForm.get('vehicle')?.value || undefined,
        code: this.searchForm.get('code')?.value || undefined,
        from: this.searchForm.get('from')?.value || undefined,
        to: this.searchForm.get('to')?.value || undefined
      };

      // Only emit if at least one field has a value
      const hasValues = Object.keys(searchData).some(key => {
        const value = (searchData as any)[key];
        return value !== undefined && value !== null && value !== '';
      });

      if (hasValues) {
        this.search.emit(searchData);
      }
    }
  }

  onClear(): void {
    this.searchForm.reset();
    this.clear.emit();
  }
}