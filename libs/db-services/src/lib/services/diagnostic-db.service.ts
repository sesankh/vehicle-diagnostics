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

interface DatabaseSchema {
  logs: DiagnosticLogEntry[];
  lastUpdated: string;
}

@Injectable()
export class DiagnosticDbService {
  private readonly logger = new Logger(DiagnosticDbService.name);
  private logs: DiagnosticLogEntry[] = [];
  private readonly dbPath: string;

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
          actualLevel = 'INFO'; // Other powertrain codes - less critical
        }
      } else if (codeUpper.startsWith('P1') || codeUpper.startsWith('P2') || codeUpper.startsWith('P3')) {
        actualLevel = 'INFO'; // Manufacturer-specific powertrain codes - less critical
      } else if (codeUpper.startsWith('B0')) {
        // B-codes (Body) - classify based on safety criticality
        if (['B1000', 'B1001', 'B1002', 'B1003', 'B1004', 'B1005', 'B1006', 'B1007', 'B1008', 'B1009'].includes(codeUpper)) {
          actualLevel = 'ERROR'; // Airbag system faults are critical safety issues
        } else if (['B1100', 'B1101', 'B1102', 'B1103', 'B1104', 'B1105', 'B1106', 'B1107', 'B1108', 'B1109'].includes(codeUpper)) {
          actualLevel = 'WARNING'; // Seat belt system issues
        } else {
          actualLevel = 'INFO'; // Other body codes - less critical
        }
      } else if (codeUpper.startsWith('C0')) {
        // C-codes (Chassis) - classify based on safety criticality
        if (['C0000', 'C0001', 'C0002', 'C0003', 'C0004', 'C0005', 'C0006', 'C0007', 'C0008', 'C0009'].includes(codeUpper)) {
          actualLevel = 'ERROR'; // Brake system critical issues
        } else if (['C1000', 'C1001', 'C1002', 'C1003', 'C1004', 'C1005', 'C1006', 'C1007', 'C1008', 'C1009'].includes(codeUpper)) {
          actualLevel = 'WARNING'; // ABS system issues
        } else {
          actualLevel = 'INFO'; // Other chassis codes - less critical
        }
      } else if (codeUpper.startsWith('U0')) {
        // U-codes (Network) - generally info unless critical
        if (['U0000', 'U0001', 'U0002'].includes(codeUpper)) {
          actualLevel = 'ERROR'; // Critical network communication issues
        } else {
          actualLevel = 'INFO'; // Other network codes - less critical
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
      } else if (messageLower.includes('debug') || messageLower.includes('test')) {
        actualLevel = 'DEBUG';
      } else if (messageLower.includes('info') || messageLower.includes('status') || messageLower.includes('normal') || messageLower.includes('ok')) {
        actualLevel = 'INFO';
      }
    }
    
    return actualLevel;
  }

  constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'diagnostic-db.json');
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Load existing data if file exists
      if (fs.existsSync(this.dbPath)) {
        const data = fs.readFileSync(this.dbPath, 'utf-8');
        if (data.trim()) {
          const dbData = JSON.parse(data);
          this.logs = this.processLogs(dbData.logs || []);
          
          // Reprocess logs with updated classification
          this.reprocessAllLogs();
        }
      }

      this.logger.log(`📊 Database initialized at: ${this.dbPath}`);
    } catch (error) {
      this.logger.error(`Failed to initialize database: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.logs = [];
    }
  }

  private reprocessAllLogs(): void {
    try {
      // Reprocess all logs to ensure proper level extraction
      this.logs = this.processLogs(this.logs);
      
      // Save the reprocessed data
      this.saveData();
      
      this.logger.log(`🔄 Reprocessed ${this.logs.length} logs with updated classification`);
    } catch (error) {
      this.logger.error(`Error reprocessing logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private processLogs(logs: DiagnosticLogEntry[]): DiagnosticLogEntry[] {
    return logs.map(log => {
      let processedLog = { ...log };
      
      // Fix vehicleId extraction from level field when vehicleId is null
      if (log.vehicleId === null || log.vehicleId === undefined) {
        if (log.level && log.level.includes('VEHICLE_ID:')) {
          const vehicleIdMatch = log.level.match(/VEHICLE_ID:(\d+)/);
          if (vehicleIdMatch) {
            processedLog.vehicleId = parseInt(vehicleIdMatch[1], 10);
          }
        } else {
          processedLog.vehicleId = 0;
        }
      }
      
      // Fix code extraction - remove "CODE:" prefix if present
      if (log.code && log.code.startsWith('CODE:')) {
        processedLog.code = log.code.replace('CODE:', '').trim();
      }
      
      // Extract level from the existing level field if it contains level information
      if (log.level) {
        // Check if level contains VEHICLE_ID (old format) or is a direct level
        if (log.level.includes('VEHICLE_ID:')) {
          // Extract level from the original level field if it contains level info
          const levelMatch = log.level.match(/\[(INFO|ERROR|DEBUG|WARN|WARNING)\]/i);
          if (levelMatch) {
            processedLog.level = levelMatch[1].toUpperCase();
          } else {
            // Fallback to determine level from code/message
            processedLog.level = this.determineLogLevel(log.code, log.message);
          }
        } else {
          // Level field already contains the level, just clean it up
          const cleanLevel = log.level.replace(/[\[\]]/g, '').trim().toUpperCase();
          if (['INFO', 'ERROR', 'DEBUG', 'WARN', 'WARNING'].includes(cleanLevel)) {
            processedLog.level = cleanLevel;
          } else {
            // Fallback to determine level from code/message
            processedLog.level = this.determineLogLevel(log.code, log.message);
          }
        }
      } else {
        // No level field, determine from code/message
        processedLog.level = this.determineLogLevel(log.code, log.message);
      }
      
      return processedLog;
    });
  }

  private saveData(): void {
    try {
      const data = {
        logs: this.logs,
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
    } catch (error) {
      this.logger.error(`Error saving data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get all logs with optional filtering
  getAllLogs(filters?: {
    vehicleId?: number;
    code?: string;
    from?: string;
    to?: string;
    level?: string;
  }): DiagnosticLogEntry[] {
    try {
      let logs = [...this.logs];

      // Apply filters
      if (filters) {
        if (filters.vehicleId) {
          logs = logs.filter((log: DiagnosticLogEntry) => log.vehicleId === filters.vehicleId);
        }
        if (filters.code) {
          logs = logs.filter((log: DiagnosticLogEntry) => 
            log.code && log.code.toLowerCase().includes(filters.code!.toLowerCase())
          );
        }
        if (filters.level) {
          logs = logs.filter((log: DiagnosticLogEntry) => 
            log.level && log.level.toLowerCase() === filters.level!.toLowerCase()
          );
        }
        if (filters.from) {
          const fromDate = new Date(filters.from);
          logs = logs.filter((log: DiagnosticLogEntry) => new Date(log.timestamp) >= fromDate);
        }
        if (filters.to) {
          const toDate = new Date(filters.to);
          logs = logs.filter((log: DiagnosticLogEntry) => new Date(log.timestamp) <= toDate);
        }
      }

      return logs;
    } catch (error) {
      this.logger.error(`Error getting logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }

  // Get logs count
  getLogsCount(): number {
    try {
      return this.logs.length;
    } catch (error) {
      this.logger.error(`Error getting logs count: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return 0;
    }
  }

  // Add new logs
  addLogs(newLogs: DiagnosticLogEntry[]): number {
    try {
      this.logs = [...this.logs, ...newLogs];
      this.saveData();

      this.logger.log(`✅ Added ${newLogs.length} new logs. Total: ${this.logs.length}`);
      return newLogs.length;
    } catch (error) {
      this.logger.error(`Error adding logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // Clear all logs
  clearLogs(): void {
    try {
      this.logs = [];
      this.saveData();
      
      this.logger.log('🗑️ All logs cleared');
    } catch (error) {
      this.logger.error(`Error clearing logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // Get vehicle statistics
  getVehicleStats(vehicleId: number): {
    totalLogs: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    debugCount: number;
  } {
    try {
      const logs = this.logs.filter((log: DiagnosticLogEntry) => log.vehicleId === vehicleId);

      const stats = {
        totalLogs: logs.length,
        errorCount: 0,
        warningCount: 0,
        infoCount: 0,
        debugCount: 0,
      };

      logs.forEach((log: DiagnosticLogEntry) => {
        // Use the processed level directly since logs are already processed
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

      return stats;
    } catch (error) {
      this.logger.error(`Error getting vehicle stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        totalLogs: 0,
        errorCount: 0,
        warningCount: 0,
        infoCount: 0,
        debugCount: 0,
      };
    }
  }

  // Get all unique vehicle IDs
  getUniqueVehicleIds(): number[] {
    try {
      const vehicleIdsSet = new Set<number>();
      this.logs.forEach((log: DiagnosticLogEntry) => vehicleIdsSet.add(log.vehicleId));
      const vehicleIds = Array.from(vehicleIdsSet);
      return vehicleIds.sort((a, b) => a - b);
    } catch (error) {
      this.logger.error(`Error getting unique vehicle IDs: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }

  // Get database info
  getDatabaseInfo(): { totalLogs: number; lastUpdated: string; dbPath: string } {
    try {
      return {
        totalLogs: this.getLogsCount(),
        lastUpdated: new Date().toISOString(),
        dbPath: this.dbPath,
      };
    } catch (error) {
      this.logger.error(`Error getting database info: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        totalLogs: 0,
        lastUpdated: new Date().toISOString(),
        dbPath: this.dbPath,
      };
    }
  }
} 