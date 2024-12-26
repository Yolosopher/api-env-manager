# API Environment Manager

A robust NestJS-based API for managing environment variables across different projects and environments. Built with TypeScript, Prisma, and MongoDB.

## Features

- 🔐 Authentication with JWT, GitHub OAuth
- 👤 User management
- 📁 Project management
- 🌍 Environment management
- 🔑 API token support
- 📝 Variable management per environment
- 🔄 Pagination support
- ✨ Clean architecture with separation of concerns

## Tech Stack

- NestJS
- TypeScript
- Prisma ORM
- MongoDB
- Passport.js (JWT, GitHub strategies)
- Jest for testing
- Class Validator & Class Transformer

## Prerequisites

- Node.js (v14 or higher)
- MongoDB instance
- GitHub OAuth credentials (for GitHub authentication)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
PORT=3000
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN="30d"

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback

# Google OAuth (if implemented)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

## Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push
```

## Running the Application

```bash
# Development
npm run start:dev

# Production
npm run start:prod

# Debug mode
npm run start:debug
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## API Documentation

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with credentials
- `GET /auth/github` - GitHub OAuth login
- `GET /auth/github/callback` - GitHub OAuth callback
- `GET /auth/profile` - Get user profile (protected)

### Projects
- `GET /project` - List all projects
- `GET /project/:id` - Get project by ID
- `POST /project` - Create new project
- `DELETE /project/:id` - Delete project

### Environments
- `GET /environment/:projectId` - List environments for a project
- `GET /environment/single/:id` - Get environment by ID
- `POST /environment` - Create new environment
- `DELETE /environment/:id` - Delete environment

### API Tokens
- `GET /api-tokens` - List all API tokens
- `POST /api-tokens` - Create new API token
- `DELETE /api-tokens/:id` - Delete API token

## Project Structure

```
src/
├── auth/           # Authentication module
├── user/           # User management
├── project/        # Project management
├── environment/    # Environment management
├── api-token/      # API token management
├── prisma/         # Database configuration
└── utils/          # Shared utilities
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
