import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DiagnosticsGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Add any authentication or authorization logic here
    // For now, we'll just allow access
    console.log('DiagnosticsGuard: Checking access to', state.url);
    
    // Example: Check if user has permission to access diagnostics
    // const hasPermission = this.authService.hasPermission('diagnostics:read');
    // if (!hasPermission) {
    //   this.router.navigate(['/unauthorized']);
    //   return false;
    // }
    
    return true;
  }
} 