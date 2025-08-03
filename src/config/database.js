import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();
const env = process.env['NODE_ENV'] || 'development';

const config = {
    development: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'nova_sites_db',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        dialect: 'mysql',
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true,
        }
    },
    test: {
        username: 'root',
        password: null,
        database: 'database_test',
        host: '127.0.0.1',
        dialect: 'mysql',
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true,
        }
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: 'mysql',
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true,
        }
    }
};

const currentConfig = config[env];

const sequelize = new Sequelize(
    currentConfig.database,
    currentConfig.username,
    currentConfig.password,
    currentConfig
);

export default sequelize;
