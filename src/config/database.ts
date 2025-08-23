import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { DatabaseConfig } from '@/types';

dotenv.config();
const env = process.env['NODE_ENV'] || 'development';

const config: DatabaseConfig = {
    development: {
        username: process.env['DB_USER'] || 'root',
        password: process.env['DB_PASSWORD'] || '',
        database: process.env['DB_NAME'] || 'nova_sites_db',
        host: process.env['DB_HOST'] || 'localhost',
        port: parseInt(process.env['DB_PORT'] || '3306'),
        dialect: 'mysql',
        logging: console.log,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        timezone: '+07:00',
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true,
        }
    },
    test: {
        username: 'root',
        password: '',
        database: 'database_test',
        host: '127.0.0.1',
        dialect: 'mysql',
        logging: false,
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true,
        }
    },
    production: {
        username: process.env['DB_USER'] || '',
        password: process.env['DB_PASSWORD'] || '',
        database: process.env['DB_NAME'] || '',
        host: process.env['DB_HOST'] || '',
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 10000,
        },
        timezone: '+07:00',
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true,
        }
    }
};

const currentConfig = config[env as keyof DatabaseConfig];

const sequelizeOptions: any = {
    host: currentConfig.host!,
    port: currentConfig.port!,
    dialect: currentConfig.dialect!,
    logging: currentConfig.logging,
    timezone: currentConfig.timezone!,
    define: currentConfig.define!
};

if (currentConfig.pool) {
    sequelizeOptions.pool = currentConfig.pool;
}

const sequelize = new Sequelize(
    currentConfig.database!,
    currentConfig.username!,
    currentConfig.password!,
    sequelizeOptions
);

export default sequelize; 