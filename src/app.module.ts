import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { ActivityModule } from './activity/activity.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ({
          type: configService.get('DB_TYPE', 'postgres'),
          host: configService.get('DB_HOST', 'localhost'),
          port: parseInt(configService.get('DB_PORT', '5432')),
          username: configService.get('DB_USERNAME', 'root'),
          password: configService.get('DB_PASSWORD', 'password'),
          database: configService.get('DB_NAME', 'timecoder'),
          synchronize: configService.get('DB_SYNCHRONIZE', 'false') === 'true',
          logging: configService.get('DB_LOGGING', 'true') === 'true',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
        }) as DataSourceOptions,
    }),
    ActivityModule,
    ReportsModule,
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}
