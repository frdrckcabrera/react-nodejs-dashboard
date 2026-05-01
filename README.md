# Personal Expenses Dashboard

A full-stack personal expenses dashboard built with React, TypeScript, pure Node.js HTTP APIs, MySQL, and Docker. Users can upload an `.xlsx` workbook containing income and expense rows, then inspect summary cards, monthly cash flow, category spending, and recent transactions.

## Tech Stack

- Frontend: React.js, TypeScript, Vite, Recharts, Lucide React
- Backend: Pure Node.js HTTP server, MySQL2, SheetJS `xlsx`
- Database: MySQL 8
- Environment: Docker Compose

## Why Recharts

Recharts is a strong fit for this dashboard because it provides React-native chart components, good TypeScript ergonomics, responsive containers, and the exact chart primitives needed for finance dashboards without heavy custom rendering code.

## Project Structure

```text
.
+-- apps
|   +-- backend
|   |   +-- src
|   |   |   +-- config
|   |   |   +-- controllers
|   |   |   +-- database
|   |   |   +-- repositories
|   |   |   +-- scripts
|   |   |   +-- services
|   |   |   +-- utils
|   |   +-- package.json
|   +-- frontend
|       +-- src
|       |   +-- api
|       |   +-- components
|       |   +-- pages
|       |   +-- types
|       |   +-- utils
|       +-- package.json
+-- docker
|   +-- mysql
+-- docker-compose.yml
+-- package.json
```

## XLSX Import Format

The importer reads the first worksheet in the uploaded workbook. It accepts these column names and aliases:

| Canonical field | Accepted aliases |
| --- | --- |
| `date` | `date`, `transaction date`, `posted date` |
| `description` | `description`, `details`, `memo`, `note` |
| `category` | `category`, `expense category`, `income category` |
| `type` | `type`, `transaction type`, `kind` |
| `amount` | `amount`, `value`, `total` |
| `source` | `source`, `account`, `wallet` |

Recommended workbook example:

| Date | Description | Category | Type | Amount | Source |
| --- | --- | --- | --- | ---: | --- |
| 2026-01-05 | Salary | Salary | income | 5000 | Bank |
| 2026-01-06 | Groceries | Food | expense | 142.50 | Credit Card |
| 2026-01-10 | Internet bill | Utilities | expense | 80 | Bank |

If `type` is missing, positive values become income and negative values become expenses.

## Run With Docker

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000/api`
- MySQL: `localhost:3306`

The MySQL container automatically creates the `transactions` table from `docker/mysql/init.sql`.

## Run Locally

Start MySQL first, either with Docker or your own local MySQL server.

```bash
npm install
cp apps/backend/.env.example apps/backend/.env
npm run db:init
npm run dev:backend
npm run dev:frontend
```

## API Endpoints

### `GET /api/dashboard`

Returns dashboard summary, category spend, monthly cash flow, and recent transactions.

### `POST /api/import`

Accepts a multipart form upload with a `.xlsx` file field named `file`.

Response:

```json
{
  "importedCount": 12,
  "skippedCount": 0
}
```

### `DELETE /api/transactions`

Clears every imported transaction row from the MySQL table.

Response:

```json
{
  "deletedCount": 47
}
```

## Design And Architecture Notes

- The backend is organized around controllers, services, repositories, and utilities.
- Controllers translate HTTP requests and responses.
- Services hold business behavior such as workbook parsing and dashboard aggregation.
- Repositories own SQL access.
- Utility modules keep HTTP and multipart parsing concerns isolated.
- Frontend components are small, typed, and focused on one rendering responsibility.
- Function and method names are descriptive, and implementation methods include JSDoc comments.

## Build

```bash
npm run build
```

The build compiles the React TypeScript frontend and produces static assets in `apps/frontend/dist`.
