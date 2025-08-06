// Components (legacy - will be removed)
export * from './lib/components/diagnostic-dashboard/diagnostic-dashboard.component';
export * from './lib/components/search-panel/search-panel.component';
export * from './lib/components/logs-table/logs-table.component';
export * from '@vehicles-dashboard/shared-ui';
export * from './lib/components/vehicles-table/vehicles-table.component';
export * from './lib/components/dashboard/dashboard.component';
export * from './lib/components/vehicles/vehicles.component';
export * from './lib/components/vehicle-details/vehicle-details.component';

// New Module Structure
export * from './lib/dashboard/dashboard.module';
export * from './lib/vehicles/vehicles.module';
export * from './lib/diagnostics/diagnostics.module';

// Legacy Feature Modules (will be removed)
export * from './lib/dashboard/dashboard-feature.module';
export * from './lib/vehicles/vehicles-feature.module';
export * from './lib/diagnostics/diagnostics-feature.module';
export * from './lib/vehicles/vehicles-advanced.module';

// Guards and Resolvers
export * from './lib/vehicles/guards/vehicles.guard';
export * from './lib/vehicles/resolvers/vehicle.resolver';
export * from './lib/diagnostics/guards/diagnostics.guard';

// Re-export Vehicle interface from vehicles-table to avoid conflicts
export type { Vehicle } from './lib/components/vehicles-table/vehicles-table.component';
// Types
export * from '../../ui-api-service/src/lib/diagnostic.service';

// Re-export types from ui-api-service
export type { DiagnosticLogEntry, SearchLogsDto, UploadLogsDto, ApiResponse, VehicleStats } from '@vehicles-dashboard/ui-api-service';
