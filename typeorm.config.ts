import { DataSource } from 'typeorm';
import { dataSourceOptions } from './src/database/config/database.config';

// Esta configuración es necesaria para que los comandos de CLI de TypeORM funcionen correctamente
export default new DataSource({
  ...dataSourceOptions,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
});
