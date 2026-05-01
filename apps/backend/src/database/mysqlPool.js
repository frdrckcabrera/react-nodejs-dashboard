import mysql from 'mysql2/promise';
import { databaseConfig } from '../config/database.js';

export const mysqlPool = mysql.createPool(databaseConfig);

/**
 * Runs a lightweight database query to verify that MySQL is reachable.
 * @returns {Promise<void>}
 */
export async function verifyDatabaseConnection() {
  await mysqlPool.query('SELECT 1 AS ok');
}
