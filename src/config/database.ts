import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const env = process.env['NODE_ENV'] || 'development';

const sequelize = new Sequelize(
  process.env['DB_NAME'] || 'nova_sites_db',
  process.env['DB_USER'] || 'root',
  process.env['DB_PASSWORD'] || '',
  {
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '3306'),
    dialect: 'mysql',
    logging: env === 'development' ? console.log : false,
    pool: {
      max: env === 'production' ? 10 : 5,
      min: env === 'production' ? 2 : 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: '+07:00',
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  }
);

export default sequelize; 