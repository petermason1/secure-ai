CREATE TABLE IF NOT EXISTS project_manager_requests (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    flags TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_manager_assignments (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    department TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    last_reminder_at TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES project_manager_requests(id)
);
