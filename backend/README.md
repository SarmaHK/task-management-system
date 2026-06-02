# Task Management System - Backend

Phase 1 - Member 1 (Express Server Setup & Project Structure)

## Tech Stack
- Node.js
- Express.js
- TypeScript
- Docker

## Setup Instructions

### Installation
1. Clone the repository
2. Navigate to `backend` directory
3. Run `npm install`

### Running locally
1. Copy `.env.example` to `.env` and fill the variables
2. Run `npm run dev` to start the development server

### Running with Docker
1. Ensure Docker is running
2. Run `docker-compose up --build`

## Folder Structure
- `src/config/`: Configuration files (env, database)
- `src/controllers/`: Request handlers logic
- `src/middlewares/`: Express middlewares (error handling, etc.)
- `src/routes/`: Express route definitions
- `src/services/`: Business logic layer (future)
- `src/utils/`: Utility functions and classes
- `src/app.ts`: Express application setup
- `src/server.ts`: Server entry point
