require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { encrypt, decrypt } = require("./utils/encryption");

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Database adapter: SQLite for local testing, PostgreSQL for production
// ---------------------------------------------------------------------------
let db;

if (process.env.DATABASE_URL) {
  // ── PostgreSQL mode ──
  const { Pool } = require("pg");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  db = {
    name: "PostgreSQL",
    async init() {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS students (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          student_hash TEXT UNIQUE NOT NULL,
          encrypted_student_id TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS incidents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          student_hash TEXT NOT NULL REFERENCES students(student_hash),
          description TEXT NOT NULL,
          severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5),
          year INTEGER NOT NULL,
          commitment_hash TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
    },
    async healthCheck() {
      await pool.query("SELECT 1");
    },
    async insertStudent(studentHash, encryptedId) {
      await pool.query(
        "INSERT INTO students (student_hash, encrypted_student_id) VALUES ($1, $2) ON CONFLICT (student_hash) DO NOTHING",
        [studentHash, encryptedId]
      );
    },
    async getStudent(studentHash) {
      const result = await pool.query(
        "SELECT student_hash, encrypted_student_id, created_at FROM students WHERE student_hash = $1",
        [studentHash]
      );
      return result.rows[0] || null;
    },
    async insertIncident(studentHash, description, severity, year, commitmentHash) {
      await pool.query(
        "INSERT INTO incidents (student_hash, description, severity, year, commitment_hash) VALUES ($1, $2, $3, $4, $5)",
        [studentHash, description, severity, year, commitmentHash]
      );
    },
    async getIncidents(studentHash) {
      const result = await pool.query(
        "SELECT description, severity, year, commitment_hash, created_at FROM incidents WHERE student_hash = $1 ORDER BY created_at DESC",
        [studentHash]
      );
      return result.rows;
    },
  };
} else {
  // ── SQLite mode (local testing — no PostgreSQL needed) ──
  const Database = require("better-sqlite3");
  const path = require("path");
  const sqliteDb = new Database(path.join(__dirname, "local.db"));
  sqliteDb.pragma("journal_mode = WAL");

  db = {
    name: "SQLite (local)",
    async init() {
      sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS students (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          student_hash TEXT UNIQUE NOT NULL,
          encrypted_student_id TEXT NOT NULL,
          created_at TEXT DEFAULT (datetime('now'))
        )
      `);
      sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS incidents (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          student_hash TEXT NOT NULL REFERENCES students(student_hash),
          description TEXT NOT NULL,
          severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5),
          year INTEGER NOT NULL,
          commitment_hash TEXT NOT NULL,
          created_at TEXT DEFAULT (datetime('now'))
        )
      `);
    },
    async healthCheck() {
      sqliteDb.prepare("SELECT 1").get();
    },
    async insertStudent(studentHash, encryptedId) {
      sqliteDb
        .prepare("INSERT OR IGNORE INTO students (student_hash, encrypted_student_id) VALUES (?, ?)")
        .run(studentHash, encryptedId);
    },
    async getStudent(studentHash) {
      return sqliteDb
        .prepare("SELECT student_hash, encrypted_student_id, created_at FROM students WHERE student_hash = ?")
        .get(studentHash) || null;
    },
    async insertIncident(studentHash, description, severity, year, commitmentHash) {
      sqliteDb
        .prepare("INSERT INTO incidents (student_hash, description, severity, year, commitment_hash) VALUES (?, ?, ?, ?, ?)")
        .run(studentHash, description, severity, year, commitmentHash);
    },
    async getIncidents(studentHash) {
      return sqliteDb
        .prepare("SELECT description, severity, year, commitment_hash, created_at FROM incidents WHERE student_hash = ? ORDER BY created_at DESC")
        .all(studentHash);
    },
  };
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Health check
app.get("/health", async (_req, res) => {
  try {
    await db.healthCheck();
    res.json({ status: "ok", database: db.name });
  } catch {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

// Register a student (store encrypted ID + hash)
app.post("/students", async (req, res) => {
  try {
    const { studentId, studentHash } = req.body;
    if (!studentId || !studentHash) {
      return res.status(400).json({ error: "studentId and studentHash are required" });
    }
    const encrypted = encrypt(studentId);
    await db.insertStudent(studentHash, encrypted);
    res.json({ success: true });
  } catch (error) {
    console.error("Error registering student:", error);
    res.status(500).json({ error: "Failed to register student" });
  }
});

// Add an incident record
app.post("/incidents", async (req, res) => {
  try {
    const { studentHash, description, severity, year, commitmentHash } = req.body;
    if (!studentHash || !description || severity == null || !year || !commitmentHash) {
      return res.status(400).json({ error: "All fields are required" });
    }
    await db.insertIncident(studentHash, description, severity, year, commitmentHash);
    res.json({ success: true });
  } catch (error) {
    console.error("Error adding incident:", error);
    res.status(500).json({ error: "Failed to add incident" });
  }
});

// Get incidents for a student
app.get("/incidents/:studentHash", async (req, res) => {
  try {
    const rows = await db.getIncidents(req.params.studentHash);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching incidents:", error);
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
});

// Get student info (decrypt ID for authorized viewers)
app.get("/students/:studentHash", async (req, res) => {
  try {
    const student = await db.getStudent(req.params.studentHash);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const decryptedId = decrypt(student.encrypted_student_id);
    res.json({
      studentHash: student.student_hash,
      studentId: decryptedId,
      createdAt: student.created_at,
    });
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ error: "Failed to fetch student" });
  }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 4000;

(async () => {
  await db.init();
  app.listen(PORT, () => {
    console.log(`\n🔐 Disciplinary Backend running on port ${PORT}`);
    console.log(`   Database: ${db.name}`);
    console.log(`   Health:   http://localhost:${PORT}/health\n`);
  });
})();
