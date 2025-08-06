import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { VehiclesComponent } from '../components/vehicles/vehicles.component';
import { VehicleDetailsComponent } from '../components/vehicle-details/vehicle-details.component';
import { VehiclesTableComponent } from '../components/vehicles-table/vehicles-table.component';
import { VehiclesGuard } from './vehicles.guard';
import { VehicleResolver } from './vehicle.resolver';

const routes: Routes = [
  {
    path: '',
    canActivate: [VehiclesGuard],
    children: [
      {
        path: '',
        component: VehiclesComponent,
        data: { 
          title: 'Vehicles List',
          breadcrumb: 'Vehicles'
        }
      },
      {
        path: ':id',
        component: VehicleDetailsComponent,
        resolve: {
          vehicleData: VehicleResolver
        },
        data: { 
          title: 'Vehicle Details',
          breadcrumb: 'Vehicle Details'
        },
        children: [
          {
            path: 'overview',
            component: VehicleDetailsComponent,
            data: { 
              title: 'Vehicle Overview',
              breadcrumb: 'Overview'
            }
          },
          {
            path: 'diagnostics',
            component: VehicleDetailsComponent,
            data: { 
              title: 'Vehicle Diagnostics',
              breadcrumb: 'Diagnostics'
            }
          },
          {
            path: 'maintenance',
            component: VehicleDetailsComponent,
            data: { 
              title: 'Vehicle Maintenance',
              breadcrumb: 'Maintenance'
            }
          },
          {
            path: '',
            redirectTo: 'overview',
            pathMatch: 'full'
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    VehiclesComponent,
    VehicleDetailsComponent,
    VehiclesTableComponent
  ],
  declarations: [],
  exports: [RouterModule]
})
export class VehiclesAdvancedModule { } 