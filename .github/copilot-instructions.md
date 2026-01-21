# Copilot Instructions - Dieta System

## Project Overview

**Dieta** is a personal diet and fitness progress tracking system built with Express.js backend and vanilla JavaScript frontend. It consists of two main pages:
- **Diet Page** (`index.html`): Displays daily meal plan with nutritional macros (protein, carbs, fats)
- **Progress Page** (`progress.html`): Tracks body measurements with interactive charts, statistics, and backup/restore functionality

## Architecture & Data Flow

### Backend (Node.js + Express)

**Server**: `server.js` runs on port 3000 with Express and CORS enabled. All data mutations require password validation.

**API Structure**:
- `GET /api/progress` - Fetch all progress entries (no auth)
- `POST /api/progress` - Full data replacement (requires password header)
- `POST /api/progress/add` - Add single entry (requires password header)
- `DELETE /api/progress/:id` - Delete entry by ID (requires password header)
- `POST /api/verify-password` - Verify password without modifying data

**Password Protection**: System password is `8315` (hardcoded in `server.js`). All write operations validate via `X-Password` header or request body. Invalid password returns `401 Unauthorized` with `{error: 'Senha incorreta', code: 'INVALID_PASSWORD'}`.

**Data Persistence**: Progress entries stored in MySQL database (`u532802556_dieta`). Table schema:
```sql
CREATE TABLE progress_entries (
    id BIGINT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    weight DECIMAL(5, 2) NOT NULL,
    bodyFat DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date DESC)
)
```
Data is automatically sorted by date (newest first) via `ORDER BY date DESC`.

**Database Configuration**: Uses `dotenv` for secure credential management. Connection details stored in `.env` file (never committed). Uses `mysql2/promise` for async/await support and prepared statements to prevent SQL injection.

### Frontend (Vanilla JavaScript)

**Pages**:
- `index.html` - Static diet display with styled macro cards and meal table (no API calls)
- `progress.html` - Dynamic form with stats cards, Chart.js graphs, history table, and backup/restore buttons
- `progress.js` - Main client logic: fetches/posts to `/api/progress`, handles charts, import/export

**Charts**: Uses Chart.js library (via CDN). Chart instances stored in `window.weightChart` and `window.fatChart`.

**Error Handling**: Password validation errors show specific "Senha incorreta!" alerts. Network errors reference that "servidor está rodando (npm start)".

## Critical Developer Workflows

### Running the Application

```bash
# Development with auto-reload
npm run dev    # Uses nodemon (requires nodemon installed)

# Production
npm start      # Runs Node server on port 3000
```

The server serves all static files from project root. Access:
- Diet: `http://localhost:3000/index.html` or `http://localhost:3000`
- Progress: `http://localhost:3000/progress.html`

### Adding Progress Entries

1. Form in `progress.html` collects date, weight, bodyFat
2. `addEntry(date, weight, bodyFat, password)` in `progress.js` POSTs to `/api/progress/add`
3. Server validates password, adds entry with `id: Date.now()`, sorts array
4. Chart and stats auto-update via `updateStatsCards()` and chart redraw

### Backup/Restore Flow

- **Export**: `exportData()` fetches all data, triggers browser download as `diet_progress_backup.json`
- **Import**: File upload reads JSON, validates structure (requires `date`, `weight`, `bodyFat` per entry), calls `saveProgressData()` to replace entire dataset, then reloads UI

Validation rejects if: not an array, entries missing required fields, or JSON parse fails.

## Project-Specific Conventions

### Styling & Design

- **Dark theme**: CSS variables in `:root` define color palette (`--bg-color`, `--card-bg`, `--text-primary`, etc.)
- **Neon accent colors**: `--carbo` (yellow), `--prot` (red), `--fat` (purple), `--veg` (green) used for macro visualization
- **Fonts**: Fira Code for monospace headings/times, Inter for body text
- **Responsive**: Grid layouts with `repeat(auto-fit, minmax(...))` for mobile adaptation

### Naming Conventions

- Portuguese language for UI text and variable names in HTML/CSS comments
- camelCase for JavaScript functions: `getProgressData`, `updateStatsCards`, `calculateLeanMass`
- File organization: `progress.js` handles all progress page logic separately from server

### Data Validation

- Entry dates in `YYYY-MM-DD` format only
- Weight and bodyFat as numbers, not strings
- Missing or invalid dates reject import with "Dados incompletos no arquivo"
- Server returns full sorted array after mutations (not just delta)

## Integration Points & Dependencies

### External Dependencies

- **express** (^4.18.2): HTTP server framework
- **cors** (^2.8.5): Enable cross-origin requests (currently unused - frontend on same origin)
- **mysql2** (^3.16.1): MySQL database driver with promise/async support
- **dotenv** (^17.2.3): Load environment variables from `.env` file
- **nodemon** (^3.0.1, dev-only): Auto-reload during development
- **Chart.js**: Loaded via CDN in `progress.html` for weight/fat trend visualization

### Client-Server Communication

All API calls use Fetch API with explicit error handling. Password sent via `X-Password` header for requests, or in body for `/api/verify-password`. Client prompts for password via `askPassword()` when needed.

## Key Files & Examples

- [server.js](server.js) - All API endpoints with MySQL queries and password validation
- [db.js](db.js) - MySQL connection pool configuration and table initialization
- [migrate.js](migrate.js) - Script to migrate data from JSON to MySQL database
- [.env.example](.env.example) - Template for environment variables (copy to `.env` with real credentials)
- [progress.js](progress.js) - Chart initialization (`new Chart(ctx, {...})`), data fetching, UI updates
- [progress.html](progress.html) - Form structure, chart canvases, stats card HTML
- [index.html](index.html) - Static diet display (hardcoded meals, no data fetching)
