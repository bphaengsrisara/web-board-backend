# Web Board Backend

A backend service for the Web Board application, providing REST APIs for managing posts, comments, and user interactions. Built with NestJS and Prisma, this application offers a robust and scalable solution for web forum functionality.

## Features

- User authentication and authorization
- CRUD operations for posts and comments
- Topic categorization for posts
- Search functionality for posts (title and content)
- Automatic post timestamp updates on comment activities

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) - A progressive Node.js framework
- **Database**: SQLite with [Prisma](https://www.prisma.io/) ORM
- **Authentication**: JWT-based with [@nestjs/passport](https://docs.nestjs.com/security/authentication)
- **API Documentation**: [Swagger/OpenAPI](https://swagger.io/) via @nestjs/swagger
- **Testing**: Jest and Supertest
- **Validation**: class-validator and class-transformer
- **Code Quality**: ESLint and Prettier

## Prerequisites

- Node.js (v20 or higher)
- yarn package manager
- SQLite (created during migration)

## Installation and Setup

1. Clone the repository:

```bash
git clone https://github.com/bphaengsrisara/web-board-backend.git
cd web-board-backend
```

2. Install dependencies:

```bash
yarn
```

3. Set up environment variables:
   - set your environment variables in the `.env` file or use default values
   - Configure the following variables:

```env
PORT=8000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secure-jwt-secret"
```

4. Initialize the database:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed the database
yarn seed
```

## Running the Application

### Development Mode

```bash
# Start the development server with hot-reload
yarn start:dev

# Access Swagger documentation at http://localhost:8000/api/docs
```

### Production Mode

```bash
# Build the application
yarn build

# Start the production server
yarn start:prod
```

## Testing

```bash
# Run unit tests
yarn test

# Run tests in watch mode
yarn test:watch

# Generate test coverage report
yarn test:cov
```

## Project Structure

```
web-board-backend/
├── src/                    # Source code
│   ├── modules/           # Feature modules
│   │   ├── auth/         # Authentication
│   │   ├── users/        # User management
│   │   ├── posts/        # Post management
│   │   ├── comments/     # Comment management
│   │   └── topics/       # Topic management
│   ├── prisma/           # Prisma service and client
│   ├── interfaces/       # TypeScript interfaces
│   ├── app.module.ts     # Root application module
│   └── main.ts          # Application entry point
├── prisma/               # Database configuration
│   ├── migrations/      # Database migrations
│   ├── schema.prisma    # Prisma schema
│   └── seed.ts         # Database seeding
├── test/                # End-to-end tests
├── node_modules/        # Dependencies
├── package.json        # Project metadata and dependencies
├── tsconfig.json      # TypeScript configuration
├── .env              # Environment variables
├── .eslintrc.js     # ESLint configuration
└── .prettierrc      # Prettier configuration
```

## API Documentation

When running in development mode, access the Swagger documentation at:

```
http://localhost:8000/api/docs
```

### Key Endpoints

#### Authentication

- POST `/auth/sign-in` - User sign in
- POST `/auth/sign-out` - User sign out

#### Posts

- GET `/posts` - Get all posts (supports search and topic filtering)
- GET `/posts/my-posts` - Get posts by authenticated user
- POST `/posts` - Create a new post
- PATCH `/posts/:id` - Update a post
- DELETE `/posts/:id` - Delete a post

#### Topics

- GET `/topics` - Get all topics

#### Comments

- GET `/posts/:id/comments` - Get comments for a post
- POST `/posts/:id/comments` - Add a comment to a post
- PATCH `/comments/:id` - Update a comment
- DELETE `/comments/:id` - Delete a comment

## Architecture Overview

The application follows NestJS's modular architecture:

- **Controllers**: Handle HTTP requests and define API endpoints
- **Services**: Implement business logic and database operations
- **DTOs**: Define data transfer objects for request/response validation
- **Guards**: Implement authentication and authorization
- **Modules**: Organize related components and define dependencies

Key architectural decisions:

- Use of Prisma transactions for data consistency
- JWT-based stateless authentication
- Automatic post timestamp updates on comment modifications
- Environment-based Swagger documentation
- Comprehensive error handling and validation

## Feedback

We value your input! If you have any questions, suggestions, or feedback about this project, please feel free to reach out to us at bovonrajt.p@gmail.com. Your insights are crucial in helping us improve and enhance the Web Board Backend.
