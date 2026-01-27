# Christ Praises React Native App

A React Native (Expo) app with a MySQL-backed API for authentication and content management.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MySQL (v5.7 or higher)
- Expo CLI

## Project Structure

- `app/` - React Native app screens
- `backend/` - Node.js/Express API server
- `lib/` - Frontend services and utilities
- `components/` - Reusable React components
- `constants/` - App configuration and constants

## Setup Instructions

### 1. Backend Setup

#### Install MySQL and Create Database

```bash
# Install MySQL if not already installed
# On macOS: brew install mysql
# On Ubuntu: sudo apt-get install mysql-server

# Create the database
cd backend
mysql -u root -p < src/db/schema.sql
```

#### Configure Backend

```bash
cd backend
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secret
```

Update `.env` with your settings:
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=christ_praises
JWT_SECRET=your-secure-random-secret-key
JWT_EXPIRES_IN=7d
```

#### Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3000`

### 2. Frontend Setup

#### Install Dependencies

```bash
# From the root directory
npm install
```

#### Configure Frontend

```bash
# Copy environment file
cp .env.example .env
```

Update `.env` with your API URL:
```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

**Note:** For Android emulator, use `http://10.0.2.2:3000`  
For iOS simulator, use `http://localhost:3000`

#### Start the App

```bash
npx expo start
```

In the output, you'll find options to open the app in:
- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go)

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

## Development

This project uses [file-based routing](https://docs.expo.dev/router/introduction) with Expo Router.

You can start developing by editing the files inside the **app** directory.

## Database Schema

### Users Table
- `id`: INT (Primary Key, Auto Increment)
- `name`: VARCHAR(255)
- `email`: VARCHAR(255) (Unique)
- `password`: VARCHAR(255) (Hashed with bcrypt)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

## Security

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Tokens are stored securely using AsyncStorage
- All API requests include proper error handling

## Learn More

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/)
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/)

## Join the Community

- [Expo on GitHub](https://github.com/expo/expo)
- [Discord community](https://chat.expo.dev)

