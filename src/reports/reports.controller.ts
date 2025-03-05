import {
  Controller,
  Get,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { AuthGuard } from '@nestjs/passport';
import { Request as RequestExpress } from 'express';
import { User } from 'src/auth/entities/user.entity';
import { DailySummary, ReportsService, WeeklySummary } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  private validateUser(req: RequestExpress): void {
    if (!req.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
  }

  @UseGuards(AuthGuard('api-key'))
  @Get('daily')
  getDailySummary(@Request() req: RequestExpress): Promise<DailySummary> {
    if (!req.user) {
      throw new HttpErrorByCode[401]('Usuario no autenticado');
    }
    return this.reportsService.getDailySummary((req.user as User).id);
  }

  @UseGuards(AuthGuard('api-key'))
  @Get('weekly')
  getWeeklySummary(@Request() req: RequestExpress): Promise<WeeklySummary> {
    if (!req.user) {
      throw new HttpErrorByCode[401]('Usuario no autenticado');
    }
    return this.reportsService.getWeeklySummary((req.user as User).id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('daily-web')
  getDailySummaryWeb(@Request() req: RequestExpress): Promise<DailySummary> {
    this.validateUser(req);
    return this.reportsService.getDailySummary((req.user as User).id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('weekly-web')
  getWeeklySummaryWeb(@Request() req: RequestExpress): Promise<WeeklySummary> {
    this.validateUser(req);
    return this.reportsService.getWeeklySummary((req.user as User).id);
  }
}
