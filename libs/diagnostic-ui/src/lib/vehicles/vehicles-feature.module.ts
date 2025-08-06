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
        data: { title: 'Vehicles List' }
      },
      { 
        path: ':id', 
        component: VehicleDetailsComponent,
        resolve: {
          vehicleData: VehicleResolver
        },
        data: { title: 'Vehicle Details' }
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
export class VehiclesFeatureModule { } 