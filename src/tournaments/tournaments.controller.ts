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
  @ApiOperation({ summary: '월별 토너먼트 조회' })
  @ApiQuery({ name: 'year', description: '년도', example: 2024 })
  @ApiQuery({ name: 'month', description: '월', example: 11 })
  @ApiResponse({ status: 200, description: '월별 토너먼트 조회 성공' })
  findByMonth(@Query('year') year: string, @Query('month') month: string) {
    const y = Number(year);
    const m = Number(month);

    // 간단한 방어 코드 (나중에 class-validator로 강화 가능)
    if (!y || !m || m < 1 || m > 12) {
      // 실무에서는 BadRequestException 던지는 게 좋음
      throw new Error('year, month 쿼리 파라미터를 올바르게 전달해야 합니다.');
    }

    return this.tournamentsService.findByMonth(y, m);
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
