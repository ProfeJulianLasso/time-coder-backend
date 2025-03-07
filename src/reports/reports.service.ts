import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { Activity } from '../activity/entities/activity.entity';

export interface DebugSummary {
  hours: number;
}

export interface LanguageSummary {
  language: string;
  hours: number;
}

export interface BranchSummary {
  branch: string;
  hours: number;
  debug: DebugSummary;
}

export interface DailySummary {
  totalHours: number;
  byLanguage: LanguageSummary[];
  byPlatform: PlatformSummary[];
}

export interface PlatformSummary {
  platform: string;
  machine: string;
  hours: number;
  projects: ProjectSummary[];
}

export interface ProjectSummary {
  project: string;
  hours: number;
  debug: DebugSummary;
  branches: BranchSummary[];
}

export interface DailyHoursSummary {
  date: string;
  hours: number;
}

export interface WeeklySummary {
  totalHours: number;
  dailyHours: DailyHoursSummary[];
  byLanguage: LanguageSummary[];
  byPlatform: PlatformSummary[];
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

    try {
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

      // Agrupar por plataforma, máquina y proyectos
      const platformMap = new Map<
        string,
        {
          machine: string;
          hours: number;
          projectsMap: Map<
            string,
            {
              hours: number;
              debugHours: number;
              branchesMap: Map<
                string,
                {
                  hours: number;
                  debugHours: number;
                }
              >;
            }
          >;
        }
      >();

      activities.forEach((activity) => {
        const platform = activity.platform || 'desconocido';
        const machine = activity.machine || 'desconocida';
        const project = activity.project;
        const branch = activity.branch || 'sin-rama';
        const isDebug = activity.debug || false;
        const duration = activity.duration;

        // Inicializar plataforma si no existe
        if (!platformMap.has(platform)) {
          platformMap.set(platform, {
            machine,
            hours: 0,
            projectsMap: new Map(),
          });
        }

        const platformData = platformMap.get(platform)!;
        platformData.hours += duration;

        // Inicializar proyecto si no existe
        if (!platformData.projectsMap.has(project)) {
          platformData.projectsMap.set(project, {
            hours: 0,
            debugHours: 0,
            branchesMap: new Map(),
          });
        }

        const projectData = platformData.projectsMap.get(project)!;
        projectData.hours += duration;
        if (isDebug) {
          projectData.debugHours += duration;
        }

        // Inicializar rama si no existe
        if (!projectData.branchesMap.has(branch)) {
          projectData.branchesMap.set(branch, {
            hours: 0,
            debugHours: 0,
          });
        }

        const branchData = projectData.branchesMap.get(branch)!;
        branchData.hours += duration;
        if (isDebug) {
          branchData.debugHours += duration;
        }
      });

      // Convertir a la estructura requerida
      const byPlatform = Array.from(platformMap.entries()).map(
        ([platform, platformData]) => {
          const projects = Array.from(platformData.projectsMap.entries()).map(
            ([project, projectData]) => {
              const branches = Array.from(
                projectData.branchesMap.entries(),
              ).map(([branch, branchData]) => ({
                branch,
                hours: branchData.hours,
                debug: {
                  hours: branchData.debugHours,
                },
              }));

              return {
                project,
                hours: projectData.hours,
                debug: {
                  hours: projectData.debugHours,
                },
                branches,
              };
            },
          );

          return {
            platform,
            machine: platformData.machine,
            hours: platformData.hours,
            projects,
          };
        },
      );

      return {
        totalHours,
        byLanguage,
        byPlatform,
      };
    } catch (error) {
      console.error('Error al obtener el resumen diario:', error);
      throw error;
    }
  }

  async getWeeklySummary(userId: number): Promise<WeeklySummary> {
    // Obtener fecha de inicio de la semana (domingo)
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    try {
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

      const dailyHours = Array.from(dailyMap.entries()).map(
        ([date, hours]) => ({
          date,
          hours,
        }),
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

      // Agrupar por plataforma, máquina y proyectos
      const platformMap = new Map<
        string,
        {
          machine: string;
          hours: number;
          projectsMap: Map<
            string,
            {
              hours: number;
              debugHours: number;
              branchesMap: Map<
                string,
                {
                  hours: number;
                  debugHours: number;
                }
              >;
            }
          >;
        }
      >();

      activities.forEach((activity) => {
        const platform = activity.platform || 'desconocido';
        const machine = activity.machine || 'desconocida';
        const project = activity.project;
        const branch = activity.branch || 'sin-rama';
        const isDebug = activity.debug || false;
        const duration = activity.duration;

        // Inicializar plataforma si no existe
        if (!platformMap.has(platform)) {
          platformMap.set(platform, {
            machine,
            hours: 0,
            projectsMap: new Map(),
          });
        }

        const platformData = platformMap.get(platform)!;
        platformData.hours += duration;

        // Inicializar proyecto si no existe
        if (!platformData.projectsMap.has(project)) {
          platformData.projectsMap.set(project, {
            hours: 0,
            debugHours: 0,
            branchesMap: new Map(),
          });
        }

        const projectData = platformData.projectsMap.get(project)!;
        projectData.hours += duration;
        if (isDebug) {
          projectData.debugHours += duration;
        }

        // Inicializar rama si no existe
        if (!projectData.branchesMap.has(branch)) {
          projectData.branchesMap.set(branch, {
            hours: 0,
            debugHours: 0,
          });
        }

        const branchData = projectData.branchesMap.get(branch)!;
        branchData.hours += duration;
        if (isDebug) {
          branchData.debugHours += duration;
        }
      });

      // Convertir a la estructura requerida
      const byPlatform = Array.from(platformMap.entries()).map(
        ([platform, platformData]) => {
          const projects = Array.from(platformData.projectsMap.entries()).map(
            ([project, projectData]) => {
              const branches = Array.from(
                projectData.branchesMap.entries(),
              ).map(([branch, branchData]) => ({
                branch,
                hours: branchData.hours,
                debug: {
                  hours: branchData.debugHours,
                },
              }));

              return {
                project,
                hours: projectData.hours,
                debug: {
                  hours: projectData.debugHours,
                },
                branches,
              };
            },
          );

          return {
            platform,
            machine: platformData.machine,
            hours: platformData.hours,
            projects,
          };
        },
      );

      return {
        totalHours,
        dailyHours,
        byLanguage,
        byPlatform,
      };
    } catch (error) {
      console.error('Error al obtener el resumen semanal:', error);
      throw error;
    }
  }

  private convertToTimestamp(date: Date): number {
    return date.getTime();
  }
}
