import {
  isDateString,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTournamentDto {
  @IsString()
  name: string;

  // 날짜들은 프론트에서 문자열(ISO 포맷)로 날아온다고 가정
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsDateString()
  applyStartDate: string;

  @IsDateString()
  applyEndDate: string;

  @IsString()
  location: string;
  @IsString()
  host: string;
  @IsString()
  organizer?: string;

  @IsInt()
  @Min(0)
  fee: number;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  memo?: string;
}
