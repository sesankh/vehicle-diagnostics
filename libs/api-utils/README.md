# API Utils

This library contains common utilities for NestJS API applications including interceptors, filters, and other shared components.

## Components

### HttpExceptionFilter
Global exception filter that provides consistent error responses across the application.

### LoggingInterceptor
Request/response logging interceptor for monitoring API performance and debugging.

## Usage

```typescript
import { HttpExceptionFilter, LoggingInterceptor } from '@vehicles-dashboard/api-utils';

// Apply globally in app.module.ts
{
  provide: APP_FILTER,
  useClass: HttpExceptionFilter,
},
{
  provide: APP_INTERCEPTOR,
  useClass: LoggingInterceptor,
}
``` 