import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiagnosticApiModule } from '@vehicles-dashboard/diagnostic-api';

@Module({
  imports: [DiagnosticApiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {
    console.log('🏠 AppModule loaded');
  }
}
