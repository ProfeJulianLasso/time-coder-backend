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
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async create(createActivityDto: CreateActivityDto, user: User) {
    const activity = this.crateActivity(createActivityDto, user);
    return this.activityRepository.save(activity);
  }

  async createMany(createActivityDtos: CreateActivityDto[], user: User) {
    const activities = createActivityDtos.map((dto) => {
      return this.crateActivity(dto, user);
    });
    return this.activityRepository.save(activities);
  }

  private crateActivity(
    createActivityDto: CreateActivityDto,
    user: User,
  ): Activity {
    const activity = this.activityRepository.create({
      project: createActivityDto.project,
      file: createActivityDto.file,
      language: createActivityDto.language,
      startTime: createActivityDto.startTime,
      endTime: createActivityDto.endTime,
      duration:
        (createActivityDto.endTime - createActivityDto.startTime) / 1000,
      user,
      branch: createActivityDto.branch,
      machine: createActivityDto.machine,
      platform: createActivityDto.platform,
      debug: createActivityDto.debug,
    });
    return activity;
  }

  async findAll(userId: string): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { user: { id: userId } },
      order: { startTime: 'DESC' },
    });
  }

  async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Activity[]> {
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();

    return this.activityRepository.find({
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
