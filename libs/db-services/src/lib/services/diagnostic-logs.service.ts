import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface DiagnosticLogEntry {
  vehicleId: number;
  timestamp: string;
  level: string;
  code: string;
  message: string;
  details?: any;
}

interface SearchLogsDto {
  vehicle?: number;
  code?: string;
  from?: string;
  to?: string;
  level?: string;
}

interface UploadLogsDto {
  content: string;
}

interface ApiResponseDto<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  count?: number;
}

@Injectable()
export class DiagnosticLogsService {
  private readonly logger = new Logger(DiagnosticLogsService.name);
  private logs: DiagnosticLogEntry[] = [];
  private readonly dataFile = path.join(process.cwd(), 'data', 'diagnostic-logs.json');
  private isInitialized = false;

  constructor() {
    this.initializeData();
  }

  private determineLogLevel(code: string, message: string): string {
    let actualLevel = 'INFO'; // default
    
    // Extract clean code without CODE: prefix
    const cleanCode = code ? code.replace('CODE:', '').trim() : '';
    
    if (cleanCode) {
      // OBD-II diagnostic trouble codes classification
      const codeUpper = cleanCode.toUpperCase();
      
      // P-codes (Powertrain) - classify based on severity
      if (codeUpper.startsWith('P0')) {
        // P0000-P0999: Generic OBD-II codes
        if (['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0305', 'P0306', 'P0307', 'P0308'].includes(codeUpper)) {
          actualLevel = 'ERROR'; // Misfire codes are critical engine issues
        } else if (['P0171', 'P0172', 'P0174', 'P0175'].includes(codeUpper)) {
          actualLevel = 'WARNING'; // Fuel trim issues
        } else if (['P0420', 'P0430'].includes(codeUpper)) {
          actualLevel = 'WARNING'; // Catalyst efficiency issues
        } else if (['P0100', 'P0101', 'P0102', 'P0103', 'P0104', 'P0105', 'P0106', 'P0107', 'P0108', 'P0109'].includes(codeUpper)) {
          actualLevel = 'WARNING'; // Mass air flow sensor issues
        } else if (['P0200', 'P0201', 'P0202', 'P0203', 'P0204', 'P0205', 'P0206', 'P0207', 'P0208'].includes(codeUpper)) {
          actualLevel = 'WARNING'; // Injector circuit issues
        } else {
          actualLevel = 'WARNING'; // Other powertrain codes
        }
      } else if (codeUpper.startsWith('P1') || codeUpper.startsWith('P2') || codeUpper.startsWith('P3')) {
        actualLevel = 'WARNING'; // Manufacturer-specific powertrain codes
      } else if (codeUpper.startsWith('B0')) {
        // B-codes (Body) - classify based on safety criticality
        if (['B1000', 'B1001', 'B1002', 'B1003', 'B1004', 'B1005', 'B1006', 'B1007', 'B1008', 'B1009'].includes(codeUpper)) {
          actualLevel = 'ERROR'; // Airbag system faults are critical safety issues
        } else if (['B1100', 'B1101', 'B1102', 'B1103', 'B1104', 'B1105', 'B1106', 'B1107', 'B1108', 'B1109'].includes(codeUpper)) {
          actualLevel = 'WARNING'; // Seat belt system issues
        } else {
          actualLevel = 'WARNING'; // Other body codes
        }
      } else if (codeUpper.startsWith('C0')) {
        // C-codes (Chassis) - classify based on safety criticality
        if (['C0000', 'C0001', 'C0002', 'C0003', 'C0004', 'C0005', 'C0006', 'C0007', 'C0008', 'C0009'].includes(codeUpper)) {
          actualLevel = 'ERROR'; // Brake system critical issues
        } else if (['C1000', 'C1001', 'C1002', 'C1003', 'C1004', 'C1005', 'C1006', 'C1007', 'C1008', 'C1009'].includes(codeUpper)) {
          actualLevel = 'WARNING'; // ABS system issues
        } else {
          actualLevel = 'WARNING'; // Other chassis codes
        }
      } else if (codeUpper.startsWith('U0')) {
        // U-codes (Network) - generally warnings unless critical
        if (['U0000', 'U0001', 'U0002'].includes(codeUpper)) {
          actualLevel = 'ERROR'; // Critical network communication issues
        } else {
          actualLevel = 'WARNING'; // Other network codes
        }
      }
    }
    
    // Override based on message content if it contains specific keywords
    if (message) {
      const messageLower = message.toLowerCase();
      if (messageLower.includes('fault') || messageLower.includes('failure') || messageLower.includes('critical')) {
        actualLevel = 'ERROR';
      } else if (messageLower.includes('warning') || messageLower.includes('below threshold')) {
        actualLevel = 'WARNING';
      } else if (messageLower.includes('info') || messageLower.includes('status')) {
        actualLevel = 'INFO';
      }
    }
    
    return actualLevel;
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

  async getVehicleStats(vehicleId: number): Promise<ApiResponseDto<any>> {
    this.logger.log(`Getting vehicle stats for vehicle ${vehicleId}`);
    
    try {
      if (!this.isInitialized) {
        await this.initializeData();
      }
      
      const vehicleLogs = this.logs.filter(log => log.vehicleId === vehicleId);
      
      const stats = {
        totalLogs: vehicleLogs.length,
        errorCount: 0,
        warningCount: 0,
        infoCount: 0,
        debugCount: 0,
      };

      vehicleLogs.forEach(log => {
        // Use the actual level stored in the log instead of determining it from code/message
        const level = log.level.toUpperCase();
        
        if (level === 'ERROR') {
          stats.errorCount++;
        } else if (level === 'WARNING' || level === 'WARN') {
          stats.warningCount++;
        } else if (level === 'INFO') {
          stats.infoCount++;
        } else if (level === 'DEBUG') {
          stats.debugCount++;
        }
      });

      return {
        success: true,
        message: `Vehicle ${vehicleId} statistics`,
        data: stats,
      };
    } catch (error) {
      this.logger.error(`Error getting vehicle stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        message: 'Failed to get vehicle statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getUniqueVehicles(): Promise<ApiResponseDto<number[]>> {
    this.logger.log('Getting unique vehicles');
    
    try {
      if (!this.isInitialized) {
        await this.initializeData();
      }
      
      const vehicleIdsSet = new Set<number>();
      this.logs.forEach(log => vehicleIdsSet.add(log.vehicleId));
      const vehicleIds = Array.from(vehicleIdsSet);
      const sortedVehicleIds = vehicleIds.sort((a, b) => a - b);
      
      return {
        success: true,
        message: `Found ${sortedVehicleIds.length} unique vehicles`,
        data: sortedVehicleIds,
      };
    } catch (error) {
      this.logger.error(`Error getting unique vehicles: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        message: 'Failed to get unique vehicles',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getDatabaseInfo(): Promise<ApiResponseDto<any>> {
    this.logger.log('Getting database info');
    
    try {
      if (!this.isInitialized) {
        await this.initializeData();
      }
      
      const info = {
        totalLogs: this.logs.length,
        lastUpdated: new Date().toISOString(),
        dbPath: this.dataFile,
      };
      
      return {
        success: true,
        message: 'Database information',
        data: info,
      };
    } catch (error) {
      this.logger.error(`Error getting database info: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        message: 'Failed to get database information',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
} 