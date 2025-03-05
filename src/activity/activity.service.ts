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
    const activity = this.activityRepository.create({
      project: createActivityDto.project,
      file: createActivityDto.file,
      language: createActivityDto.language,
      startTime: createActivityDto.startTime,
      endTime: createActivityDto.endTime,
      duration:
        (createActivityDto.endTime - createActivityDto.startTime) / 1000,
      user,
      gitBranch: createActivityDto.gitBranch, // Aseguramos que se asigne el valor de gitBranch
    });

    return this.activityRepository.save(activity);
  }

  async createMany(createActivityDtos: CreateActivityDto[], user: User) {
    const activities = createActivityDtos.map((dto) => {
      return this.activityRepository.create({
        project: dto.project,
        file: dto.file,
        language: dto.language,
        startTime: dto.startTime,
        endTime: dto.endTime,
        duration: (dto.endTime - dto.startTime) / 1000,
        user,
        gitBranch: dto.gitBranch, // Aseguramos que se asigne el valor de gitBranch
      });
    });

    return this.activityRepository.save(activities);
  }

  async findAll(userId: number): Promise<Activity[]> {
    return this.activityRepository.find({
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
