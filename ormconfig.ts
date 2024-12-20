import { ConnectionOptions } from 'typeorm';
import dotenv from 'dotenv'

const devEnviroment = process.env.ENVIROMENT === "DEV"
// Check typeORM documentation for more information.
const config: ConnectionOptions = {
  type: 'postgres',
  port: Number(process.env.DB_PORT), // Ensure DB_PORT is defined in your environment
  migrationsRun: true, // Run migrations on startup
  host: process.env.DB_HOST, // Ensure DB_HOST is defined
  database: process.env.DB_NAME, // Ensure DB_NAME is defined
  username: process.env.DB_USER, // Ensure DB_USER is defined
  password: process.env.DB_PASSWORD, // Ensure DB_PASSWORD is defined
  entities: [ devEnviroment?  './src/app/entities/*' : './build/src/app/entities/*'], // Adjust path based on your output
  migrations: [ devEnviroment? './src/database/migrations/*' : './build/src/database/migrations/*'], // Adjust path based on your output
  cli: {
    entitiesDir: devEnviroment? './src/app/entities' : './build/src/app/entities', // Path for CLI entities
    migrationsDir: devEnviroment? './src/database/migrations' : './build/src/database/migrations', // Path for CLI migrations
  },
  extra: {
    options: '-c timezone=America/Sao_Paulo'
  }
};

export = config;
