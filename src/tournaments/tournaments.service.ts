import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { TournamentResponseDto } from './dto/tournament-response.dto';
import { PaginatedTournamentResponseDto } from './dto/paginated-tournament-response.dto';
import { Tournament } from '@prisma/client';

@Injectable()
export class TournamentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 날짜를 YYYY.M.D 형식으로 변환
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}.${month}.${day}`;
  }

  /**
   * D-day 계산 (대회 시작일 기준)
   * 양수: 대회까지 남은 일수
   * 0: 오늘이 대회 시작일
   * 음수: 대회가 이미 시작됨
   */
  private calculateDDay(startDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(startDate);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * DB 데이터를 프론트에 반환할 형식으로 변환
   * 빈 값은 "미정"으로, 신청기간이 없으면 "0000.0.0 ~ 0000.0.0"으로 변환
   */
  private toResponseDto(tournament: Tournament): TournamentResponseDto {
    // 대회기간 포맷팅
    const tournamentPeriod = `${this.formatDate(tournament.startDate)} ~ ${this.formatDate(tournament.endDate)}`;

    // 신청기간 포맷팅 (없으면 0000.0.0 ~ 0000.0.0)
    const applyPeriod =
      tournament.applyStartDate && tournament.applyEndDate
        ? `${this.formatDate(tournament.applyStartDate)} ~ ${this.formatDate(tournament.applyEndDate)}`
        : '0000.0.0 ~ 0000.0.0';

    return {
      id: tournament.id,
      name: tournament.name,
      tournamentPeriod,
      applyPeriod,
      region: tournament.region ?? '미정',
      location: tournament.location ?? '미정',
      participantTeams: tournament.participantTeams?.toString() ?? '미정',
      host: tournament.host ?? '미정',
      organizer: tournament.organizer ?? '미정',
      sponsor: tournament.sponsor ?? '미정',
      sponsorship: tournament.sponsorship ?? '미정',
      tournamentUrl: tournament.tournamentUrl ?? '미정',
      platform: tournament.platform ?? '미정',
      dDay: this.calculateDDay(tournament.startDate),
      createdAt: tournament.createdAt,
      updatedAt: tournament.updatedAt,
    };
  }

  async create(dto: CreateTournamentDto): Promise<TournamentResponseDto> {
    const tournament = await this.prisma.tournament.create({
      data: {
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        applyStartDate: dto.applyStartDate
          ? new Date(dto.applyStartDate)
          : null,
        applyEndDate: dto.applyEndDate ? new Date(dto.applyEndDate) : null,
        region: dto.region || null,
        location: dto.location || null,
        participantTeams: dto.participantTeams ?? null,
        host: dto.host || null,
        organizer: dto.organizer || null,
        sponsor: dto.sponsor || null,
        sponsorship: dto.sponsorship || null,
        tournamentUrl: dto.tournamentUrl || null,
        platform: dto.platform || null,
      },
    });

    return this.toResponseDto(tournament);
  }

  async findAll(): Promise<TournamentResponseDto[]> {
    const tournaments = await this.prisma.tournament.findMany({
      orderBy: { startDate: 'asc' },
    });

    return tournaments.map((tournament) => this.toResponseDto(tournament));
  }

  async findOne(id: number): Promise<TournamentResponseDto | null> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
    });

    if (!tournament) {
      return null;
    }

    return this.toResponseDto(tournament);
  }

  /**
   * 커서 문자열 파싱 (형식: "startDate_id", 예: "2025-12-20T00:00:00.000Z_123")
   */
  private parseCursor(cursor: string): { startDate: Date; id: number } | null {
    const lastUnderscoreIndex = cursor.lastIndexOf('_');
    if (lastUnderscoreIndex === -1) return null;

    const startDateStr = cursor.substring(0, lastUnderscoreIndex);
    const idStr = cursor.substring(lastUnderscoreIndex + 1);

    const startDate = new Date(startDateStr);
    const id = Number(idStr);

    if (isNaN(startDate.getTime()) || isNaN(id)) return null;

    return { startDate, id };
  }

  /**
   * 커서 문자열 생성
   */
  private createCursor(tournament: Tournament): string {
    return `${tournament.startDate.toISOString()}_${tournament.id}`;
  }

  async findByMonth(
    year: number,
    month: number,
    cursor?: string,
    limit: number = 10,
  ): Promise<PaginatedTournamentResponseDto> {
    // month는 1~12로 들어온다고 가정
    const start = new Date(year, month - 1, 1); // 해당 월 1일 00:00
    const end = new Date(year, month, 1); // 다음 달 1일 00:00

    const parsedCursor = cursor ? this.parseCursor(cursor) : null;

    // limit + 1개를 가져와서 다음 페이지 존재 여부 확인
    const tournaments = await this.prisma.tournament.findMany({
      where: {
        startDate: {
          gte: start,
          lt: end,
        },
        // 복합 커서 조건: (startDate > cursorDate) OR (startDate = cursorDate AND id > cursorId)
        ...(parsedCursor && {
          OR: [
            { startDate: { gt: parsedCursor.startDate } },
            {
              startDate: parsedCursor.startDate,
              id: { gt: parsedCursor.id },
            },
          ],
        }),
      },
      orderBy: [{ startDate: 'asc' }, { id: 'asc' }],
      take: limit + 1,
    });

    const hasMore = tournaments.length > limit;
    const items = hasMore ? tournaments.slice(0, limit) : tournaments;
    const nextCursor =
      hasMore && items.length > 0
        ? this.createCursor(items[items.length - 1])
        : null;

    return {
      items: items.map((tournament) => this.toResponseDto(tournament)),
      nextCursor,
      hasMore,
    };
  }

  async update(
    id: number,
    dto: UpdateTournamentDto,
  ): Promise<TournamentResponseDto> {
    // 먼저 존재 여부 체크 (실무에서 매우 중요)
    const exists = await this.prisma.tournament.findUnique({ where: { id } });

    if (!exists) {
      throw new NotFoundException('대회를 찾을 수 없습니다.');
    }

    const tournament = await this.prisma.tournament.update({
      where: { id },
      data: {
        name: dto.name,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        applyStartDate:
          dto.applyStartDate !== undefined
            ? dto.applyStartDate
              ? new Date(dto.applyStartDate)
              : null
            : undefined,
        applyEndDate:
          dto.applyEndDate !== undefined
            ? dto.applyEndDate
              ? new Date(dto.applyEndDate)
              : null
            : undefined,
        region: dto.region !== undefined ? dto.region || null : undefined,
        location: dto.location !== undefined ? dto.location || null : undefined,
        participantTeams:
          dto.participantTeams !== undefined
            ? (dto.participantTeams ?? null)
            : undefined,
        host: dto.host !== undefined ? dto.host || null : undefined,
        organizer:
          dto.organizer !== undefined ? dto.organizer || null : undefined,
        sponsor: dto.sponsor !== undefined ? dto.sponsor || null : undefined,
        sponsorship:
          dto.sponsorship !== undefined ? dto.sponsorship || null : undefined,
        tournamentUrl:
          dto.tournamentUrl !== undefined ? dto.tournamentUrl || null : undefined,
        platform: dto.platform !== undefined ? dto.platform || null : undefined,
      },
    });

    return this.toResponseDto(tournament);
  }

  async remove(id: number): Promise<TournamentResponseDto> {
    const exists = await this.prisma.tournament.findUnique({ where: { id } });

    if (!exists) {
      throw new NotFoundException('대회를 찾을 수 없습니다.');
    }

    const tournament = await this.prisma.tournament.delete({
      where: { id },
    });

    return this.toResponseDto(tournament);
  }
}
