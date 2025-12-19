# Student ID QR Code System

A full-stack application for managing student ID cards with QR code verification.

## Features

- Student management with QR code generation
- QR code verification system
- Admin authentication and authorization
- Audit logging for all verifications
- CSV export functionality

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your actual values:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A strong secret key for JWT tokens
   - Other configuration as needed

5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Security Notes

- Never commit `.env` files to version control
- Use strong JWT secrets in production
- Regularly rotate database credentials
- Enable MongoDB authentication in production

## API Endpoints

- `POST /api/auth/login` - Admin login
- `GET /api/students` - List students
- `POST /api/students` - Create student
- `PUT /api/students/:id/reissue` - Reissue QR code
- `GET /verify/:token` - Verify QR code
- `GET /api/logs` - Get verification logs

## Technologies Used

- **Backend**: Node.js, Express, MongoDB, JWT
- **Frontend**: React, Vite, Tailwind CSS
- **QR Code**: qrcode library
- **Authentication**: JWT with bcrypt