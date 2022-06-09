import { defaultConfig } from 'src/configs/database.config';
import { ConnectionOptions } from 'typeorm';

const config: ConnectionOptions = {
  ...defaultConfig,
  logging: true,
  logger: 'file',
  migrationsTableName: 'migrate_tables',
  synchronize: false,
  // Allow both start:prod and start:dev to use migrations
  // __dirname is either dist or src folder, meaning either
  // the compiled js in prod or the ts in dev.
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  cli: {
    // location of migration should be inside src folder
    // to be compiled into dist/ folder.
    migrationsDir: 'src/migrations',
  },
};

export = config;
