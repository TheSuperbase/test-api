import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';

@Injectable()
export class TournamentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTournamentDto) {
    const tournament = await this.prisma.tournament.create({
      data: {
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        applyStartDate: new Date(dto.applyStartDate),
        applyEndDate: new Date(dto.applyEndDate),
        location: dto.location,
        host: dto.host,
        organizer: dto.organizer,
        fee: dto.fee,
        url: dto.url,
        memo: dto.memo,
      },
    });

    return tournament;
  }

  async findAll() {
    return this.prisma.tournament.findMany({
      orderBy: { startDate: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.tournament.findUnique({
      where: { id },
    });
  }

  async findByMonth(year: number, month: number) {
    // month는 1~12로 들어온다고 가정
    const start = new Date(year, month - 1, 1); // 해당 월 1일 00:00
    const end = new Date(year, month, 1); // 다음 달 1일 00:00

    return this.prisma.tournament.findMany({
      where: {
        startDate: {
          gte: start,
          lt: end,
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });
  }

  async update(id: number, dto: UpdateTournamentDto) {
    // 먼저 존재 여부 체크 (실무에서 매우 중요)
    const exists = await this.prisma.tournament.findUnique({ where: { id } });

    if (!exists) {
      throw new NotFoundException('대회를 찾을 수 없습니다.');
    }

    return this.prisma.tournament.update({
      where: { id },
      data: {
        name: dto.name,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        applyStartDate: dto.applyStartDate
          ? new Date(dto.applyStartDate)
          : undefined,
        applyEndDate: dto.applyEndDate ? new Date(dto.applyEndDate) : undefined,
        location: dto.location,
        host: dto.host,
        organizer: dto.organizer,
        fee: dto.fee,
        url: dto.url,
        memo: dto.memo,
      },
    });
  }

  async remove(id: number) {
    const exists = await this.prisma.tournament.findUnique({ where: { id } });

    if (!exists) {
      throw new NotFoundException('대회를 찾을 수 없습니다.');
    }

    return this.prisma.tournament.delete({
      where: { id },
    });
  }
}
