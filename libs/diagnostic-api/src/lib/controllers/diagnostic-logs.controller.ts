import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ValidationPipe,
  HttpException,
  HttpStatus,
  Delete,
  UseInterceptors,
  UploadedFile,
  Headers,
  RawBodyRequest,
  Req
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';

// Define the DTOs locally since data-model project doesn't exist
export interface DiagnosticLogEntry {
  timestamp: string;
  vehicleId: number;
  level: string;
  code: string;
  message: string;
}

export interface SearchLogsDto {
  vehicle?: number;
  code?: string;
  from?: string;
  to?: string;
}

export interface UploadLogsDto {
  content: string;
}

@Controller('logs')
export class DiagnosticLogsController {
  private logs: DiagnosticLogEntry[] = [];
  private readonly dataFile = path.join(process.cwd(), 'data', 'diagnostic-logs.json');
  private isInitialized = false;

  constructor() {
    console.log('🚀 DiagnosticLogsController initialized');
    this.initializeData();
  }

  private async initializeData(): Promise<void> {
    try {
      const dataDir = path.dirname(this.dataFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('📁 Created data directory:', dataDir);
      }

      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf-8');
        if (data.trim()) {
          this.logs = JSON.parse(data);
          console.log(`📊 Loaded ${this.logs.length} logs from file: ${this.dataFile}`);
        } else {
          console.log('📊 Empty log file found, starting with empty logs');
          this.logs = [];
        }
      } else {
        console.log('📊 No existing log file found, starting with empty logs');
        this.logs = [];
        this.saveLogsToFile();
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Error loading logs from file:', error);
      this.logs = [];
      this.isInitialized = true;
    }
  }

  private saveLogsToFile(): void {
    try {
      if (!this.isInitialized) {
        console.log('⏳ Waiting for initialization before saving...');
        return;
      }

      const dataDir = path.dirname(this.dataFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      fs.writeFileSync(this.dataFile, JSON.stringify(this.logs, null, 2));
      console.log(`💾 Saved ${this.logs.length} logs to file: ${this.dataFile}`);
    } catch (error) {
      console.error('❌ Error saving logs to file:', error);
    }
  }

  @Get('test')
  async test() {
    console.log('🧪 Test endpoint called');
    return {
      message: 'Controller is working!',
      timestamp: new Date().toISOString(),
      logsCount: this.logs.length,
      isInitialized: this.isInitialized
    };
  }

  @Get()
  async searchLogs(@Query() searchDto: SearchLogsDto) {
    console.log('🔍 Search logs called with filters:', searchDto);
    
    try {
      if (!this.isInitialized) { await this.initializeData(); }
      let filteredLogs = [...this.logs];

      if (searchDto.vehicle) {
        filteredLogs = filteredLogs.filter(log => log.vehicleId === searchDto.vehicle);
      }

      if (searchDto.code) {
        filteredLogs = filteredLogs.filter(log => 
          log.code.toLowerCase().includes(searchDto.code!.toLowerCase())
        );
      }

      if (searchDto.from) {
        const fromDate = new Date(searchDto.from);
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) >= fromDate
        );
      }

      if (searchDto.to) {
        const toDate = new Date(searchDto.to);
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) <= toDate
        );
      }

      return {
        success: true,
        data: filteredLogs,
        count: filteredLogs.length,
        message: `Found ${filteredLogs.length} logs matching criteria`
      };
    } catch (error) {
      console.error('❌ Error searching logs:', error);
      throw new HttpException(
        'Failed to search logs',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('all')
  async getAllLogs() {
    console.log('📋 Get all logs called');
    
    try {
      if (!this.isInitialized) { await this.initializeData(); }
      const sortedLogs = [...this.logs].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return {
        success: true,
        data: sortedLogs,
        count: sortedLogs.length,
        message: `Retrieved ${sortedLogs.length} log entries`
      };
    } catch (error) {
      console.error('❌ Error getting all logs:', error);
      throw new HttpException(
        'Failed to get logs',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('count')
  async getLogsCount() {
    console.log('🔢 Get logs count called');
    
    try {
      if (!this.isInitialized) { await this.initializeData(); }
      const count = this.logs.length;
      return {
        success: true,
        count: count,
        message: `Total logs: ${count}`
      };
    } catch (error) {
      console.error('❌ Error getting logs count:', error);
      throw new HttpException(
        'Failed to get logs count',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('upload')
  async uploadLogs(@Body(ValidationPipe) uploadDto: UploadLogsDto) {
    console.log('📝 Upload logs called:', uploadDto);
    
    try {
      if (!this.isInitialized) { await this.initializeData(); }
      const result = this.parseAndStoreLogs(uploadDto.content);
      
      return {
        success: result.success,
        message: `Uploaded ${result.count} log entries`,
        count: result.count,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error uploading logs:', error);
      throw new HttpException(
        'Failed to upload logs',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    console.log('📁 Upload file called:', file?.originalname);
    
    try {
      if (!this.isInitialized) { await this.initializeData(); }
      if (!file) {
        throw new HttpException(
          'No file uploaded',
          HttpStatus.BAD_REQUEST
        );
      }

      const content = file.buffer.toString('utf-8');
      const result = this.parseAndStoreLogs(content);
      
      return {
        success: result.success,
        message: `Uploaded ${result.count} log entries from file: ${file.originalname}`,
        count: result.count,
        filename: file.originalname,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      throw new HttpException(
        'Failed to upload file',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('webhook')
  async webhook(
    @Req() request: Request,
    @Headers('x-webhook-secret') webhookSecret?: string,
    @Headers('content-type') contentType?: string
  ) {
    console.log('🔗 Webhook called:', {
      contentType,
      hasSecret: !!webhookSecret,
      bodyType: typeof request.body,
      bodyKeys: Object.keys(request.body || {})
    });

    try {
      if (!this.isInitialized) { await this.initializeData(); }
      const expectedSecret = process.env.WEBHOOK_SECRET || 'default-webhook-secret-2024';
      if (webhookSecret && webhookSecret !== expectedSecret) {
        throw new HttpException(
          'Invalid webhook secret',
          HttpStatus.UNAUTHORIZED
        );
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
          throw new HttpException(
            'Invalid JSON payload format',
            HttpStatus.BAD_REQUEST
          );
        }
      } else if (contentType?.includes('text/plain')) {
        if (Buffer.isBuffer(request.body)) {
          logContent = request.body.toString('utf-8');
        } else {
          logContent = request.body as string;
        }
        console.log('📝 Raw text content received:', logContent?.substring(0, 200) + '...');
      } else {
        logContent = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
      }

      if (!logContent || logContent.trim().length === 0) {
        console.error('❌ No log content provided. Body:', request.body);
        throw new HttpException(
          'No log content provided',
          HttpStatus.BAD_REQUEST
        );
      }

      const result = this.parseAndStoreLogs(logContent);

      return {
        success: result.success,
        message: `Webhook processed successfully. Uploaded ${result.count} log entries`,
        count: result.count,
        timestamp: new Date().toISOString(),
        note: webhookSecret ? 'Authenticated webhook' : 'Public webhook (no authentication)'
      };
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to process webhook',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete()
  async clearLogs() {
    console.log('🗑️ Clear logs called');
    
    try {
      if (!this.isInitialized) { await this.initializeData(); }
      this.logs = [];
      this.saveLogsToFile();
      return { 
        success: true, 
        message: 'All logs cleared successfully.' 
      };
    } catch (error) {
      console.error('❌ Error clearing logs:', error);
      throw new HttpException(
        'Failed to clear logs',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private parseAndStoreLogs(content: string): { success: boolean; count: number } {
    try {
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      let count = 0;

      for (const line of lines) {
        const logEntry = this.parseLogLine(line);
        if (logEntry) {
          this.logs.push(logEntry);
          count++;
        }
      }

      this.saveLogsToFile();
      console.log(`✅ Parsed and stored ${count} log entries`);
      return { success: true, count };
    } catch (error) {
      console.error('❌ Error parsing logs:', error);
      return { success: false, count: 0 };
    }
  }

  private parseLogLine(line: string): DiagnosticLogEntry | null {
    try {
      // Expected format: [TIMESTAMP] [VEHICLE_ID:ID] [LEVEL] [CODE:CODE] [MESSAGE]
      const regex = /\[([^\]]+)\]\s+\[VEHICLE_ID:(\d+)\]\s+\[([^\]]+)\]\s+\[CODE:([^\]]+)\]\s+\[([^\]]+)\]/;
      const match = line.match(regex);

      if (!match) {
        console.warn('⚠️ Could not parse log line:', line);
        return null;
      }

      const [, timestamp, vehicleId, level, code, message] = match;

      return {
        timestamp: this.parseTimestamp(timestamp),
        vehicleId: parseInt(vehicleId, 10),
        level: level.toUpperCase(),
        code: code.toUpperCase(),
        message: message.trim()
      };
    } catch (error) {
      console.error('❌ Error parsing log line:', line, error);
      return null;
    }
  }

  private parseTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toISOString();
    } catch (error) {
      console.warn('⚠️ Invalid timestamp format:', timestamp);
      return new Date().toISOString();
    }
  }
}