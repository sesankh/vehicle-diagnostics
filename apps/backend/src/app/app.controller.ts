import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('test')
  test() {
    console.log('🧪 Main app controller test route called');
    console.error('🧪 Main app controller test route called - ERROR STREAM');
    return { message: 'Main app controller is working!', timestamp: new Date().toISOString() };
  }
}
