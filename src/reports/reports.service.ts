import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { Activity } from '../activity/entities/activity.entity';

export interface LanguageSummary {
  language: string;
  hours: number;
}

export interface ProjectSummary {
  project: string;
  hours: number;
}

export interface DailySummary {
  totalHours: number;
  byLanguage: LanguageSummary[];
  byProject: ProjectSummary[];
}

export interface WeeklySummary {
  totalHours: number;
  dailyHours: {
    date: string;
    hours: number;
  }[];
  byLanguage: LanguageSummary[];
  byProject: ProjectSummary[];
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Activity)
    private readonly activitiesRepository: Repository<Activity>,
  ) {}

  async getDailySummary(userId: number): Promise<DailySummary> {
    // Obtener actividades del día actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activities = await this.activitiesRepository.find({
      where: {
        user: { id: userId },
        startTime: MoreThanOrEqual(this.convertToTimestamp(today)),
        endTime: LessThan(this.convertToTimestamp(tomorrow)),
      },
    });

    // Calcular horas totales
    const totalHours = activities.reduce(
      (sum, activity) => sum + activity.duration,
      0,
    );

    // Agrupar por lenguaje
    const languageMap = new Map<string, number>();
    activities.forEach((activity) => {
      const currentHours = languageMap.get(activity.language) ?? 0;
      languageMap.set(activity.language, currentHours + activity.duration);
    });

    const byLanguage = Array.from(languageMap.entries()).map(
      ([language, hours]) => ({
        language,
        hours,
      }),
    );

    // Agrupar por proyecto
    const projectMap = new Map<string, number>();
    activities.forEach((activity) => {
      const currentHours = projectMap.get(activity.project) ?? 0;
      projectMap.set(activity.project, currentHours + activity.duration);
    });

    const byProject = Array.from(projectMap.entries()).map(
      ([project, hours]) => ({
        project,
        hours,
      }),
    );

    return {
      totalHours,
      byLanguage,
      byProject,
    };
  }

  async getWeeklySummary(userId: number): Promise<WeeklySummary> {
    // Obtener fecha de inicio de la semana (domingo)
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const activities = await this.activitiesRepository.find({
      where: {
        user: { id: userId },
        startTime: MoreThanOrEqual(this.convertToTimestamp(startOfWeek)),
        endTime: LessThan(this.convertToTimestamp(endOfWeek)),
      },
    });

    // Calcular horas totales
    const totalHours = activities.reduce(
      (sum, activity) => sum + activity.duration,
      0,
    );

    // Agrupar por día
    const dailyMap = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      dailyMap.set(dateString, 0);
    }

    activities.forEach((activity) => {
      const date = new Date(activity.startTime);
      const dateString = date.toISOString().split('T')[0];
      const currentHours = dailyMap.get(dateString) ?? 0;
      dailyMap.set(dateString, currentHours + activity.duration);
    });

    const dailyHours = Array.from(dailyMap.entries()).map(([date, hours]) => ({
      date,
      hours,
    }));

    // Agrupar por lenguaje
    const languageMap = new Map<string, number>();
    activities.forEach((activity) => {
      const currentHours = languageMap.get(activity.language) ?? 0;
      languageMap.set(activity.language, currentHours + activity.duration);
    });

    const byLanguage = Array.from(languageMap.entries()).map(
      ([language, hours]) => ({
        language,
        hours,
      }),
    );

    // Agrupar por proyecto
    const projectMap = new Map<string, number>();
    activities.forEach((activity) => {
      const currentHours = projectMap.get(activity.project) ?? 0;
      projectMap.set(activity.project, currentHours + activity.duration);
    });

    const byProject = Array.from(projectMap.entries()).map(
      ([project, hours]) => ({
        project,
        hours,
      }),
    );

    return {
      totalHours,
      dailyHours,
      byLanguage,
      byProject,
    };
  }

  private convertToTimestamp(date: Date): number {
    return date.getTime();
  }
}
