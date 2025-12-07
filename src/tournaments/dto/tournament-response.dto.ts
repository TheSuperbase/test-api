import { ApiProperty } from '@nestjs/swagger';

export class TournamentResponseDto {
  @ApiProperty({ description: '토너먼트 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '대회이름', example: '2024 전국배드민턴대회' })
  name: string;

  @ApiProperty({ description: '대회기간 (YYYY.M.D ~ YYYY.M.D 형식)', example: '2024.11.20 ~ 2024.11.22' })
  tournamentPeriod: string;

  @ApiProperty({ description: '신청기간 (YYYY.M.D ~ YYYY.M.D 형식)', example: '2024.11.1 ~ 2024.11.15' })
  applyPeriod: string;

  @ApiProperty({ description: '지역', example: '서울' })
  region: string;

  @ApiProperty({ description: '장소', example: '서울 올림픽공원' })
  location: string;

  @ApiProperty({ description: '참가팀', example: '32' })
  participantTeams: string;

  @ApiProperty({ description: '주최', example: '대한배드민턴협회' })
  host: string;

  @ApiProperty({ description: '주관', example: '서울시 배드민턴연맹' })
  organizer: string;

  @ApiProperty({ description: '후원', example: '스포츠서울' })
  sponsor: string;

  @ApiProperty({ description: '협찬', example: '요넥스코리아' })
  sponsorship: string;

  @ApiProperty({ description: 'D-day (대회 시작까지 남은 일수, 음수면 이미 시작)', example: 7 })
  dDay: number;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  updatedAt: Date;
}

