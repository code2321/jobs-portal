# Abstract Workday-Style Recruiting Platform

A comprehensive MERN stack recruiting platform with multi-tenant architecture, candidate profiles, job postings, and application tracking.

## Features

- **Multi-tenant Architecture**: Companies can create branded job portals with custom subdomains
- **Authentication System**: JWT-based auth with refresh tokens for candidates and recruiters
- **Candidate Profiles**: Comprehensive profiles with visibility controls (Private/Sharable/Public)
- **Job Management**: Full CRUD operations for job postings with advanced filtering
- **Application System**: Apply with selected profile fields and track application status
- **Recruiter Dashboard**: Pipeline management with drag-and-drop candidate tracking

## Quick Start with Docker

1. **Clone and setup**:
   \`\`\`bash
   git clone <repository-url>
   cd recruiting-platform
   cp .env.example .env
   \`\`\`

2. **Update environment variables** in `.env`:
   - Change JWT secrets to secure random strings
   - Update MongoDB credentials if needed

3. **Start with Docker Compose**:
   \`\`\`bash
   docker-compose up -d
   \`\`\`

4. **Access the application**:
   - Main app: http://localhost:3000
   - MongoDB: localhost:27017

## Development Setup

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Start MongoDB** (if not using Docker):
   \`\`\`bash
   # Using Docker for MongoDB only
   docker run -d -p 27017:27017 --name mongodb \
     -e MONGO_INITDB_ROOT_USERNAME=admin \
     -e MONGO_INITDB_ROOT_PASSWORD=password123 \
     mongo:7.0
   \`\`\`

3. **Run development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### Tenants
- `POST /api/tenants` - Create tenant (recruiter only)
- `GET /api/tenants/by-slug/[slug]` - Get tenant by slug
- `PUT /api/tenants/[id]` - Update tenant

### Profiles
- `GET /api/me/profile` - Get current user's profile
- `PUT /api/me/profile` - Update current user's profile
- `GET /api/profiles/public` - Get public profiles

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `POST /api/tenants/[id]/jobs` - Create job (recruiter only)
- `PUT /api/jobs/[id]` - Update job
- `DELETE /api/jobs/[id]` - Delete job

### Applications
- `POST /api/jobs/[id]/apply` - Apply to job
- `GET /api/me/applications` - Get user's applications
- `GET /api/tenants/[id]/applications` - Get tenant's applications
- `PUT /api/applications/[id]` - Update application status

## User Roles

- **Candidate**: Create profiles, browse jobs, apply to positions, track applications
- **Recruiter**: Create company tenants, post jobs, manage applications, review candidates

## Technology Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with refresh tokens
- **Containerization**: Docker & Docker Compose

## Production Deployment

1. **Update environment variables** for production
2. **Build and deploy**:
   \`\`\`bash
   docker-compose -f docker-compose.prod.yml up -d
   \`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
