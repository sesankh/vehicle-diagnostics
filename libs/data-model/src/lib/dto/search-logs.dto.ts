import { IsOptional, IsNumber, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchLogsDto {
  @ApiPropertyOptional({
    description: 'Vehicle ID to filter logs',
    example: 1001,
    type: Number
  })
  @IsOptional()
  @IsNumber()
  vehicle?: number;

  @ApiPropertyOptional({
    description: 'Error code to filter logs',
    example: 'P0300',
    type: String
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'Start date for filtering (ISO string)',
    example: '2024-01-01T00:00:00.000Z',
    type: String
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering (ISO string)',
    example: '2024-12-31T23:59:59.999Z',
    type: String
  })
  @IsOptional()
  @IsDateString()
  to?: string;
} 