import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

export function isConfigured() {
  return !!(
    process.env.MYSQL_HOST?.trim() &&
    process.env.MYSQL_USER?.trim() &&
    process.env.MYSQL_PASSWORD?.trim() &&
    process.env.MYSQL_DATABASE?.trim()
  );
}

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST?.trim(),
      port: Number(process.env.MYSQL_PORT?.trim()) || 3306,
      user: process.env.MYSQL_USER?.trim(),
      password: process.env.MYSQL_PASSWORD?.trim(),
      database: process.env.MYSQL_DATABASE?.trim(),
      waitForConnections: true,
      connectionLimit: 5,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}
