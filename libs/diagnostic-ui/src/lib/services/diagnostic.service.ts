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
  lastDiagnostic?: string;
  lastUpdate?: string;
}

@Injectable({ providedIn: 'root' })
export class DiagnosticService {
  private readonly apiUrl = 'http://localhost:3000/api/logs';
  
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
    const params = new HttpParams()
      .set('vehicle', searchDto.vehicle?.toString() || '')
      .set('code', searchDto.code || '')
      .set('from', searchDto.from || '')
      .set('to', searchDto.to || '');

    return this.http.get<ApiResponse<DiagnosticLogEntry[]>>(`${this.apiUrl}`, { params })
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.cachedLogs = response.data;
            this.logsSubject.next(response.data);
          }
        }),
        catchError(error => {
          console.error('Error searching logs:', error);
          return of({ success: false, error: 'Failed to search logs' });
        })
      );
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
          console.error('Error getting all logs:', error);
          this.isLoadingSubject.next(false);
          return of({ success: false, error: 'Failed to get logs' });
        })
      );
  }

  getLogsCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/count`)
      .pipe(
        catchError(error => {
          console.error('Error getting logs count:', error);
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
          console.error('Error uploading logs:', error);
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
          console.error('Error uploading file:', error);
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
          console.error('Error clearing logs:', error);
          return of({ success: false, error: 'Failed to clear logs' });
        })
      );
  }

  getVehicleStats(): Observable<VehicleStats[]> {
    // Return cached data if available
    if (this.cachedVehicleStats.length > 0) {
      return of(this.cachedVehicleStats);
    }

    // Otherwise, fetch all logs and calculate stats
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
        console.error('Error getting vehicle stats:', error);
        return of([]);
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

  private calculateVehicleStats(logs: DiagnosticLogEntry[]): VehicleStats[] {
    const vehicleMap = new Map<number, VehicleStats>();

    logs.forEach(log => {
      if (!vehicleMap.has(log.vehicleId)) {
        vehicleMap.set(log.vehicleId, {
          vehicleId: log.vehicleId,
          totalLogs: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
          lastDiagnostic: log.timestamp,
          lastUpdate: log.timestamp
        });
      }

      const stats = vehicleMap.get(log.vehicleId)!;
      stats.totalLogs++;

      switch (log.level.toLowerCase()) {
        case 'error':
          stats.errorCount++;
          break;
        case 'warning':
          stats.warningCount++;
          break;
        case 'info':
          stats.infoCount++;
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

    return Array.from(vehicleMap.values()).sort((a, b) => a.vehicleId - b.vehicleId);
  }
} 