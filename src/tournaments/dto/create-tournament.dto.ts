import {
  isDateString,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTournamentDto {
  @ApiProperty({ description: '토너먼트 이름', example: '2024 전국배드민턴대회' })
  @IsString()
  name: string;

  // 날짜들은 프론트에서 문자열(ISO 포맷)로 날아온다고 가정
  @ApiProperty({ description: '시작일 (ISO 포맷)', example: '2024-11-20' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: '종료일 (ISO 포맷, 선택사항)', example: '2024-11-22', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: '접수 시작일 (ISO 포맷)', example: '2024-11-01' })
  @IsDateString()
  applyStartDate: string;

  @ApiProperty({ description: '접수 종료일 (ISO 포맷)', example: '2024-11-15' })
  @IsDateString()
  applyEndDate: string;

  @ApiProperty({ description: '장소', example: '서울 올림픽공원' })
  @IsString()
  location: string;

  @ApiProperty({ description: '주최', example: '대한배드민턴협회' })
  @IsString()
  host: string;

  @ApiProperty({ description: '주관 (선택사항)', example: '서울시 배드민턴연맹', required: false })
  @IsString()
  organizer?: string;

  @ApiProperty({ description: '참가비', example: 50000 })
  @IsInt()
  @Min(0)
  fee: number;

  @ApiProperty({ description: 'URL (선택사항)', example: 'https://example.com', required: false })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty({ description: '메모 (선택사항)', example: '추가 정보', required: false })
  @IsOptional()
  @IsString()
  memo?: string;
}
