import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request as RequestExpress } from 'express';
import { User } from 'src/auth/entities/user.entity';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @UseGuards(AuthGuard('api-key'))
  @Post()
  async create(
    @Body() createActivityDtos: CreateActivityDto[],
    @Request() req: RequestExpress,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // Maneja tanto actividades individuales como arrays
    if (Array.isArray(createActivityDtos)) {
      await this.activityService.createMany(
        createActivityDtos,
        req.user as User,
      );
      return {
        success: true,
        message: `${createActivityDtos.length} actividades registradas`,
      };
    } else {
      const activity = await this.activityService.create(
        createActivityDtos,
        req.user as User,
      );
      return { success: true, activity };
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Request() req: RequestExpress) {
    if (!req.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return this.activityService.findAll((req.user as User).id);
  }
}
