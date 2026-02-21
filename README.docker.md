# Docker Setup for GreenGlow Cosmetics

## Prerequisites
- Docker installed on your system
- Docker Compose installed

## Building and Running with Docker

### Build and run all services
```bash
docker-compose up --build
```

### Run in detached mode (background)
```bash
docker-compose up -d
```

### Stop all services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

## Building Individual Images

### Backend
```bash
cd backend
docker build -t greenglow-backend .
docker run -p 4242:4242 --env-file .env greenglow-backend
```

### Frontend
```bash
cd frontend
docker build -t greenglow-frontend .
docker run -p 80:80 greenglow-frontend
```

## Access the Application

- Frontend: http://localhost
- Backend API: http://localhost:4242

## Environment Variables

Make sure to set up your environment variables in:
- `backend/.env` - Backend configuration (MongoDB URI, Stripe keys, etc.)
- `frontend/.env` - Frontend configuration (API URLs, Firebase config, etc.)

## Notes

- The frontend is built as a production build and served with Nginx
- The backend runs on Node.js
- Both services communicate through a Docker network
- Make sure your MongoDB connection string is accessible from within Docker
