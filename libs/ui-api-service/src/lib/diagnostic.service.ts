import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

// Define types locally since data-model library doesn't exist
export interface DiagnosticLogEntry {
  timestamp: string;
  vehicleId: number;
  level: string;
  code: string;
  message: string;
}

export interface SearchLogsDto {
  vehicle?: number;
  code?: string;
  from?: string;
  to?: string;
}

export interface UploadLogsDto {
  content: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
  error?: string;
}

export interface VehicleStats {
  vehicleId: number;
  totalLogs: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  debugCount: number;
  lastDiagnostic?: string;
  lastUpdate?: string;
}

@Injectable({ providedIn: 'root' })
export class DiagnosticService {
  private readonly apiUrl = '/api/logs';
  
  // Cache for better performance
  private cachedLogs: DiagnosticLogEntry[] = [];
  private cachedVehicleStats: VehicleStats[] = [];
  private logsSubject = new BehaviorSubject<DiagnosticLogEntry[]>([]);
  private vehicleStatsSubject = new BehaviorSubject<VehicleStats[]>([]);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  // Observable getters for reactive updates
  get logs$() { return this.logsSubject.asObservable(); }
  get vehicleStats$() { return this.vehicleStatsSubject.asObservable(); }
  get isLoading$() { return this.isLoadingSubject.asObservable(); }

  searchLogs(searchDto: SearchLogsDto): Observable<ApiResponse<DiagnosticLogEntry[]>> {
    
    // If we have cached logs, search through them
    if (this.cachedLogs.length > 0) {
      const filteredLogs = this.filterLogs(this.cachedLogs, searchDto);
      return of({
        success: true,
        data: filteredLogs,
        count: filteredLogs.length,
        message: `Found ${filteredLogs.length} logs matching search criteria`
      });
    }

    // Otherwise, fetch all logs first and then search
    return this.getAllLogs().pipe(
      map(response => {
        if (response.success && response.data) {
          const filteredLogs = this.filterLogs(response.data, searchDto);
          return {
            success: true,
            data: filteredLogs,
            count: filteredLogs.length,
            message: `Found ${filteredLogs.length} logs matching search criteria`
          };
        }
        return { success: false, error: 'Failed to load logs for search' };
      }),
      catchError(error => {
        return of({ success: false, error: 'Failed to search logs' });
      })
    );
  }

  private filterLogs(logs: DiagnosticLogEntry[], searchDto: SearchLogsDto): DiagnosticLogEntry[] {
    
    return logs.filter(log => {
      // Filter by vehicle ID
      if (searchDto.vehicle !== undefined && searchDto.vehicle !== null) {
        if (log.vehicleId !== searchDto.vehicle) {
          return false;
        }
      }

      // Filter by error code (case-insensitive partial match)
      if (searchDto.code && searchDto.code.trim() !== '') {
        if (log.code.toLowerCase().indexOf(searchDto.code.toLowerCase()) === -1) {
          return false;
        }
      }

      // Filter by date range
      if (searchDto.from || searchDto.to) {
        const logDate = new Date(log.timestamp);
        
        if (searchDto.from && searchDto.from.trim() !== '') {
          const fromDate = new Date(searchDto.from);
          if (logDate < fromDate) {
            return false;
          }
        }
        
        if (searchDto.to && searchDto.to.trim() !== '') {
          const toDate = new Date(searchDto.to);
          if (logDate > toDate) {
            return false;
          }
        }
      }

      return true;
    });
  }

  getAllLogs(): Observable<ApiResponse<DiagnosticLogEntry[]>> {
    // Return cached data if available, otherwise fetch from API
    if (this.cachedLogs.length > 0) {
      return of({
        success: true,
        data: this.cachedLogs,
        count: this.cachedLogs.length,
        message: `Retrieved ${this.cachedLogs.length} cached log entries`
      });
    }

    this.isLoadingSubject.next(true);
    return this.http.get<ApiResponse<DiagnosticLogEntry[]>>(`${this.apiUrl}/all`)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.cachedLogs = response.data;
            this.logsSubject.next(response.data);
          }
          this.isLoadingSubject.next(false);
        }),
        catchError(error => {
          this.isLoadingSubject.next(false);
          return of({ success: false, error: 'Failed to get logs' });
        })
      );
  }

  getLogsCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/count`)
      .pipe(
        catchError(error => {
          return of({ success: false, error: 'Failed to get logs count' });
        })
      );
  }

  uploadLogs(content: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/upload`, { content })
      .pipe(
        tap(response => {
          if (response.success) {
            // Clear cache to force refresh
            this.cachedLogs = [];
            this.cachedVehicleStats = [];
            this.logsSubject.next([]);
            this.vehicleStatsSubject.next([]);
          }
        }),
        catchError(error => {
          return of({ success: false, error: 'Failed to upload logs' });
        })
      );
  }

  uploadFile(file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/upload-file`, formData)
      .pipe(
        tap(response => {
          if (response.success) {
            // Clear cache to force refresh
            this.cachedLogs = [];
            this.cachedVehicleStats = [];
            this.logsSubject.next([]);
            this.vehicleStatsSubject.next([]);
          }
        }),
        catchError(error => {
          return of({ success: false, error: 'Failed to upload file' });
        })
      );
  }

  clearLogs(): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}`)
      .pipe(
        tap(response => {
          if (response.success) {
            // Clear cache
            this.cachedLogs = [];
            this.cachedVehicleStats = [];
            this.logsSubject.next([]);
            this.vehicleStatsSubject.next([]);
          }
        }),
        catchError(error => {
          return of({ success: false, error: 'Failed to clear logs' });
        })
      );
  }

  getVehicleStats(): Observable<VehicleStats[]> {
    if (this.cachedVehicleStats.length > 0) {
      return of(this.cachedVehicleStats);
    }

    return this.getAllLogs().pipe(
      map(response => {
        if (response.success && response.data) {
          const stats = this.calculateVehicleStats(response.data);
          this.cachedVehicleStats = stats;
          this.vehicleStatsSubject.next(stats);
          return stats;
        }
        return [];
      }),
      catchError(error => {
        return of([]);
      })
    );
  }

  private calculateVehicleStats(logs: DiagnosticLogEntry[]): VehicleStats[] {
    const vehicleMap: { [key: number]: VehicleStats } = {};

    logs.forEach(log => {
      if (!vehicleMap[log.vehicleId]) {
        vehicleMap[log.vehicleId] = {
          vehicleId: log.vehicleId,
          totalLogs: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          debugCount: 0,
          lastDiagnostic: log.timestamp,
          lastUpdate: log.timestamp
        };
      }

      const stats = vehicleMap[log.vehicleId];
      stats.totalLogs++;

      switch (log.level.toLowerCase()) {
        case 'error':
          stats.errorCount++;
          break;
        case 'warning':
        case 'warn':
          stats.warningCount++;
          break;
        case 'info':
          stats.infoCount++;
          break;
        case 'debug':
          stats.debugCount++;
          break;
        default:
          // Log any unexpected levels for debugging
          break;
      }

      // Update last diagnostic and update times
      const logTime = new Date(log.timestamp);
      const lastDiagnosticTime = stats.lastDiagnostic ? new Date(stats.lastDiagnostic) : new Date(0);
      const lastUpdateTime = stats.lastUpdate ? new Date(stats.lastUpdate) : new Date(0);

      if (logTime > lastDiagnosticTime) {
        stats.lastDiagnostic = log.timestamp;
      }
      if (logTime > lastUpdateTime) {
        stats.lastUpdate = log.timestamp;
      }
    });

    const result: VehicleStats[] = [];
    for (const key in vehicleMap) {
      if (vehicleMap.hasOwnProperty(key)) {
        const stats = vehicleMap[key];
        result.push(stats);
      }
    }
    return result.sort((a: VehicleStats, b: VehicleStats) => a.vehicleId - b.vehicleId);
  }

  private calculateStatus(stats?: VehicleStats): 'active' | 'maintenance' | 'offline' {
    if (!stats) return 'offline';
    if (stats.errorCount > 5) return 'maintenance';
    if (stats.totalLogs === 0 || !stats.lastUpdate) return 'offline';
    return 'active';
  }

  private calculateUptime(logs: DiagnosticLogEntry[]): number {
    if (logs.length === 0) return 0;
    
    const now = new Date();
    const firstLog = new Date(logs[logs.length - 1].timestamp);
    const totalTime = now.getTime() - firstLog.getTime();
    const errorTime = logs
      .filter(log => log.level.toLowerCase() === 'error')
      .reduce((total, log) => total + 1, 0) * 60000; // Assume 1 minute per error
    
    return Math.max(0, ((totalTime - errorTime) / totalTime) * 100);
  }

  private calculateAverageErrorsPerDay(logs: DiagnosticLogEntry[]): number {
    if (logs.length === 0) return 0;
    
    const errorLogs = logs.filter(log => log.level.toLowerCase() === 'error');
    const firstLog = new Date(logs[logs.length - 1].timestamp);
    const lastLog = new Date(logs[0].timestamp);
    const daysDiff = (lastLog.getTime() - firstLog.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysDiff > 0 ? errorLogs.length / daysDiff : 0;
  }

  private getLastMaintenanceDate(logs: DiagnosticLogEntry[]): string {
    const maintenanceLogs = logs.filter(log => 
      log.message.toLowerCase().indexOf('maintenance') !== -1 || 
      log.code.toLowerCase().indexOf('maint') !== -1
    );
    
    if (maintenanceLogs.length === 0) return 'No maintenance records';
    
    return new Date(maintenanceLogs[0].timestamp).toLocaleDateString();
  }

  getVehicleDetails(vehicleId: number): Observable<ApiResponse<any>> {
    this.isLoadingSubject.next(true);
    
    // Call backend API to get vehicle details
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/vehicle/${vehicleId}`)
      .pipe(
        tap(response => {
          this.isLoadingSubject.next(false);
        }),
        catchError(error => {
          this.isLoadingSubject.next(false);
          return of({ success: false, error: 'Failed to get vehicle details' });
        })
      );
  }

  // Force refresh data
  refreshData(): void {
    this.cachedLogs = [];
    this.cachedVehicleStats = [];
    this.logsSubject.next([]);
    this.vehicleStatsSubject.next([]);
  }
} 