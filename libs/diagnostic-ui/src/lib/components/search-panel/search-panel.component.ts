import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { SearchLogsDto } from '../../../../../ui-api-service/src/lib/diagnostic.service';

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
      const formValues = this.searchForm.value;
      
      const searchData: SearchLogsDto = {
        vehicle: formValues.vehicle ? Number(formValues.vehicle) : undefined,
        code: formValues.code || undefined,
        from: formValues.from || undefined,
        to: formValues.to || undefined
      };

      // Only emit if at least one field has a value
      const hasValues = Object.keys(searchData).some(key => {
        const value = (searchData as any)[key];
        return value !== undefined && value !== null && value !== '';
      });

      if (hasValues) {
        console.log('SearchPanel: Emitting search data:', searchData);
        this.search.emit(searchData);
      } else {
        console.log('SearchPanel: No search criteria provided');
      }
    }
  }

  onClear(): void {
    this.searchForm.reset();
    this.clear.emit();
  }
}