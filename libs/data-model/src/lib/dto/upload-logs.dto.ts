import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadLogsDto {
  @ApiProperty({
    description: 'Log content to upload',
    example: '[2024-01-01T10:00:00.000Z] [VEHICLE_ID:1001] [ERROR] [CODE:P0300] [Engine misfire detected]',
    type: String
  })
  @IsString()
  @IsNotEmpty()
  content!: string;
} 