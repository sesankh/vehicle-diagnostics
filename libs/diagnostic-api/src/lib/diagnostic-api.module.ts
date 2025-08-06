import { Module } from '@nestjs/common';
import { DiagnosticLogsController } from './diagnostic-logs.controller';
import { DiagnosticLogsService } from './services/diagnostic-logs.service';

@Module({
  controllers: [DiagnosticLogsController],
  providers: [DiagnosticLogsService],
  exports: [DiagnosticLogsService],
})
export class DiagnosticApiModule {
  constructor() {
    console.log('🔧 DiagnosticApiModule loaded');
  }
}
