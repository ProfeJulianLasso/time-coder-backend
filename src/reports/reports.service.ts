import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { Activity } from '../activity/entities/activity.entity';

export interface DebugSummary {
  durationInSeconds: number;
}

export interface LanguageSummary {
  language: string;
  durationInSeconds: number;
}

export interface BranchSummary {
  branch: string;
  durationInSeconds: number;
  debug: DebugSummary;
}

export interface DailySummary {
  totalDurationInSeconds: number;
  byLanguage: LanguageSummary[];
  byPlatform: PlatformSummary[];
}

export interface PlatformSummary {
  platform: string;
  machine: string;
  durationInSeconds: number;
  projects: ProjectSummary[];
}

export interface ProjectSummary {
  project: string;
  durationInSeconds: number;
  debug: DebugSummary;
  branches: BranchSummary[];
}

export interface DailyDurationSummary {
  date: string;
  durationInSeconds: number;
}

export interface WeeklySummary {
  totalDurationInSeconds: number;
  dailyDurationInSeconds: DailyDurationSummary[];
  byLanguage: LanguageSummary[];
  byPlatform: PlatformSummary[];
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Activity)
    private readonly activitiesRepository: Repository<Activity>,
  ) {}

  async getDailySummary(userId: string): Promise<DailySummary> {
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
      const totalDurationInSeconds = activities.reduce(
        (sum, activity) => sum + activity.duration,
        0,
      );

      // Agrupar por lenguaje
      const languageMap = new Map<string, number>();
      activities.forEach((activity) => {
        const currentDurationInSeconds =
          languageMap.get(activity.language) ?? 0;
        languageMap.set(
          activity.language,
          currentDurationInSeconds + activity.duration,
        );
      });

      const byLanguage = Array.from(languageMap.entries()).map(
        ([language, durationInSeconds]) => ({
          language,
          durationInSeconds,
        }),
      );

      // Agrupar por plataforma, máquina y proyectos
      const platformMap = new Map<
        string,
        {
          machine: string;
          durationInSeconds: number;
          projectsMap: Map<
            string,
            {
              durationInSeconds: number;
              debugDurationInSeconds: number;
              branchesMap: Map<
                string,
                {
                  durationInSeconds: number;
                  debugDurationInSeconds: number;
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
            durationInSeconds: 0,
            projectsMap: new Map(),
          });
        }

        const platformData = platformMap.get(platform)!;
        platformData.durationInSeconds += duration;

        // Inicializar proyecto si no existe
        if (!platformData.projectsMap.has(project)) {
          platformData.projectsMap.set(project, {
            durationInSeconds: 0,
            debugDurationInSeconds: 0,
            branchesMap: new Map(),
          });
        }

        const projectData = platformData.projectsMap.get(project)!;
        projectData.durationInSeconds += duration;
        if (isDebug) {
          projectData.debugDurationInSeconds += duration;
        }

        // Inicializar rama si no existe
        if (!projectData.branchesMap.has(branch)) {
          projectData.branchesMap.set(branch, {
            durationInSeconds: 0,
            debugDurationInSeconds: 0,
          });
        }

        const branchData = projectData.branchesMap.get(branch)!;
        branchData.durationInSeconds += duration;
        if (isDebug) {
          branchData.debugDurationInSeconds += duration;
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
                durationInSeconds: branchData.durationInSeconds,
                debug: {
                  durationInSeconds: branchData.debugDurationInSeconds,
                },
              }));

              return {
                project,
                durationInSeconds: projectData.durationInSeconds,
                debug: {
                  durationInSeconds: projectData.debugDurationInSeconds,
                },
                branches,
              };
            },
          );

          return {
            platform,
            machine: platformData.machine,
            durationInSeconds: platformData.durationInSeconds,
            projects,
          };
        },
      );

      return {
        totalDurationInSeconds: totalDurationInSeconds,
        byLanguage,
        byPlatform,
      };
    } catch (error) {
      console.error('Error al obtener el resumen diario:', error);
      throw error;
    }
  }

  async getWeeklySummary(userId: string): Promise<WeeklySummary> {
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
      const totalDurationInSeconds = activities.reduce(
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
        const currentDurationInSeconds = dailyMap.get(dateString) ?? 0;
        dailyMap.set(dateString, currentDurationInSeconds + activity.duration);
      });

      const dailyDurationInSeconds = Array.from(dailyMap.entries()).map(
        ([date, durationInSeconds]) => ({
          date,
          durationInSeconds,
        }),
      );

      // Agrupar por lenguaje
      const languageMap = new Map<string, number>();
      activities.forEach((activity) => {
        const currentDurationInSeconds =
          languageMap.get(activity.language) ?? 0;
        languageMap.set(
          activity.language,
          currentDurationInSeconds + activity.duration,
        );
      });

      const byLanguage = Array.from(languageMap.entries()).map(
        ([language, durationInSeconds]) => ({
          language,
          durationInSeconds,
        }),
      );

      // Agrupar por plataforma, máquina y proyectos
      const platformMap = new Map<
        string,
        {
          machine: string;
          durationInSeconds: number;
          projectsMap: Map<
            string,
            {
              durationInSeconds: number;
              debugDurationInSeconds: number;
              branchesMap: Map<
                string,
                {
                  durationInSeconds: number;
                  debugDurationInSeconds: number;
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
            durationInSeconds: 0,
            projectsMap: new Map(),
          });
        }

        const platformData = platformMap.get(platform)!;
        platformData.durationInSeconds += duration;

        // Inicializar proyecto si no existe
        if (!platformData.projectsMap.has(project)) {
          platformData.projectsMap.set(project, {
            durationInSeconds: 0,
            debugDurationInSeconds: 0,
            branchesMap: new Map(),
          });
        }

        const projectData = platformData.projectsMap.get(project)!;
        projectData.durationInSeconds += duration;
        if (isDebug) {
          projectData.debugDurationInSeconds += duration;
        }

        // Inicializar rama si no existe
        if (!projectData.branchesMap.has(branch)) {
          projectData.branchesMap.set(branch, {
            durationInSeconds: 0,
            debugDurationInSeconds: 0,
          });
        }

        const branchData = projectData.branchesMap.get(branch)!;
        branchData.durationInSeconds += duration;
        if (isDebug) {
          branchData.debugDurationInSeconds += duration;
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
                durationInSeconds: branchData.durationInSeconds,
                debug: {
                  durationInSeconds: branchData.debugDurationInSeconds,
                },
              }));

              return {
                project,
                durationInSeconds: projectData.durationInSeconds,
                debug: {
                  durationInSeconds: projectData.debugDurationInSeconds,
                },
                branches,
              };
            },
          );

          return {
            platform,
            machine: platformData.machine,
            durationInSeconds: platformData.durationInSeconds,
            projects,
          };
        },
      );

      return {
        totalDurationInSeconds: totalDurationInSeconds,
        dailyDurationInSeconds: dailyDurationInSeconds,
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
