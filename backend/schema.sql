-- Students table: stores encrypted student IDs mapped to on-chain hashes
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_hash TEXT UNIQUE NOT NULL,
    encrypted_student_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Incidents table: stores private incident metadata linked to student hashes
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_hash TEXT NOT NULL REFERENCES students(student_hash),
    description TEXT NOT NULL,
    severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5),
    year INTEGER NOT NULL,
    commitment_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups by student hash
CREATE INDEX idx_incidents_student_hash ON incidents(student_hash);
