import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityModule } from './activity/activity.module';
import { Activity } from './activity/entities/activity.entity';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entities/user.entity';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get('DATABASE_PATH', 'devtimer.sqlite'),
        entities: [Activity, User],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: 'all',
      }),
    }),
    ActivityModule,
    ReportsModule,
    AuthModule,
  ],
})
export class AppModule {}
