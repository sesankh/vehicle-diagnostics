import { ApiProperty } from '@nestjs/swagger';

export class DiagnosticLogEntry {
  @ApiProperty({
    description: 'Timestamp of the log entry',
    example: '2024-01-01T10:00:00.000Z',
    type: String
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Vehicle ID',
    example: 1001,
    type: Number
  })
  vehicleId!: number;

  @ApiProperty({
    description: 'Log level (ERROR, WARN, INFO, DEBUG)',
    example: 'ERROR',
    type: String
  })
  level!: string;

  @ApiProperty({
    description: 'Error code',
    example: 'P0300',
    type: String
  })
  code!: string;

  @ApiProperty({
    description: 'Log message',
    example: 'Engine misfire detected',
    type: String
  })
  message!: string;
} 