import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '사용자 ID', example: 'user123' })
  @IsString()
  id: string;

  @ApiProperty({ description: '비밀번호', example: 'password123' })
  @IsString()
  password: string;
}
