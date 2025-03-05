import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { Activity } from './entities/activity.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activitiesRepository: Repository<Activity>,
  ) {}

  async create(
    createActivityDto: CreateActivityDto,
    user: User,
  ): Promise<Activity> {
    const activity = new Activity();
    activity.project = createActivityDto.project;
    activity.file = createActivityDto.file;
    activity.language = createActivityDto.language;
    activity.startTime = createActivityDto.startTime;
    activity.endTime = createActivityDto.endTime;

    // Calcular duración en horas
    activity.duration =
      (activity.endTime - activity.startTime) / (1000 * 60 * 60);

    activity.user = user;

    return this.activitiesRepository.save(activity);
  }

  async createMany(
    createActivityDtos: CreateActivityDto[],
    user: User,
  ): Promise<void> {
    const activities = createActivityDtos.map((dto) => {
      const activity = new Activity();
      activity.project = dto.project;
      activity.file = dto.file;
      activity.language = dto.language;
      activity.startTime = dto.startTime;
      activity.endTime = dto.endTime;
      activity.duration = (dto.endTime - dto.startTime) / (1000 * 60 * 60);
      activity.user = user;
      return activity;
    });

    await this.activitiesRepository.save(activities);
  }

  async findAll(userId: number): Promise<Activity[]> {
    return this.activitiesRepository.find({
      where: { user: { id: userId } },
      order: { startTime: 'DESC' },
    });
  }

  async findByDateRange(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Activity[]> {
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();

    return this.activitiesRepository.find({
      where: {
        user: { id: userId },
        startTime: startTimestamp >= 0 ? startTimestamp : 0,
        endTime:
          endTimestamp <= Number.MAX_SAFE_INTEGER
            ? endTimestamp
            : Number.MAX_SAFE_INTEGER,
      },
      order: { startTime: 'DESC' },
    });
  }
}
