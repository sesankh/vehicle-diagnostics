import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiagnosticApiModule } from '@vehicles-dashboard/diagnostic-api';
import { HttpExceptionFilter, LoggingInterceptor } from '@vehicles-dashboard/api-utils';

@Module({
  imports: [DiagnosticApiModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {
  constructor() {
    console.log('🏠 AppModule loaded');
  }
}
