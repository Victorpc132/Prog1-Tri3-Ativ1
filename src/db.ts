import { Database } from "bun:sqlite";

const db = new Database("database.sqlite");

db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        username        TEXT NOT NULL UNIQUE,
        email           TEXT NOT NULL UNIQUE,
        password_hash   TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS groups (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT NOT NULL,
        code        TEXT NOT NULL UNIQUE,
        owner_id    INTEGER NOT NULL REFERENCES users(id),
        drawn       INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS members (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id    INTEGER NOT NULL REFERENCES groups(id),
        user_id     INTEGER NOT NULL REFERENCES users(id),
        gives_to    INTEGER REFERENCES users(id),
        UNIQUE (group_id, user_id)
    );
`);

export { db }
