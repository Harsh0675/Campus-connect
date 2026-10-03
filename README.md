# CampusConnect

College management system for a **minor project**. One web portal for admin, faculty, and students.

## What it covers

- Role-based login (admin / faculty / student)
- Student and faculty records
- Course catalog
- Attendance marking and student view
- Marks / assessments
- Campus notices
- Dashboard with live counts

Data is stored in `server/data/db.json` (no MongoDB/MySQL required). Seed data is created on first run.

## How to run

Node.js is required. This project used the local install at `C:\Users\uma\nodejs`.

```bash
cd C:\Users\uma\Project\CampusConnect
set PATH=C:\Users\uma\nodejs;%PATH%
npm install
npm run install:all
npm run dev
```

Then open **http://localhost:5173**

API runs on **http://localhost:5000**

## Demo accounts

| Role    | Username | Password    |
|---------|----------|-------------|
| Admin   | admin    | admin123    |
| Faculty | faculty  | faculty123  |
| Student | student  | student123  |

## Project structure

```
CampusConnect/
  client/     React + Vite frontend
  server/     Express API
```

## Suggested viva talking points

1. Three-tier idea: browser UI, REST API, JSON data store
2. Authentication with session tokens
3. Role checks so students cannot mark attendance
4. Attendance percentage calculated from stored sessions
5. Easy to swap JSON files for MySQL/Mongo later
