# Visit Home Backend API

[![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)
[![Elysia](https://img.shields.io/badge/Elysia-FF6B35?style=for-the-badge&logo=elysia&logoColor=white)](https://elysiajs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

Backend API for Visit Home Management System - A comprehensive platform for managing home visits, student assessments, and educational administration.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Docker Deployment](#docker-deployment)
- [Development](#development)
- [Contributing](#contributing)

## 🎯 Overview

Visit Home Backend API is a robust educational management system built with modern web technologies. It provides comprehensive APIs for managing home visits, student assessments, class management, and administrative tasks for educational institutions.

### Key Capabilities
- **User Management**: Handle students, teachers, and administrators
- **Class Management**: Create and manage academic classes
- **Visit Management**: Schedule and track home visits
- **SDQ Assessment**: Strengths & Difficulties Questionnaire system
- **Authentication**: Secure JWT-based authentication with role-based access
- **File Upload**: Firebase Storage integration for document management

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with HTTP-only cookies
- Role-based access control (Admin, Teacher, Student)
- Secure session management
- Firebase integration for additional services

### 👥 User Management
- Complete CRUD operations for users
- Teacher and student profile management
- Admin role assignment and management
- User status tracking

### 🏫 Class Management
- Class creation and configuration
- Student assignment to classes
- Teacher-class relationships
- Academic year management

### 📅 Visit Scheduling
- Home visit scheduling system
- Visit status tracking
- Teacher-student-year relationship mapping
- Visit information management

### 📊 Assessment System
- SDQ (Strengths & Difficulties Questionnaire) implementation
- Student assessment tracking
- Progress monitoring

### 📤 File Management
- Firebase Storage integration
- Secure file upload endpoints
- Image and document handling

## 🛠️ Technology Stack

| Category             | Technology                                                                       |
| -------------------- | -------------------------------------------------------------------------------- |
| **Runtime**          | [Bun.js](https://bun.sh/) - Fast JavaScript runtime                              |
| **Framework**        | [Elysia.js](https://elysiajs.com/) - Fast and friendly web framework             |
| **Language**         | [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript             |
| **Database**         | [MongoDB](https://www.mongodb.com/) with [Mongoose ODM](https://mongoosejs.com/) |
| **Authentication**   | JWT + HTTP-only Cookies                                                          |
| **Validation**       | TypeBox schemas with Elysia                                                      |
| **Documentation**    | Swagger/OpenAPI integration                                                      |
| **Storage**          | Firebase Storage                                                                 |
| **Containerization** | Docker & Docker Compose                                                          |

## 📁 Project Structure

```
src/
├── index.ts                 # Application entry point & server setup
├── configs/
│   └── firebase.config.ts   # Firebase configuration
├── controllers/             # Business logic handlers
│   ├── auth_controller.ts   # Authentication logic
│   ├── class_controller.ts  # Class management
│   ├── schedule_controller.ts # Visit scheduling
│   ├── sdq_controller.ts    # SDQ assessments
│   ├── visit_info_controller.ts # Visit information
│   ├── year_controller.ts   # Academic year management
│   └── users/
│       ├── student_controller.ts # Student operations
│       ├── teacher_controller.ts # Teacher operations
│       └── user_controller.ts    # General user operations
├── models/                  # Database schemas & interfaces
│   ├── class_model.ts
│   ├── schedule_model.ts
│   ├── sdq_model.ts
│   ├── visit_info_model.ts
│   ├── year_model.ts
│   └── users/
│       ├── student_interface.ts
│       ├── student_model.ts
│       ├── teacher_model.ts
│       └── user_model.ts
├── routes/                  # API route definitions
│   ├── auth.route.ts
│   ├── class.route.ts
│   ├── schedule.route.ts
│   ├── sdq.route.ts
│   ├── user.route.ts
│   ├── visit-info.route.ts
│   └── year.route.ts
├── database/
│   └── db_setup.ts         # Database connection setup
├── swagger/
│   └── index.ts            # API documentation configuration
└── utils/
    ├── uploadImageToFirebase.ts # File upload utilities
    └── types/
        └── env.d.ts        # Environment type definitions
```

## 🚀 Installation

### Prerequisites
- [Bun.js](https://bun.sh/) (latest version)
- [MongoDB](https://www.mongodb.com/) (local or cloud instance)
- [Firebase Project](https://firebase.google.com/) (for storage services)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/PatiphatRattanosot/visit-home-backend.git
   cd visit-home-backend
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Environment configuration**
   ```bash
   # Linux / macOS command
   cp .env.example .env

   # Windows command
   copy .env.example .env

   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   bun run dev
   ```

The server will start on `http://localhost:3000/api`

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_URL=mongodb://localhost:27017/visit-home

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret

# Server Configuration
PORT=3000
NODE_ENV=dev 

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Firebase Configuration
FIREBASE_API_KEY="firebase-api-key"
FIREBASE_AUTH_DOMAIN="firebase-auth-domain"
FIREBASE_PROJECT_ID="firebase-project-id"
FIREBASE_STORAGE_BUCKET="firebase-storage-bucket"
FIREBASE_MESSAGING_SENDER_ID="firebase-messaging-sender-id"
FIREBASE_APP_ID="firebase-app-id"
```

### Database Setup

1. **MongoDB Local Installation**
   ```bash
   # macOS with Homebrew
   brew install mongodb-community
   brew services start mongodb-community

   # Ubuntu/Debian
   sudo apt-get install mongodb
   sudo systemctl start mongod

   # Windows - Download from MongoDB website
   ```

2. **MongoDB Cloud (Atlas)**
   - Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create cluster and get connection string
   - Update `DB_URL` in `.env`

## 📚 API Documentation

### Interactive Documentation
- **Swagger UI**: `http://localhost:3000/api/swagger`

### Main API Endpoints

#### Authentication
```http
POST   /api/sign              # User authentication
DELETE /api/sign              # User logout
```

#### User Management
```http
GET    /api/users             # Get all users
DELETE /api/users/:email      # Delete user by email
PATCH  /api/users/add/:email  # Add admin role
PATCH  /api/users/remove/:email # Remove admin role
```

#### Class Management
```http
POST   /api/classes           # Create new class
POST   /api/classes/by_teacher # Get classes by teacher
PUT    /api/classes/update    # Update class information
DELETE /api/classes/delete    # Delete class
```

#### Schedule Management
```http
POST   /api/schedule/create         # Create visit schedule
POST   /api/schedule/get_by_tc_stu_year # Get schedule by criteria
PUT    /api/schedule/update         # Update schedule
DELETE /api/schedule/delete         # Delete schedule
```

#### Academic Year Management
```http
POST   /api/years/create       # Create academic year
GET    /api/years             # Get all years
PUT    /api/years/update      # Update year
DELETE /api/years/delete      # Delete year
```

#### SDQ Assessment
```http
POST   /api/sdq/create        # Create SDQ assessment
GET    /api/sdq/:id          # Get SDQ by ID
PUT    /api/sdq/update       # Update SDQ
DELETE /api/sdq/delete       # Delete SDQ
```

#### Visit Information
```http
POST   /api/visit-info/create # Create visit information
GET    /api/visit-info        # Get visit information
PUT    /api/visit-info/update # Update visit info
DELETE /api/visit-info/delete # Delete visit info
```


## 🐳 Docker Deployment

### Development with Docker Compose

1. **Build and run services**
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f api
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

### Production Deployment

1. **Build production image**
   ```bash
   docker build -t visit-home-backend:latest .
   ```

2. **Run production container**
   ```bash
   docker run -d \
     --name visit-home-backend \
     -p 3000:3000 \
     --env-file .env \
     visit-home-backend:latest
   ```

## 💻 Development

### Available Scripts

```bash
# Development
bun run dev         # Start development server with hot reload
bun run build       # Build for production

### Code Style Guidelines

- Use TypeScript strict mode
- Follow ESLint configuration
- Use Prettier for code formatting
- Write descriptive commit messages
- Add JSDoc comments for complex functions

## 🔒 Security

### Implemented Security Measures
- JWT authentication with HTTP-only cookies
- CORS configuration for allowed origins
- Input validation and sanitization
- Secure headers configuration
- Environment variable protection

### Security Best Practices
- Regular dependency updates
- Secure secret management
- Database connection encryption
- Input validation on all endpoints

## 🤝 Contributing

### Contribution Guidelines

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run linting**
   ```bash
   bun run lint
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Review Process
- All changes require code review
- Follow conventional commit format
- Update documentation as needed

<!-- ## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. -->

## 👥 Team

- **Project Lead**: [Patiphat Rattanosot](https://github.com/PatiphatRattanosot)
- **Backend Developer**: Patiphat Rattanosot

## 📞 Support

For support and questions:
- **Issues**: [GitHub Issues](https://github.com/PatiphatRattanosot/visit-home-backend/issues)
<!-- - **Documentation**:  -->

## 🚀 Roadmap

### Current Version (v1.0)
- ✅ Core API functionality
- ✅ Authentication system
- ✅ User management
- ✅ Class management
- ✅ Academic year management
- ✅ SDQ assessment
- ✅ Visit scheduling

<!-- ### Upcoming Features -->


---

**Built with ❤️ using Bun, Elysia, and TypeScript**