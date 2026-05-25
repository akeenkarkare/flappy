import * as SQLite from 'expo-sqlite';

const DB_NAME = 'flappy.db';

export async function openDb() {
  return SQLite.openDatabaseAsync(DB_NAME);
}

export async function migrate(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS logged_flights (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT,
      iata TEXT,
      icao24 TEXT,
      callsign TEXT,
      airline TEXT,
      aircraft_reg TEXT,
      aircraft_type TEXT,
      dep_iata TEXT NOT NULL,
      arr_iata TEXT NOT NULL,
      dep_time_utc TEXT NOT NULL,
      arr_time_utc TEXT NOT NULL,
      confidence REAL NOT NULL,
      source TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_logged_flights_dep_time
      ON logged_flights(dep_time_utc DESC);

    CREATE TABLE IF NOT EXISTS trajectories (
      id TEXT PRIMARY KEY NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      encoded_polyline TEXT
    );

    CREATE TABLE IF NOT EXISTS trajectory_samples (
      trajectory_id TEXT NOT NULL,
      lat REAL NOT NULL,
      lon REAL NOT NULL,
      altitude_m REAL,
      pressure_hpa REAL,
      timestamp_utc TEXT NOT NULL,
      FOREIGN KEY (trajectory_id) REFERENCES trajectories(id)
    );
  `);
}
