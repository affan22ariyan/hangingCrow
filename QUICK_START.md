# Quick Start Guide - Full Stack Betting Platform

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 15+ installed and running
- Terminal/Command Prompt

## Step-by-Step Setup

### 1. Database Setup

First, make sure PostgreSQL is running. Then set up the database:

```bash
# Create a new database (if needed)
createdb betting_db

# Or run the init script
psql -U postgres -c "CREATE DATABASE betting_db;"
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd apps/backend

# Install dependencies
npm install

# Create .env file
echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/betting_db
JWT_SECRET=your-secret-key-change-this-in-production
PORT=3000" > .env

# Generate Prisma client with new 13-role schema
npx prisma generate

# Run database migration
npx prisma migrate dev --name add_13_roles

# Seed database with demo users for all 13 roles
npm run seed

# Start the backend
npm run start:dev
```

Backend should now be running at `http://localhost:3000`

### 3. Frontend Setup (in a new terminal)

```bash
# Navigate to frontend directory
cd full_betting_frontend_ui

# Install dependencies
npm install

# Start the frontend
npm run dev
```

Frontend should now be running at `http://localhost:5173`

### 4. Access the Application

Open your browser and go to: `http://localhost:5173`

### 5. Login with Demo Accounts

Try logging in with any of these accounts (password for all: **password123**):

**Admin Access:**
- Username: `admin` → Role: ADMIN
- Username: `owner` → Role: OWNER

**Agent Access:**
- Username: `agent` → Role: AGENT
- Username: `master_agent` → Role: MASTER_AGENT

**User Access:**
- Username: `testuser` → Role: USER

## Verify Role-Based Access

1. **Login as User** (`testuser/password123`)
   - You should see User Dashboard, Wallet, My Bets, Profile, Referral
   - Navigate to `/admin/dashboard` - you should see "Access Denied"

2. **Login as Agent** (`agent/password123`)
   - You should see both User and Agent sections in sidebar
   - Check Agent Dashboard, Clients, Wallet, Downline
   - Navigate to `/admin/dashboard` - you should see "Access Denied"

3. **Login as Admin** (`admin/password123`)
   - You should see User, Agent, AND Admin sections
   - Check Admin Dashboard, Users list, Agents, Reports
   - All routes should be accessible

## Common Issues

### Backend won't start
- Check if PostgreSQL is running: `psql -U postgres -c "SELECT 1;"`
- Verify DATABASE_URL in `.env` file
- Try running `npx prisma generate` again

### Frontend can't connect to backend
- Ensure backend is running on port 3000
- Check browser console for CORS errors
- Verify `vite.config.js` proxy settings

### Prisma errors
- Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Clear Prisma cache: `npx prisma generate --force`

## Docker Alternative

If you prefer Docker:

```bash
# From project root
docker-compose -f docker-compose.fullstack.yml up
```

This will start:
- PostgreSQL database
- NestJS backend
- React frontend
- Nginx reverse proxy

Access at `http://localhost`

## Next Steps

1. Explore different role dashboards
2. Test balance management (Agent → Give/Take balance)
3. View downline tree (Agent → Downline)
4. Manage users (Admin → Users)
5. Try language switcher (EN ↔ BN)

## Documentation

- Full role permissions: `docs/ROLES.md`
- Frontend docs: `full_betting_frontend_ui/README.md`
- API documentation: Check backend README

---

**Need Help?** Check the main README.md or contact support.
