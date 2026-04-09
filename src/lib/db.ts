import { Pool } from 'pg';

/**
 * Postgres connection pool — Singleton
 * ใช้ environment variable DATABASE_URL หรือ fallback ไปค่าแยกชิ้น
 *
 * ตั้งค่าใน .env.local:
 *   DATABASE_URL=postgresql://postgres:123456@<PUBLIC_HOST>:5432/chatbot
 * หรือ
 *   PG_HOST=192.168.0.124  PG_PORT=5432  PG_DATABASE=chatbot
 *   PG_USER=postgres        PG_PASSWORD=123456
 */

let pool: Pool;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      pool = new Pool({
        connectionString,
        max: 10,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 10_000,
        ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      });
    } else {
      pool = new Pool({
        host: process.env.PG_HOST || '192.168.0.124',
        port: parseInt(process.env.PG_PORT || '5432'),
        database: process.env.PG_DATABASE || 'chatbot',
        user: process.env.PG_USER || 'postgres',
        password: process.env.PG_PASSWORD || '123456',
        max: 10,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 10_000,
        ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      });
    }
  }
  return pool;
}

export default getPool;
