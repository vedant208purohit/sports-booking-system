# Sports Booking Platform

Full-stack project with:
- Backend: Node.js + Express + PostgreSQL (Supabase friendly)
- Frontend: Next.js dashboard (filters, KPIs, bookings/coaching tables, revenue chart)

## Project Structure
```
.
├── db/                 # schema.sql, seed.sql
├── routes/             # API routes (venues, bookings, transactions, members, sports)
├── scripts/            # migrate.js, test-connection.js
├── server.js           # Express entrypoint
└── frontend/           # Next.js dashboard
```

## Prerequisites
- Node.js 18+
- PostgreSQL or Supabase
- npm

## Environment Variables
Create `.env` in project root:
```
DATABASE_URL=postgresql://user:password@host:5432/postgres?sslmode=require
PORT=3000
NODE_ENV=development
NODE_TLS_REJECT_UNAUTHORIZED=0
```

Frontend (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Setup & Install
```bash
cd /Users/vedantpurohit/Public/Vercel   # or your clone path
npm install                             # backend deps
cd frontend && npm install              # frontend deps
```

## Database
### Option A: Supabase (recommended)
1) In Supabase SQL Editor, run `db/schema.sql`, then `db/seed.sql`.

### Option B: Local Postgres
```bash
createdb sports_booking_db
npm run migrate    # uses DATABASE_URL
```

## Run Locally
Backend:
```bash
cd /Users/vedantpurohit/Public/Vercel
npm start   # http://localhost:3000
```

Frontend:
```bash
cd /Users/vedantpurohit/Public/Vercel/frontend
npm run dev   # http://localhost:3001
```

## API Endpoints (backend)
- Health: `GET /health`
- Venues: `GET /api/venues`
- Bookings: `GET /api/bookings`
- Transactions: `GET /api/transactions`
- Members: `GET /api/members`
- Sports: `GET /api/sports`

## Dashboard (frontend)
- Filters: venue, sport, month
- KPIs: active/inactive members, conversion, revenues, bookings, repeat, utilization, refunds/disputes
- Booking tab: full bookings table
- Coaching tab: coaching transactions table
- Revenue chart: filtered by month (and venue when enabled)

## Deployment (Vercel)
1) Push to GitHub.
2) `npm install -g vercel && vercel login`
3) From project root: `vercel --prod`
4) Add env vars in Vercel (Production/Preview/Development):
   - `DATABASE_URL`
   - `NODE_ENV=production`
   - `NODE_TLS_REJECT_UNAUTHORIZED=0`
   - Frontend project: `NEXT_PUBLIC_API_URL=https://your-backend.vercel.app`
5) Run schema/seed on production DB (Supabase SQL Editor).

## Git Quick Start
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/REPO.git
git push -u origin main
```

## Troubleshooting
- SSL errors with Supabase: ensure `?sslmode=require` and `NODE_TLS_REJECT_UNAUTHORIZED=0`.
- Migrations on Supabase: prefer running `schema.sql` and `seed.sql` in Supabase SQL Editor.
- Frontend cannot reach API: check `NEXT_PUBLIC_API_URL` and that backend is running/redeployed.

# Sports Booking API

A comprehensive backend API for managing sports venue bookings, transactions, and members. Built with Node.js, Express, and PostgreSQL, designed for deployment on Vercel.

## Features

- **Venues Management**: CRUD operations for sports venues
- **Bookings Management**: Create, read, update, and delete bookings with filtering
- **Transactions Management**: Track all financial transactions
- **Members Management**: Manage member accounts with trial user tracking
- **Sports Management**: List available sports
- **Comprehensive Error Handling**: Proper validation and error responses
- **Query Filtering**: Filter bookings and transactions by various criteria

## Prerequisites

- Node.js 18.x or higher
- PostgreSQL database
- GitHub account (for version control)
- Vercel account (for deployment)

## Project Structure

```
.
├── db/
│   ├── schema.sql          # Database schema
│   ├── seed.sql            # Seed data
│   └── connection.js       # Database connection pool
├── routes/
│   ├── venues.js           # Venue routes
│   ├── bookings.js         # Booking routes
│   ├── transactions.js     # Transaction routes
│   ├── members.js          # Member routes
│   └── sports.js           # Sport routes
├── scripts/
│   └── migrate.js          # Database migration script
├── server.js               # Main Express server
├── vercel.json             # Vercel configuration
├── package.json            # Dependencies
└── README.md               # This file
```

## Database Schema

### Tables

1. **venues**: Sports venues (venue_id, name, location)
2. **members**: Member accounts (member_id, name, status, is_trial_user, converted_from_trial, join_date)
3. **sports**: Available sports (sport_id, name)
4. **bookings**: Booking records (booking_id, venue_id, sport_id, member_id, booking_date, amount, coupon_code, status)
5. **transactions**: Financial transactions (transaction_id, booking_id, type, amount, status, transaction_date)

## Setup Instructions

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Vercel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/sports_booking_db
   PORT=3000
   NODE_ENV=development
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb sports_booking_db
   
   # Or using psql
   psql -U postgres
   CREATE DATABASE sports_booking_db;
   ```

5. **Run migrations**
   ```bash
   npm run migrate
   ```
   This will create all tables and seed initial data.

6. **Start the server**
   ```bash
   npm start
   # or
   npm run dev
   ```

   The server will run on `http://localhost:3000`

### Vercel Deployment

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Link your project**
   ```bash
   vercel link
   ```

4. **Set environment variables in Vercel Dashboard**
   - Go to your project settings in Vercel
   - Navigate to Environment Variables
   - Add `DATABASE_URL` with your PostgreSQL connection string
   - Add `NODE_ENV=production`

5. **Deploy**
   ```bash
   vercel --prod
   ```

   Or push to your main branch if you have Vercel connected to your GitHub repo.

6. **Run migrations on production database**
   You'll need to run the migration script against your production database. You can do this by:
   - Connecting to your production database
   - Running the SQL files directly, or
   - Using a database migration tool

## API Endpoints

### Health Check
- `GET /health` - Check server status

### Venues
- `GET /api/venues` - Get all venues
- `GET /api/venues/:id` - Get venue by ID
- `POST /api/venues` - Create new venue
- `PUT /api/venues/:id` - Update venue
- `DELETE /api/venues/:id` - Delete venue

### Bookings
- `GET /api/bookings` - Get all bookings (with filters: venue_id, member_id, status, start_date, end_date)
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

### Transactions
- `GET /api/transactions` - Get all transactions (with filters: booking_id, type, status, start_date, end_date)
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Members
- `GET /api/members` - Get all members (with filters: status, is_trial_user, converted_from_trial)
- `GET /api/members/:id` - Get member by ID (includes bookings and transactions)
- `POST /api/members` - Create new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Sports
- `GET /api/sports` - Get all sports
- `GET /api/sports/:id` - Get sport by ID

## Example API Requests

### Create a Booking
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "venue_id": 1,
    "sport_id": 1,
    "member_id": 1,
    "booking_date": "2025-12-20 10:00:00",
    "amount": 500.00,
    "coupon_code": "SAVE10",
    "status": "Confirmed"
  }'
```

### Get Bookings with Filters
```bash
curl "http://localhost:3000/api/bookings?venue_id=1&status=Confirmed"
```

### Get Member with Related Data
```bash
curl "http://localhost:3000/api/members/1"
```

## Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "count": 10  // for list endpoints
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error message"
}
```

## Data Validation

The API includes comprehensive validation:

- **Required fields** are checked for all POST requests
- **Status values** are validated against allowed values
- **Foreign key relationships** are validated (e.g., booking must reference existing venue, sport, and member)
- **Data types** are validated (dates, numbers, booleans)

## Edge Cases Handled

- Missing required fields
- Invalid status values
- Non-existent foreign key references
- Empty query results (404 responses)
- Database connection errors
- Invalid date formats
- SQL injection prevention (using parameterized queries)

## Time Limit Compliance

This project was designed to be completed within a 2-hour time limit, focusing on:
- ✅ Correct data modeling with proper relationships
- ✅ Clean, readable code structure
- ✅ Comprehensive error handling
- ✅ Edge case handling
- ✅ Vercel deployment readiness

## Technologies Used

- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Relational database
- **pg** - PostgreSQL client for Node.js
- **dotenv** - Environment variable management
- **cors** - Cross-origin resource sharing

## License

ISC

## Author

Created for coding assignment submission.

