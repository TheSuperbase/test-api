import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Tournaments')
@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Get()
  @ApiOperation({ summary: '모든 토너먼트 조회' })
  @ApiResponse({ status: 200, description: '토너먼트 목록 조회 성공' })
  findAll() {
    return this.tournamentsService.findAll();
  }

  @Get('month')
  @ApiOperation({ summary: '월별 토너먼트 조회 (커서 기반 페이지네이션)' })
  @ApiQuery({ name: 'year', description: '년도', example: 2025 })
  @ApiQuery({ name: 'month', description: '월', example: 11 })
  @ApiQuery({
    name: 'cursor',
    description:
      '커서 (이전 응답의 nextCursor 값, 형식: startDate_id, 예: 2025-12-20T00:00:00.000Z_123)',
    required: false,
    example: '2025-12-01T00:00:00.000Z_10',
  })
  @ApiQuery({
    name: 'limit',
    description: '조회할 개수 (기본값: 10)',
    required: false,
    example: 10,
  })
  @ApiResponse({ status: 200, description: '월별 토너먼트 조회 성공' })
  findByMonth(
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const y = Number(year);
    const m = Number(month);

    // 간단한 방어 코드 (나중에 class-validator로 강화 가능)
    if (!y || !m || m < 1 || m > 12) {
      // 실무에서는 BadRequestException 던지는 게 좋음
      throw new Error('year, month 쿼리 파라미터를 올바르게 전달해야 합니다.');
    }

    const limitNum = limit ? Number(limit) : 10;

    return this.tournamentsService.findByMonth(y, m, cursor, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: '토너먼트 상세 조회' })
  @ApiParam({ name: 'id', description: '토너먼트 ID', example: 1 })
  @ApiResponse({ status: 200, description: '토너먼트 조회 성공' })
  @ApiResponse({ status: 404, description: '토너먼트를 찾을 수 없음' })
  findOne(@Param('id') id: string) {
    return this.tournamentsService.findOne(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '토너먼트 생성' })
  @ApiResponse({ status: 201, description: '토너먼트 생성 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  create(@Body() dto: CreateTournamentDto) {
    return this.tournamentsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '토너먼트 수정' })
  @ApiParam({ name: 'id', description: '토너먼트 ID', example: 1 })
  @ApiResponse({ status: 200, description: '토너먼트 수정 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 404, description: '토너먼트를 찾을 수 없음' })
  update(@Param('id') id: string, @Body() dto: UpdateTournamentDto) {
    return this.tournamentsService.update(Number(id), dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '토너먼트 삭제' })
  @ApiParam({ name: 'id', description: '토너먼트 ID', example: 1 })
  @ApiResponse({ status: 200, description: '토너먼트 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 404, description: '토너먼트를 찾을 수 없음' })
  remove(@Param('id') id: string) {
    return this.tournamentsService.remove(Number(id));
  }
}
