# Slashhour API Backend

Backend API for Slashhour - The Essential Deals Platform

## Tech Stack

- **Framework:** NestJS 11.x
- **Runtime:** Node.js 20 LTS
- **Database:** PostgreSQL 15 + PostGIS 3.3
- **ORM:** TypeORM 0.3
- **Authentication:** JWT + Passport
- **Language:** TypeScript 5.x

## Project Structure

```
src/
├── auth/               # Authentication module
├── users/              # User management
│   └── entities/
│       └── user.entity.ts
├── businesses/         # Business management
│   └── entities/
│       └── business.entity.ts
├── deals/              # Deal CRUD
│   └── entities/
│       └── deal.entity.ts
├── feed/               # Feed service (You Follow & Near You)
├── following/          # Follow system
├── categories/         # Essential categories
├── notifications/      # Push notifications
├── location/           # Location services
├── common/             # Shared utilities
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   └── filters/
├── config/             # Configuration
│   └── database.config.ts
├── app.module.ts
└── main.ts
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `DB_DATABASE` - Database name
- `JWT_SECRET` - Secret for JWT tokens

### 3. Database Setup

Make sure PostgreSQL with PostGIS extension is running:

```bash
# Install PostgreSQL and PostGIS
# macOS
brew install postgresql postgis

# Start PostgreSQL
brew services start postgresql

# Create database
createdb slashhour_dev

# Enable PostGIS extension
psql slashhour_dev -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

### 4. Run Development Server

```bash
npm run start:dev
```

The API will be available at: `http://localhost:3000/api/v1`

## Database Entities

### User
- Authentication and profile management
- Location preferences (lat/lng)
- Radius settings (2-10 km)
- Preferred categories
- Inflation tracking settings

### Business
- Business profiles
- 8 Essential categories:
  - 🍕 Restaurant
  - 🛒 Grocery
  - 👗 Fashion
  - 👟 Shoes
  - 📱 Electronics
  - 🏠 Home & Living
  - 💄 Beauty
  - ⚕️ Health
- Location (PostGIS point)
- Operating hours
- Subscription tiers

### Deal
- Time-sensitive offers
- Pricing and discount calculations
- Location visibility radius
- Inventory tracking
- Terms and conditions
- Status management

## API Endpoints (Planned)

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - Login
- `POST /auth/verify-otp` - OTP verification
- `POST /auth/refresh` - Refresh token

### Two-Tab Feed (Core Feature)
- `GET /feed/following` - "You Follow" tab
- `GET /feed/nearby` - "Near You" tab with radius
- `GET /feed/explore` - Explore by categories

### Following System
- `POST /businesses/:id/follow` - Follow business
- `DELETE /businesses/:id/follow` - Unfollow
- `GET /following` - List followed businesses

### Deals
- `POST /deals` - Create deal
- `GET /deals/:id` - Get deal details
- `PATCH /deals/:id` - Update deal
- `DELETE /deals/:id` - Delete deal

### Businesses
- `POST /businesses` - Create business
- `GET /businesses/:id` - Get business profile
- `PATCH /businesses/:id` - Update business

## Key Features

### Location-Based Queries
Uses PostGIS for efficient geospatial queries:
- Find deals within radius (2/3/5/10 km)
- Calculate distances
- Direction indicators
- Walking time estimates

### Real-Time Updates
- WebSocket support for live deal notifications
- Push notifications via Firebase

### Caching Strategy
- Redis for session management
- Feed caching (5 minutes)
- Business profiles (30 minutes)

## Development Commands

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod

# Testing
npm run test
npm run test:e2e
npm run test:cov

# Linting
npm run lint
npm run format
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 3000 |
| API_PREFIX | API prefix | api/v1 |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_USERNAME | Database user | postgres |
| DB_PASSWORD | Database password | postgres |
| DB_DATABASE | Database name | slashhour_dev |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRATION | JWT expiration | 15m |
| REDIS_HOST | Redis host | localhost |
| REDIS_PORT | Redis port | 6379 |

## Next Steps

1. ✅ ~~Initialize NestJS project~~
2. ✅ ~~Set up TypeORM configuration~~
3. ✅ ~~Create core entities (User, Business, Deal)~~
4. ⏳ Implement authentication module
5. ⏳ Build feed service APIs
6. ⏳ Add location services
7. ⏳ Implement following system
8. ⏳ Add push notifications

## Contributing

This is an MVP development project. Follow the user stories in `../slashhour storyline.md` for implementation guidance.

## License

Proprietary - Slashhour 2025
