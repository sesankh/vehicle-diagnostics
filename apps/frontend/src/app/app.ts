import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, FormsModule],
  selector: 'app-root',
  template: `
    <div style="display: flex; height: 100vh; width: 100vw;">
      <!-- Sidebar -->
      <div [style.width]="sidebarOpen ? '280px' : '70px'" style="background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%); color: white; display: flex; flex-direction: column; transition: width 0.3s ease;">
        <!-- User Profile Section -->
        <div style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: center;">
          <div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
            <span class="material-icons" style="font-size: 30px;">account_circle</span>
          </div>
          <div *ngIf="sidebarOpen">
            <h3 style="margin: 0 0 5px 0; font-size: 16px;">John Doe</h3>
            <p style="margin: 0 0 3px 0; font-size: 12px; opacity: 0.8;">Fleet Manager</p>
            <small style="font-size: 11px; opacity: 0.7;">john.doe@company.com</small>
          </div>
        </div>

        <!-- Navigation Menu -->
        <div style="flex: 1; padding: 20px 0;">
          <div style="margin-bottom: 5px;">
            <button (click)="navigateTo('/dashboard')" style="width: 100%; padding: 15px 20px; background: none; border: none; color: white; text-align: left; cursor: pointer; display: flex; align-items: center; border-radius: 0; border-left: 3px solid transparent;" [style.background]="router.url.includes('/dashboard') ? 'rgba(255,255,255,0.2)' : 'transparent'" [style.borderLeftColor]="router.url.includes('/dashboard') ? 'white' : 'transparent'">
              <span class="material-icons" style="margin-right: 15px; font-size: 20px;">dashboard</span>
              <span *ngIf="sidebarOpen">Dashboard</span>
            </button>
          </div>
          
          <div style="margin-bottom: 5px;">
            <button (click)="navigateTo('/vehicles')" style="width: 100%; padding: 15px 20px; background: none; border: none; color: white; text-align: left; cursor: pointer; display: flex; align-items: center; border-radius: 0; border-left: 3px solid transparent;" [style.background]="router.url.includes('/vehicles') ? 'rgba(255,255,255,0.2)' : 'transparent'" [style.borderLeftColor]="router.url.includes('/vehicles') ? 'white' : 'transparent'">
              <span class="material-icons" style="margin-right: 15px; font-size: 20px;">directions_car</span>
              <span *ngIf="sidebarOpen">Vehicles</span>
            </button>
          </div>
          
          <div style="margin-bottom: 5px;">
            <button (click)="navigateTo('/diagnostics')" style="width: 100%; padding: 15px 20px; background: none; border: none; color: white; text-align: left; cursor: pointer; display: flex; align-items: center; border-radius: 0; border-left: 3px solid transparent;" [style.background]="router.url.includes('/diagnostics') ? 'rgba(255,255,255,0.2)' : 'transparent'" [style.borderLeftColor]="router.url.includes('/diagnostics') ? 'white' : 'transparent'">
              <span class="material-icons" style="margin-right: 15px; font-size: 20px;">build</span>
              <span *ngIf="sidebarOpen">Diagnostics</span>
            </button>
          </div>
          
          <div style="margin-bottom: 5px;">
            <button (click)="navigateTo('/logs')" style="width: 100%; padding: 15px 20px; background: none; border: none; color: white; text-align: left; cursor: pointer; display: flex; align-items: center; border-radius: 0; border-left: 3px solid transparent;" [style.background]="router.url.includes('/logs') ? 'rgba(255,255,255,0.2)' : 'transparent'" [style.borderLeftColor]="router.url.includes('/logs') ? 'white' : 'transparent'">
              <span class="material-icons" style="margin-right: 15px; font-size: 20px;">list_alt</span>
              <span *ngIf="sidebarOpen">Logs</span>
            </button>
          </div>
        </div>

        <!-- Toggle Button -->
        <div style="padding: 15px 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
          <button (click)="toggleSidebar()" style="background: none; border: none; color: white; cursor: pointer; padding: 8px; border-radius: 4px;">
            <span class="material-icons">{{ sidebarOpen ? 'menu_open' : 'menu' }}</span>
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div style="flex: 1; display: flex; flex-direction: column; background: #f5f7fa;">
        <!-- Header -->
        <div style="background: white; padding: 15px 30px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-bottom: 1px solid #e1e5e9;">
          <div style="display: flex; align-items: center; gap: 20px;">
            <button (click)="toggleSidebar()" style="background: none; border: none; color: #666; cursor: pointer; padding: 8px; border-radius: 4px;">
              <span class="material-icons">menu</span>
            </button>
            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #333;">{{ getPageTitle() }}</h1>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; padding: 8px 16px; background: #f8f9fa; border-radius: 20px; color: #666;">
            <span class="material-icons">account_circle</span>
            <span>John Doe</span>
          </div>
        </div>

        <!-- Content -->
        <div style="flex: 1; padding: 30px; overflow-y: auto;">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    button:hover {
      background-color: rgba(255,255,255,0.1) !important;
    }
  `]
})
export class App {
  sidebarOpen = true;

  constructor(public router: Router) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    console.log('Sidebar toggled:', this.sidebarOpen);
  }

  navigateTo(path: string) {
    console.log('Navigating to:', path);
    this.router.navigate([path]);
  }

  getPageTitle(): string {
    const url = this.router.url;
    console.log('Current URL:', url);
    if (url.includes('/dashboard')) return 'Dashboard';
    if (url.includes('/vehicles')) return 'Vehicles';
    if (url.includes('/diagnostics')) return 'Diagnostics';
    if (url.includes('/logs')) return 'Logs';
    return 'Dashboard';
  }
}
