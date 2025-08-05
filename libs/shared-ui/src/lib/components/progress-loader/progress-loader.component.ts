import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-loader.component.html',
  styleUrl: './progress-loader.component.css'
})
export class ProgressLoaderComponent {
  @Input() loading: boolean = false;
  @Input() message: string = 'Loading...';
  @Input() overlay: boolean = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
} 