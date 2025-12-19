# Sports Booking Frontend

A modern React/Next.js frontend for the Sports Booking API.

## Features

- View all venues
- View all bookings with details
- View all transactions
- View all members
- Responsive design
- Real-time data fetching

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure API URL

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

For production, update to your Vercel API URL:
```env
NEXT_PUBLIC_API_URL=https://your-api.vercel.app
```

### 3. Run Development Server

```bash
npm run dev
```

The frontend will run on http://localhost:3001

### 4. Build for Production

```bash
npm run build
npm start
```

## Pages

- `/` - Main dashboard with tabs for venues, bookings, transactions, and members

## API Integration

The frontend connects to the backend API at the URL specified in `NEXT_PUBLIC_API_URL`.

Make sure your backend API is running before starting the frontend.

