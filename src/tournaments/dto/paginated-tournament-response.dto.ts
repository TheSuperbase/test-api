import { ApiProperty } from '@nestjs/swagger';
import { TournamentResponseDto } from './tournament-response.dto';

export class PaginatedTournamentResponseDto {
  @ApiProperty({
    description: '토너먼트 목록',
    type: [TournamentResponseDto],
  })
  items: TournamentResponseDto[];

  @ApiProperty({
    description: '다음 페이지 커서 (없으면 null)',
    example: '5',
    nullable: true,
  })
  nextCursor: string | null;

  @ApiProperty({
    description: '다음 페이지 존재 여부',
    example: true,
  })
  hasMore: boolean;
}
