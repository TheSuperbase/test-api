import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTournamentDto {
  @ApiProperty({ description: '대회이름', example: '2024 전국배드민턴대회' })
  @IsString()
  name: string;

  @ApiProperty({ description: '대회기간 시작일 (ISO 포맷)', example: '2024-11-20' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: '대회기간 종료일 (ISO 포맷)', example: '2024-11-22' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: '신청기간 시작일 (ISO 포맷, 선택사항)', example: '2024-11-01', required: false })
  @IsOptional()
  @IsDateString()
  applyStartDate?: string;

  @ApiProperty({ description: '신청기간 종료일 (ISO 포맷, 선택사항)', example: '2024-11-15', required: false })
  @IsOptional()
  @IsDateString()
  applyEndDate?: string;

  @ApiProperty({ description: '지역 (선택사항)', example: '서울', required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ description: '장소 (선택사항)', example: '서울 올림픽공원', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: '참가팀 수 (선택사항)', example: 32, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  participantTeams?: number;

  @ApiProperty({ description: '주최 (선택사항)', example: '대한배드민턴협회', required: false })
  @IsOptional()
  @IsString()
  host?: string;

  @ApiProperty({ description: '주관 (선택사항)', example: '서울시 배드민턴연맹', required: false })
  @IsOptional()
  @IsString()
  organizer?: string;

  @ApiProperty({ description: '후원 (선택사항)', example: '스포츠서울', required: false })
  @IsOptional()
  @IsString()
  sponsor?: string;

  @ApiProperty({ description: '협찬 (선택사항)', example: '요넥스코리아', required: false })
  @IsOptional()
  @IsString()
  sponsorship?: string;
}
