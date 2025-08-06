import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { VehiclesComponent } from './components/vehicles.component';
import { VehicleDetailsComponent } from './components/vehicle-details.component';
import { VehiclesTableComponent } from '../components/vehicles-table/vehicles-table.component';
import { VehiclesGuard } from './guards/vehicles.guard';
import { VehicleResolver } from './resolvers/vehicle.resolver';

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
        }
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
export class VehiclesModule { } 