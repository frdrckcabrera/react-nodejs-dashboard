import dotenv from 'dotenv';

dotenv.config();

export const databaseConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  database: process.env.MYSQL_DATABASE || 'expenses_dashboard',
  user: process.env.MYSQL_USER || 'expenses_user',
  password: process.env.MYSQL_PASSWORD || 'expenses_password',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

export const serverConfig = {
  port: Number(process.env.PORT || 4000),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
};
