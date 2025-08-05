import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, FormsModule],
  template: `
    <div style="display: flex; height: 100vh; width: 100vw; background: #f0f0f0;">
      <!-- Test Sidebar -->
      <div style="width: 250px; background: red; color: white; padding: 20px; border: 3px solid black;">
        <h2 style="margin: 0 0 20px 0;">SIDEBAR TEST</h2>
        <p style="margin: 0 0 10px 0;">This should be visible</p>
        <button (click)="testClick()" style="padding: 10px; background: white; color: red; border: none; border-radius: 5px; cursor: pointer;">
          Test Button
        </button>
      </div>

      <!-- Main Content -->
      <div style="flex: 1; background: white; padding: 20px;">
        <h1>Main Content</h1>
        <p>If you can see a red sidebar on the left, the layout is working.</p>
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
  `]
})
export class AppComponent {
  constructor(public router: Router) {}

  testClick() {
    alert('Sidebar button clicked!');
  }
} 