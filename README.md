# Abstract Workday-Style Recruiting Platform

A comprehensive MERN stack recruiting platform with multi-tenant architecture, candidate profiles, job postings, and application tracking.

## Features

- **Multi-tenant Architecture**: Companies can create branded job portals with custom subdomains
- **Authentication System**: JWT-based auth with refresh tokens for candidates and recruiters
- **Candidate Profiles**: Comprehensive profiles with visibility controls (Private/Sharable/Public)
- **Job Management**: Full CRUD operations for job postings with advanced filtering
- **Application System**: Apply with selected profile fields and track application status
- **Recruiter Dashboard**: Pipeline management with drag-and-drop candidate tracking

## Prerequisites

- Node.js 18+ and npm
- MongoDB 5.0+ (local installation or cloud service)
- Docker and Docker Compose (optional, for containerized setup)

## Environment Variables Setup

1. **Copy the environment template**:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. **Configure required environment variables** in `.env`:

   \`\`\`env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/recruiting-platform
   # For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/recruiting-platform

   # JWT Authentication Secrets (CHANGE THESE IN PRODUCTION!)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

   # Application Environment
   NODE_ENV=development
   \`\`\`

   **⚠️ Security Note**: Always use strong, unique secrets in production. Generate them using:
   \`\`\`bash
   # Generate secure random strings
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   \`\`\`

## Quick Start with Docker (Recommended)

1. **Clone and setup**:
   \`\`\`bash
   git clone <repository-url>
   cd recruiting-platform
   cp .env.example .env
   \`\`\`

2. **Update environment variables** in `.env` (see Environment Variables Setup above)

3. **Start with Docker Compose**:
   \`\`\`bash
   docker-compose up -d
   \`\`\`

4. **Initialize the database** (first time only):
   \`\`\`bash
   # The mongo-init.js script will automatically create indexes and setup
   docker-compose logs mongodb  # Check if initialization completed
   \`\`\`

5. **Access the application**:
   - Main app: http://localhost:3000
   - MongoDB: localhost:27017 (admin/password123)

## Manual Development Setup

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Setup MongoDB

**Option A: Local MongoDB Installation**
\`\`\`bash
# Install MongoDB Community Edition
# macOS with Homebrew:
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community

# Create database
mongosh
> use recruiting-platform
> db.createCollection("users")
\`\`\`

**Option B: MongoDB with Docker**
\`\`\`bash
docker run -d -p 27017:27017 --name mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -e MONGO_INITDB_DATABASE=recruiting-platform \
  mongo:7.0
\`\`\`

**Option C: MongoDB Atlas (Cloud)**
1. Create account at https://cloud.mongodb.com
2. Create a cluster and get connection string
3. Update `MONGODB_URI` in `.env` with your Atlas connection string

### 3. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

The application will be available at http://localhost:3000

## Project Structure

\`\`\`
recruiting-platform/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── jobs/                 # Job management endpoints
│   │   ├── applications/         # Application endpoints
│   │   └── tenants/              # Tenant management endpoints
│   ├── portal/[slug]/            # Tenant-specific job portals
│   ├── recruiter/                # Recruiter dashboard pages
│   └── page.jsx                  # Main application page
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   ├── jobs/                     # Job-related components
│   ├── profile/                  # Profile management components
│   └── recruiter/                # Recruiter dashboard components
├── lib/                          # Utility libraries
│   ├── models/                   # MongoDB models
│   ├── auth.js                   # JWT utilities
│   ├── mongodb.js                # Database connection
│   └── mock-data.js              # Preview mode mock data
├── scripts/                      # Database scripts
├── docker-compose.yml            # Docker configuration
└── Dockerfile                    # Container configuration
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `POST /api/auth/refresh` - Refresh JWT token

### Tenants (Company Management)
- `POST /api/tenants` - Create tenant (recruiter only)
- `GET /api/tenants/by-slug/[slug]` - Get tenant by slug
- `PUT /api/tenants/[id]` - Update tenant

### Candidate Profiles
- `GET /api/me/profile` - Get current user's profile
- `PUT /api/me/profile` - Update current user's profile
- `GET /api/profiles/public` - Get public profiles

### Job Management
- `GET /api/jobs` - Get all jobs (with filters)
- `POST /api/tenants/[id]/jobs` - Create job (recruiter only)
- `PUT /api/jobs/[id]` - Update job
- `DELETE /api/jobs/[id]` - Delete job

### Applications
- `POST /api/jobs/[id]/apply` - Apply to job
- `GET /api/me/applications` - Get user's applications
- `GET /api/tenants/[id]/applications` - Get tenant's applications
- `PUT /api/applications/[id]` - Update application status

## User Roles & Workflows

### Candidates
1. **Register** as a candidate
2. **Build Profile** with experience, education, skills
3. **Browse Jobs** on public feed or company portals
4. **Apply to Jobs** with selected profile sections
5. **Track Applications** through hiring pipeline

### Recruiters
1. **Register** as a recruiter
2. **Create Company Tenant** with branding
3. **Post Jobs** with detailed requirements
4. **Review Applications** and candidate profiles
5. **Manage Pipeline** (Applied → Review → Interview → Offer)

## Technology Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB 7.0 with native driver
- **Authentication**: JWT with refresh tokens, bcryptjs
- **Styling**: Tailwind CSS, shadcn/ui components
- **Containerization**: Docker & Docker Compose

## Production Deployment

### Environment Variables for Production
\`\`\`env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recruiting-platform
JWT_SECRET=<64-character-random-string>
JWT_REFRESH_SECRET=<64-character-random-string>
\`\`\`

### Docker Production Deployment
\`\`\`bash
# Build and deploy
docker-compose -f docker-compose.yml up -d --build

# Check logs
docker-compose logs -f app
\`\`\`

### Manual Production Deployment
\`\`\`bash
# Build the application
npm run build

# Start production server
npm start
\`\`\`

## Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
\`\`\`bash
# Check if MongoDB is running
docker ps  # For Docker setup
brew services list | grep mongodb  # For local macOS setup

# Check connection string format
# Local: mongodb://localhost:27017/recruiting-platform
# Atlas: mongodb+srv://username:password@cluster.mongodb.net/recruiting-platform
\`\`\`

**2. JWT Token Errors**
- Ensure `JWT_SECRET` and `JWT_REFRESH_SECRET` are set in `.env`
- Secrets should be at least 32 characters long
- Clear browser localStorage if tokens are corrupted

**3. Build Errors**
\`\`\`bash
# Clear Next.js cache
rm -rf .next
npm run build
\`\`\`

**4. Port Already in Use**
\`\`\`bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
\`\`\`

### Preview Mode (v0 Environment)
The application includes preview mode support for environments without MongoDB:
- Mock data is automatically used when MongoDB is unavailable
- All features work with sample data for demonstration
- No database setup required for preview

## Development Commands

\`\`\`bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Docker
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f app        # View app logs
docker-compose exec mongodb mongosh  # Access MongoDB shell
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with detailed description and error logs
