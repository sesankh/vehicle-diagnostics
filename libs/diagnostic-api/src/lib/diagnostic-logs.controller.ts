import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Delete,
  UseInterceptors,
  UploadedFile,
  Headers,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { DiagnosticLogsService } from '@vehicles-dashboard/db-services';

@Controller('logs')
export class DiagnosticLogsController {
  constructor(private readonly diagnosticLogsService: DiagnosticLogsService) {
    console.log('🔧 DiagnosticLogsController loaded');
  }

  @Get('test')
  async test() {
    console.log('🧪 DiagnosticLogsController test route called');
    try {
      const logsCount = await this.diagnosticLogsService.getLogsCount();
      return {
        success: true,
        message: 'Controller is working!',
        data: {
          timestamp: new Date().toISOString(),
          logsCount: logsCount.data,
        }
      };
    } catch (error) {
      console.error('Error in test route:', error);
      return {
        success: false,
        message: 'Controller error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  @Get('db-info')
  async getDatabaseInfo() {
    return this.diagnosticLogsService.getDatabaseInfo();
  }

  @Get('vehicles')
  async getUniqueVehicles() {
    return this.diagnosticLogsService.getUniqueVehicles();
  }

  @Get('vehicle/:id/stats')
  async getVehicleStats(@Req() request: any) {
    const vehicleId = parseInt(request.params.id, 10);
    return this.diagnosticLogsService.getVehicleStats(vehicleId);
  }

  @Get()
  async searchLogs(@Query() searchDto: any) {
    return this.diagnosticLogsService.searchLogs(searchDto);
  }

  @Get('all')
  async getAllLogs() {
    return this.diagnosticLogsService.getAllLogs();
  }

  @Get('count')
  async getLogsCount() {
    return this.diagnosticLogsService.getLogsCount();
  }

  @Post('upload')
  async uploadLogs(@Body() uploadDto: any) {
    return this.diagnosticLogsService.uploadLogs(uploadDto);
  }

  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    return this.diagnosticLogsService.uploadFile(file);
  }

  @Post('webhook')
  async webhook(
    @Req() request: Request,
    @Headers('x-webhook-secret') webhookSecret?: string,
    @Headers('content-type') contentType?: string
  ) {
    const expectedSecret = process.env.WEBHOOK_SECRET || 'default-webhook-secret-2024';
    
    if (webhookSecret && webhookSecret !== expectedSecret) {
      return {
        success: false,
        message: 'Invalid webhook secret',
        status: 401
      };
    }

    let logContent = '';

    if (contentType?.includes('application/json')) {
      if (request.body.logs && Array.isArray(request.body.logs)) {
        logContent = request.body.logs.join('\n');
      } else if (request.body.content) {
        logContent = request.body.content;
      } else if (typeof request.body === 'string') {
        logContent = request.body;
      } else {
        return {
          success: false,
          message: 'Invalid JSON payload format',
          status: 400
        };
      }
    } else if (contentType?.includes('text/plain')) {
      if (Buffer.isBuffer(request.body)) {
        logContent = request.body.toString('utf-8');
      } else {
        logContent = request.body as string;
      }
    } else {
      logContent = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
    }

    if (!logContent || logContent.trim().length === 0) {
      return {
        success: false,
        message: 'No log content provided',
        status: 400
      };
    }

    return this.diagnosticLogsService.processWebhook(logContent, !!webhookSecret);
  }

  @Delete()
  async clearLogs() {
    return this.diagnosticLogsService.clearLogs();
  }
}