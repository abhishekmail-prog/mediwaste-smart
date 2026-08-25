import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DB_PATH = join(__dirname, '../database/mediwaste.db')
const MIGRATIONS_PATH = join(__dirname, '../migrations/init.sql')

let db = null

export const initializeDatabase = () => {
  if (db) return db

  // Ensure database directory exists
  const dbDir = join(__dirname, '../database')
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err)
      process.exit(1)
    }
    console.log('📦 SQLite database connected')
    runMigrations()
  })

  return db
}

const runMigrations = () => {
  try {
    const sql = fs.readFileSync(MIGRATIONS_PATH, 'utf8')
    db.exec(sql, (err) => {
      if (err) {
        console.error('Error running migrations:', err)
      } else {
        console.log('✅ Database migrations completed')
      }
    })
  } catch (err) {
    console.error('Error reading migrations file:', err)
  }
}

export const getDb = () => {
  if (!db) {
    return initializeDatabase()
  }
  return db
}

export const closeDatabase = () => {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err)
      } else {
        console.log('Database closed')
      }
    })
  }
}
