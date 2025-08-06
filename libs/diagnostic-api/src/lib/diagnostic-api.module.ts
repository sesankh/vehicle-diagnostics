import { Module } from '@nestjs/common';
import { DiagnosticLogsController } from './diagnostic-logs.controller';
import { DiagnosticLogsService, DiagnosticDbService } from '@vehicles-dashboard/db-services';

@Module({
  controllers: [DiagnosticLogsController],
  providers: [DiagnosticLogsService, DiagnosticDbService],
  exports: [DiagnosticLogsService, DiagnosticDbService],
})
export class DiagnosticApiModule {
  constructor() {
    console.log('🔧 DiagnosticApiModule loaded');
  }
}
