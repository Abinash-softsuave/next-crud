import mysql from "mysql2/promise";

const pool = mysql.createPool(process.env.DATABASE_URL as string);

export async function query(sql: string, params: any[] = []) {
  const [results] = await pool.execute(sql, params);
  return results;
}
