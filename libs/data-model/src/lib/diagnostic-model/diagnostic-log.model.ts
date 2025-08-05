import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class DiagnosticLogEntry {
  @IsDateString()
  timestamp: string;

  @IsNumber()
  vehicleId: number;

  @IsString()
  level: string;

  @IsString()
  code: string;

  @IsString()
  message: string;
}

export class SearchLogsDto {
  @IsOptional()
  @IsNumber()
  vehicle?: number;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class UploadLogsDto {
  @IsString()
  content: string;
} 