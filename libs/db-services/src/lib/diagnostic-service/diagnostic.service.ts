import { Injectable, Logger } from '@nestjs/common';
import { DiagnosticLogEntry, SearchLogsDto } from '@vehicles-dashboard/data-model';

@Injectable()
export class DiagnosticService {
  private readonly logger = new Logger(DiagnosticService.name);
  private logs: DiagnosticLogEntry[] = [];

  parseLogContent(content: string): DiagnosticLogEntry[] {
    const lines = content.split('\n').filter(line => line.trim());
    const parsedLogs: DiagnosticLogEntry[] = [];

    for (const line of lines) {
      try {
        const parsed = this.parseLogLine(line);
        if (parsed) {
          parsedLogs.push(parsed);
        }
      } catch (error) {
        this.logger.warn(`Failed to parse log line: ${line}`, error);
      }
    }

    return parsedLogs;
  }

  private parseLogLine(line: string): DiagnosticLogEntry | null {
    // Parse format: [2025-07-24 14:21:08] [VEHICLE_ID:1234] [ERROR] [CODE:U0420] [Steering angle sensor malfunction]
    const regex = /\[([^\]]+)\]\s*\[VEHICLE_ID:(\d+)\]\s*\[([^\]]+)\]\s*\[CODE:([^\]]+)\]\s*\[([^\]]+)\]/;
    const match = line.match(regex);

    if (!match) {
      return null;
    }

    const [, timestamp, vehicleId, level, code, message] = match;

    return {
      timestamp: this.parseTimestamp(timestamp),
      vehicleId: parseInt(vehicleId, 10),
      level: level.trim(),
      code: code.trim(),
      message: message.trim(),
    };
  }

  private parseTimestamp(timestamp: string): string {
    // Convert timestamp to ISO format
    const date = new Date(timestamp);
    return date.toISOString();
  }

  uploadLogs(content: string): { success: boolean; count: number } {
    const parsedLogs = this.parseLogContent(content);
    console.log("parsedLogs............", parsedLogs)
    this.logs.push(...parsedLogs);
    
    this.logger.log(`Uploaded ${parsedLogs.length} log entries`);
    
    return {
      success: true,
      count: parsedLogs.length,
    };
  }

  searchLogs(searchDto: SearchLogsDto): DiagnosticLogEntry[] {
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
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= fromDate);
    }

    if (searchDto.to) {
      const toDate = new Date(searchDto.to);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= toDate);
    }

    return filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getAllLogs(): DiagnosticLogEntry[] {
    return [...this.logs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getLogsCount(): number {
    return this.logs.length;
  }

  clearLogs(): void {
    this.logs = [];
    this.logger.log('All logs cleared');
  }
} 