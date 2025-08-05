import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  ValidationPipe,
  HttpException,
  HttpStatus,
  Delete
} from '@nestjs/common';
import { DiagnosticService } from '@vehicles-dashboard/db-services';
import { SearchLogsDto, UploadLogsDto } from '@vehicles-dashboard/data-model';

@Controller('logs')
export class DiagnosticLogsController {
  constructor(private readonly diagnosticService: DiagnosticService) {}

  @Get()
  async searchLogs(@Query(ValidationPipe) searchDto: SearchLogsDto) {
    try {
      const logs = this.diagnosticService.searchLogs(searchDto);
      return {
        success: true,
        data: logs,
        count: logs.length,
        filters: searchDto
      };
    } catch (error) {
      throw new HttpException(
        'Failed to search logs',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('all')
  async getAllLogs() {
    try {
      const logs = this.diagnosticService.getAllLogs();
      return {
        success: true,
        data: logs,
        count: logs.length
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve logs',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('count')
  async getLogsCount() {
    try {
      const count = this.diagnosticService.getLogsCount();
      return {
        success: true,
        count
      };
    } catch (error) {
      throw new HttpException(
        'Failed to get logs count',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('upload')
  async uploadLogs(@Body(ValidationPipe) uploadDto: UploadLogsDto) {
    try {
      if (!uploadDto.content || uploadDto.content.trim().length === 0) {
        throw new HttpException(
          'Log content is required',
          HttpStatus.BAD_REQUEST
        );
      }

      const result = this.diagnosticService.uploadLogs(uploadDto.content);
      
      return {
        success: result.success,
        message: `Successfully uploaded ${result.count} log entries`,
        count: result.count
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to upload logs',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete()
  async clearLogs() {
    try {
      this.diagnosticService.clearLogs();
      return {
        success: true,
        message: 'All logs cleared successfully'
      };
    } catch (error) {
      throw new HttpException(
        'Failed to clear logs',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 