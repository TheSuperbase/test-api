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
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Get()
  findAll() {
    return this.tournamentsService.findAll();
  }

  @Get('month')
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
  findOne(@Param('id') id: string) {
    return this.tournamentsService.findOne(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateTournamentDto) {
    return this.tournamentsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTournamentDto) {
    return this.tournamentsService.update(Number(id), dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tournamentsService.remove(Number(id));
  }
}
