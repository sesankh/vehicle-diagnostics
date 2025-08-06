import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehiclesGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Add any authentication or authorization logic here
    // For now, we'll just allow access
    console.log('VehiclesGuard: Checking access to', state.url);
    
    // Example: Check if user has permission to access vehicles
    // const hasPermission = this.authService.hasPermission('vehicles:read');
    // if (!hasPermission) {
    //   this.router.navigate(['/unauthorized']);
    //   return false;
    // }
    
    return true;
  }
} 