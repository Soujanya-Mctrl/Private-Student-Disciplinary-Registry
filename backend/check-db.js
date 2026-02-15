const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "local.db");
const db = new Database(dbPath, { readonly: true });

console.log("\n=== Checking SQLite Database (local.db) ===\n");

// Check Students
console.log("--- Students ---");
const students = db.prepare("SELECT * FROM students").all();
if (students.length === 0) {
  console.log("No students found.");
} else {
  console.table(students);
}

console.log("\n--- Incidents ---");
// Check Incidents
const incidents = db.prepare("SELECT * FROM incidents").all();
if (incidents.length === 0) {
  console.log("No incidents found.");
} else {
  console.table(incidents);
}

console.log("\nDone.");
