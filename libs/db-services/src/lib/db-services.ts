import { Module } from '@nestjs/common';
import { DiagnosticService } from './diagnostic-service/diagnostic.service';

@Module({
  providers: [DiagnosticService],
  exports: [DiagnosticService],
})
export class DbServicesModule {}
