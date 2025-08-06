import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { DiagnosticLogEntry, SearchLogsDto, UploadLogsDto, ApiResponseDto } from '@vehicles-dashboard/data-model';

@Injectable()
export class DiagnosticLogsService {
  private readonly logger = new Logger(DiagnosticLogsService.name);
  private logs: DiagnosticLogEntry[] = [];
  private readonly dataFile = path.join(process.cwd(), 'data', 'diagnostic-logs.json');
  private isInitialized = false;

  constructor() {
    this.initializeData();
  }

  private async initializeData(): Promise<void> {
    try {
      const dataDir = path.dirname(this.dataFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        this.logger.log(`Created data directory: ${dataDir}`);
      }

      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf-8');
        if (data.trim()) {
          this.logs = JSON.parse(data);
          this.logger.log(`Loaded ${this.logs.length} logs from file: ${this.dataFile}`);
        } else {
          this.logger.log('Empty log file found, starting with empty logs');
          this.logs = [];
        }
      } else {
        this.logger.log('No existing log file found, starting with empty logs');
        this.logs = [];
        this.saveLogsToFile();
      }
      this.isInitialized = true;
    } catch (error) {
      this.logger.error('Error loading logs from file:', error);
      this.logs = [];
      this.isInitialized = true;
    }
  }

  private saveLogsToFile(): void {
    try {
      if (!this.isInitialized) {
        this.logger.log('Waiting for initialization before saving...');
        return;
      }

      const dataDir = path.dirname(this.dataFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      fs.writeFileSync(this.dataFile, JSON.stringify(this.logs, null, 2));
      this.logger.log(`Saved ${this.logs.length} logs to file: ${this.dataFile}`);
    } catch (error) {
      this.logger.error('Error saving logs to file:', error);
    }
  }

  async searchLogs(searchDto: SearchLogsDto): Promise<ApiResponseDto<DiagnosticLogEntry[]>> {
    this.logger.log(`Searching logs with filters: ${JSON.stringify(searchDto)}`);
    
    try {
      if (!this.isInitialized) {
        await this.initializeData();
      }
      
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
      this.logger.error('Error searching logs:', error);
      throw error;
    }
  }

  async getAllLogs(): Promise<ApiResponseDto<DiagnosticLogEntry[]>> {
    this.logger.log('Getting all logs');
    
    try {
      if (!this.isInitialized) {
        await this.initializeData();
      }
      
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
      this.logger.error('Error getting all logs:', error);
      throw error;
    }
  }

  async getLogsCount(): Promise<ApiResponseDto<number>> {
    this.logger.log('Getting logs count');
    
    try {
      if (!this.isInitialized) {
        await this.initializeData();
      }
      
      const count = this.logs.length;
      return {
        success: true,
        count: count,
        message: `Total logs: ${count}`
      };
    } catch (error) {
      this.logger.error('Error getting logs count:', error);
      throw error;
    }
  }

  async uploadLogs(uploadDto: UploadLogsDto): Promise<ApiResponseDto<number>> {
    this.logger.log('Uploading logs');
    
    try {
      if (!this.isInitialized) {
        await this.initializeData();
      }
      
      const result = this.parseAndStoreLogs(uploadDto.content);
      
      return {
        success: result.success,
        message: `Uploaded ${result.count} log entries`,
        count: result.count,
      };
    } catch (error) {
      this.logger.error('Error uploading logs:', error);
      throw error;
    }
  }

  async uploadFile(file: any): Promise<ApiResponseDto<number>> {
    this.logger.log(`Uploading file: ${file?.originalname}`);
    
    try {
      if (!this.isInitialized) {
        await this.initializeData();
      }
      
      if (!file) {
        throw new Error('No file uploaded');
      }

      const content = file.buffer.toString('utf-8');
      const result = this.parseAndStoreLogs(content);
      
      return {
        success: result.success,
        message: `Uploaded ${result.count} log entries from file: ${file.originalname}`,
        count: result.count,
      };
    } catch (error) {
      this.logger.error('Error uploading file:', error);
      throw error;
    }
  }

  async processWebhook(content: string, isAuthenticated: boolean = false): Promise<ApiResponseDto<number>> {
    this.logger.log('Processing webhook');
    
    try {
      if (!this.isInitialized) {
        await this.initializeData();
      }

      if (!content || content.trim().length === 0) {
        throw new Error('No log content provided');
      }

      const result = this.parseAndStoreLogs(content);

      return {
        success: result.success,
        message: `Webhook processed successfully. Uploaded ${result.count} log entries`,
        count: result.count,
      };
    } catch (error) {
      this.logger.error('Error processing webhook:', error);
      throw error;
    }
  }

  async clearLogs(): Promise<ApiResponseDto<void>> {
    this.logger.log('Clearing all logs');
    
    try {
      if (!this.isInitialized) {
        await this.initializeData();
      }
      
      this.logs = [];
      this.saveLogsToFile();
      
      return { 
        success: true, 
        message: 'All logs cleared successfully.' 
      };
    } catch (error) {
      this.logger.error('Error clearing logs:', error);
      throw error;
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
      this.logger.log(`Parsed and stored ${count} log entries`);
      return { success: true, count };
    } catch (error) {
      this.logger.error('Error parsing logs:', error);
      return { success: false, count: 0 };
    }
  }

  private parseLogLine(line: string): DiagnosticLogEntry | null {
    try {
      const regex = /\[([^\]]+)\]\s+\[VEHICLE_ID:(\d+)\]\s+\[([^\]]+)\]\s+\[CODE:([^\]]+)\]\s+\[([^\]]+)\]/;
      const match = line.match(regex);

      if (!match) {
        this.logger.warn(`Could not parse log line: ${line}`);
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
      this.logger.error(`Error parsing log line: ${line}`, error);
      return null;
    }
  }

  private parseTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toISOString();
    } catch (error) {
      this.logger.warn(`Invalid timestamp format: ${timestamp}`);
      return new Date().toISOString();
    }
  }
} 