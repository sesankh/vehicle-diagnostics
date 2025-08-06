import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({
    description: 'Success status of the operation',
    example: true,
    type: Boolean
  })
  success!: boolean;

  @ApiPropertyOptional({
    description: 'Response data'
  })
  data?: T;

  @ApiPropertyOptional({
    description: 'Count of items in response',
    example: 10,
    type: Number
  })
  count?: number;

  @ApiPropertyOptional({
    description: 'Success message',
    example: 'Operation completed successfully',
    type: String
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'Error message if operation failed',
    example: 'Invalid input provided',
    type: String
  })
  error?: string;
} 