import { Module } from '@nestjs/common';
import { DiagnosticLogsController } from './controllers/diagnostic-logs.controller';

@Module({
  controllers: [DiagnosticLogsController],
  providers: [],
  exports: [],
})
export class DiagnosticApiModule {
  constructor() {
    console.log('🔧 DiagnosticApiModule loaded');
  }
}
