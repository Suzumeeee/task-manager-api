# Task Manager API

A RESTful API built with Node.js, Express, and MySQL featuring JWT authentication, bcrypt password hashing, and protected CRUD endpoints.

## Tech Stack
- Node.js
- Express.js
- MySQL
- JWT (JSON Web Tokens)
- bcrypt

## Features
- User registration and login with hashed passwords
- JWT-based authentication
- Create, read, update, and delete tasks
- User-scoped data (users can only access their own tasks)
- Input validation

## Getting Started

### Prerequisites
- Node.js installed
- MySQL installed and running

### Installation
1. Clone the repo
   git clone https://github.com/[your-username]/task-manager-api.git

2. Install dependencies
   npm install

3. Create a .env file (use .env.example as reference)
   cp .env.example .env

4. Update .env with your MySQL credentials and JWT secret

5. Create the database and tables in MySQL:
   CREATE DATABASE task_manager;
   USE task_manager;
   CREATE TABLE users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL
   );
   CREATE TABLE tasks (
     id INT AUTO_INCREMENT PRIMARY KEY,
     user_id INT NOT NULL,
     title VARCHAR(255) NOT NULL,
     description TEXT,
     status VARCHAR(50) DEFAULT 'pending',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (user_id) REFERENCES users(id)
   );

6. Run the development server
   npm run dev

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /register | Register a new user | No |
| POST | /login | Login and get token | No |
| GET | /tasks | Get all your tasks | Yes |
| POST | /tasks | Create a new task | Yes |
| PUT | /tasks/:id | Update a task | Yes |
| DELETE | /tasks/:id | Delete a task | Yes |

## Authentication
Protected endpoints require a JWT token in the Authorization header:
Authorization: Bearer your_token_here