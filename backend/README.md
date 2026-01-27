# Backend for Christ Praises React Native App

This is the backend API server for the Christ Praises React Native application. It uses Node.js, Express, MySQL, and JWT for authentication.

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create a MySQL database:
```bash
mysql -u root -p < src/db/schema.sql
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and update the following:
- `DB_HOST`: Your MySQL host (default: localhost)
- `DB_USER`: Your MySQL username (default: root)
- `DB_PASSWORD`: Your MySQL password
- `DB_NAME`: Database name (default: christ_praises)
- `JWT_SECRET`: A secure random string for JWT signing
- `PORT`: Server port (default: 3000)

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication

#### Register
- **POST** `/auth/register`
- Body: `{ "name": "string", "email": "string", "password": "string" }`
- Returns: `{ "success": true, "data": { "token": "string", "user": {...} } }`

#### Login
- **POST** `/auth/login`
- Body: `{ "email": "string", "password": "string" }`
- Returns: `{ "success": true, "data": { "token": "string", "user": {...} } }`

### Protected Routes
For protected routes, include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Database Schema

### Users Table
- `id`: INT (Primary Key, Auto Increment)
- `name`: VARCHAR(255)
- `email`: VARCHAR(255) (Unique)
- `password`: VARCHAR(255) (Hashed with bcrypt)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP
