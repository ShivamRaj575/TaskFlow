# Team Task Manager

A full-stack collaborative application where multiple users can manage tasks efficiently. Built with React (Frontend) and FastAPI (Backend) with PostgreSQL database.

## Features
- **User Authentication**: Secure signup and login with JWT.
- **Project Management**: Create projects, add members (Admin only).
- **Task Management**: Create tasks, assign them to team members, set due dates and priorities.
- **Role-Based Access Control**:
  - **Admin (Project Creator)**: Manage project details, add members, create tasks, and edit everything.
  - **Member**: View tasks and update status for tasks assigned to them.
- **Dashboard**: Track overall task statistics and progress.

## Tech Stack
- **Frontend**: React (Vite), Axios, React-Router-DOM, Lucide-React, custom premium UI styling with Vanilla CSS (Glassmorphism & Gradients).
- **Backend**: FastAPI, SQLAlchemy, Pydantic, Passlib, Python-JOSE.
- **Database**: PostgreSQL.

## Local Setup

### 1. Database Configuration
1. Ensure you have PostgreSQL installed and running locally.
2. Create a database named `taskmanager`.
3. If your PostgreSQL username/password is different from `postgres`/`postgres`, update the `DATABASE_URL` in `backend/database.py` or set it as an environment variable.

### 2. Backend Setup
Open a new terminal and run:
```bash
cd backend
# Create virtual environment (only first time)
python -m venv venv
# Activate virtual environment
venv\Scripts\activate
# Install all required dependencies
pip install fastapi uvicorn sqlalchemy psycopg2-binary passlib[bcrypt] python-jose[cryptography] pydantic-settings python-multipart email-validator
# Run backend server
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
Open a second terminal and run:
```bash
cd frontend
npm install
npm run dev
```

### 4. Open Application
Navigate to `http://localhost:5173` in your browser to view the application.

## Deployment (Railway)
- For the backend, create a `requirements.txt` and `Procfile`.
- For the frontend, connect the repository to Railway and it will automatically detect the static build. Ensure `API_URL` points to the deployed backend URL.
