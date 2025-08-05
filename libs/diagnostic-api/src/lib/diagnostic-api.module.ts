import { Module } from '@nestjs/common';
import { DiagnosticLogsController } from './diagnostic-logs.controller';

@Module({
  controllers: [DiagnosticLogsController],
  providers: [],
  exports: [],
})
export class DiagnosticApiModule {
  constructor() {
    console.log(' DiagnosticApiModule loaded');
  }
}
