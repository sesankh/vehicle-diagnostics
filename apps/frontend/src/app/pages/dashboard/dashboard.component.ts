import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DiagnosticService, VehicleStats, DiagnosticLogEntry } from '@vehicles-dashboard/diagnostic-ui';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon active">
            <span class="material-icons">directions_car</span>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ totalVehicles }}</h3>
            <p class="stat-label">Total Vehicles</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon active">
            <span class="material-icons">check_circle</span>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ activeVehicles }}</h3>
            <p class="stat-label">Active Vehicles</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon maintenance">
            <span class="material-icons">build</span>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ maintenanceVehicles }}</h3>
            <p class="stat-label">In Maintenance</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon offline">
            <span class="material-icons">error</span>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ offlineVehicles }}</h3>
            <p class="stat-label">Offline</p>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-activity" *ngIf="recentLogs.length > 0">
        <div class="section-header">
          <h2>Recent Activity</h2>
          <button class="view-all-btn" (click)="viewReports()">View All</button>
        </div>
        
        <div class="activity-list">
          <div class="activity-item" *ngFor="let log of recentLogs.slice(0, 5)">
            <div class="activity-icon" [class]="getActivityIconClass(log.level)">
              <span class="material-icons">{{ getActivityIcon(log.level) }}</span>
            </div>
            <div class="activity-content">
              <div class="activity-header">
                <span class="vehicle-id">Vehicle {{ log.vehicleId }}</span>
                <span class="activity-time">{{ formatTime(log.timestamp) }}</span>
              </div>
              <p class="activity-message">{{ log.message }}</p>
              <span class="error-code">{{ log.code }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <div class="section-header">
          <h2>Quick Actions</h2>
        </div>
        
        <div class="actions-grid">
          <button class="action-card" (click)="addVehicle()">
            <span class="material-icons">add</span>
            <h3>Add Vehicle</h3>
            <p>Register a new vehicle to the fleet</p>
          </button>

          <button class="action-card" (click)="runDiagnostic()">
            <span class="material-icons">build</span>
            <h3>Run Diagnostic</h3>
            <p>Perform system check on selected vehicles</p>
          </button>

          <button class="action-card" (click)="viewReports()">
            <span class="material-icons">assessment</span>
            <h3>View Reports</h3>
            <p>Generate and view fleet reports</p>
          </button>

          <button class="action-card" (click)="uploadLogs()">
            <span class="material-icons">upload</span>
            <h3>Upload Logs</h3>
            <p>Import diagnostic log files</p>
          </button>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div class="loading-overlay" *ngIf="isLoading">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      display: flex;
      flex-direction: column;
      gap: 30px;
      position: relative;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 20px;
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .stat-icon.active {
      background: linear-gradient(135deg, #28a745, #20c997);
    }

    .stat-icon.maintenance {
      background: linear-gradient(135deg, #ffc107, #fd7e14);
    }

    .stat-icon.offline {
      background: linear-gradient(135deg, #dc3545, #e83e8c);
    }

    .stat-icon .material-icons {
      font-size: 28px;
    }

    .stat-content h3 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      color: #333;
    }

    .stat-content p {
      margin: 5px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .recent-activity {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .section-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    .view-all-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: transform 0.2s;
    }

    .view-all-btn:hover {
      transform: translateY(-1px);
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      padding: 15px;
      border-radius: 8px;
      background: #f8f9fa;
      transition: background-color 0.2s;
    }

    .activity-item:hover {
      background: #e9ecef;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .activity-icon.error {
      background: linear-gradient(135deg, #dc3545, #e83e8c);
    }

    .activity-icon.warning {
      background: linear-gradient(135deg, #ffc107, #fd7e14);
    }

    .activity-icon.info {
      background: linear-gradient(135deg, #17a2b8, #20c997);
    }

    .activity-content {
      flex: 1;
    }

    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
    }

    .vehicle-id {
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .activity-time {
      color: #666;
      font-size: 12px;
    }

    .activity-message {
      margin: 0 0 5px 0;
      color: #333;
      font-size: 14px;
      line-height: 1.4;
    }

    .error-code {
      background: #e9ecef;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #495057;
    }

    .quick-actions {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .action-card {
      background: white;
      border: 2px solid #f0f0f0;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .action-card:hover {
      border-color: #667eea;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }

    .action-card .material-icons {
      font-size: 32px;
      color: #667eea;
    }

    .action-card h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .action-card p {
      margin: 0;
      color: #666;
      font-size: 14px;
      line-height: 1.4;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .loading-spinner {
      background: white;
      padding: 30px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .dashboard {
        gap: 20px;
      }

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
      }

      .stat-card {
        padding: 20px;
      }

      .stat-content h3 {
        font-size: 28px;
      }

      .recent-activity,
      .quick-actions {
        padding: 20px;
      }

      .actions-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
      }

      .action-card {
        padding: 20px;
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  totalVehicles = 0;
  activeVehicles = 0;
  maintenanceVehicles = 0;
  offlineVehicles = 0;
  recentLogs: DiagnosticLogEntry[] = [];
  isLoading = true;

  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private diagnosticService: DiagnosticService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Subscribe to loading state
    this.subscriptions.add(
      this.diagnosticService.isLoading$.subscribe(loading => {
        this.isLoading = loading;
      })
    );

    // Load vehicle stats
    this.subscriptions.add(
      this.diagnosticService.getVehicleStats().subscribe({
        next: (vehicleStats: VehicleStats[]) => {
          this.calculateDashboardStats(vehicleStats);
        },
        error: (error) => {
          console.error('Error loading vehicle stats:', error);
        }
      })
    );

    // Load recent logs
    this.subscriptions.add(
      this.diagnosticService.getAllLogs().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.recentLogs = response.data.slice(0, 10); // Get latest 10 logs
          }
        },
        error: (error) => {
          console.error('Error loading recent logs:', error);
        }
      })
    );
  }

  private calculateDashboardStats(vehicleStats: VehicleStats[]): void {
    this.totalVehicles = vehicleStats.length;
    
    let active = 0;
    let maintenance = 0;
    let offline = 0;

    vehicleStats.forEach(stats => {
      if (stats.errorCount > 5) {
        maintenance++;
      } else if (stats.totalLogs === 0 || !stats.lastUpdate) {
        offline++;
      } else {
        active++;
      }
    });

    this.activeVehicles = active;
    this.maintenanceVehicles = maintenance;
    this.offlineVehicles = offline;
  }

  getActivityIcon(level: string): string {
    switch (level.toLowerCase()) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }

  getActivityIconClass(level: string): string {
    switch (level.toLowerCase()) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  addVehicle() {
    console.log('Add vehicle clicked');
    this.router.navigate(['/vehicles']);
  }

  runDiagnostic() {
    console.log('Run diagnostic clicked');
    this.router.navigate(['/diagnostics']);
  }

  viewReports() {
    console.log('View reports clicked');
    this.router.navigate(['/diagnostics']);
  }

  uploadLogs() {
    console.log('Upload logs clicked');
    this.router.navigate(['/diagnostics']);
  }
} 