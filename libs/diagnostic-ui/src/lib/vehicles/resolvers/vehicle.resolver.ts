import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { DiagnosticService, VehicleStats } from '@vehicles-dashboard/ui-api-service';

export interface VehicleData {
  vehicleId: string;
  vehicleStats?: VehicleStats;
  exists: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleResolver implements Resolve<VehicleData> {
  
  constructor(private diagnosticService: DiagnosticService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<VehicleData> | Promise<VehicleData> | VehicleData {
    
    const vehicleId = route.paramMap.get('id');
    
    if (!vehicleId) {
      return of({ vehicleId: '', exists: false });
    }

    // Extract numeric ID from vehicle ID (e.g., "V001" -> 1)
    const numericId = parseInt(vehicleId.replace('V', ''));
    
    return new Observable(observer => {
      this.diagnosticService.getVehicleStats().subscribe({
        next: (vehicleStats: VehicleStats[]) => {
          const stats = vehicleStats.find(v => v.vehicleId === numericId);
          
          if (stats) {
            observer.next({
              vehicleId: vehicleId,
              vehicleStats: stats,
              exists: true
            });
          } else {
            observer.next({
              vehicleId: vehicleId,
              exists: false
            });
          }
          observer.complete();
        },
        error: (error) => {
          console.error('Error resolving vehicle data:', error);
          observer.next({
            vehicleId: vehicleId,
            exists: false
          });
          observer.complete();
        }
      });
    });
  }
} 