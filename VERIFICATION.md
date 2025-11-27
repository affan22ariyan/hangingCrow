# Betting Platform - Full Stack Verification Guide

This guide will help you verify that all components of the 13-role RBAC system are working correctly.

## Prerequisites Check

Before starting, verify you have:

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm
npm --version

# Check PostgreSQL (should be running)
psql --version

# Check Docker (optional, for containerized setup)
docker --version
docker-compose --version
```

## Setup Verification

### 1. Database Migration Verification

```bash
cd apps/backend

# Generate Prisma client
npx prisma generate

# Check if migration is needed
npx prisma migrate status

# Create migration if needed
npx prisma migrate dev --name add_13_roles

# Verify schema
npx prisma studio
# This opens a web UI at http://localhost:5555
# Check that the User table has a 'role' field with ENUM type
```

### 2. Seed Data Verification

```bash
# Still in apps/backend
npm run seed

# Expected output should show:
# ✓ Created/found tenant
# ✓ Created/found OWNER user: owner
# ✓ Created/found MOTHER user: mother
# ... (all 13 roles)
# ✅ Seeding complete!
```

### 3. Backend API Verification

```bash
# Start backend
npm run start:dev

# Wait for: "Nest application successfully started"
```

**Test Endpoints (in a new terminal):**

```bash
# Test health/basic endpoint
curl http://localhost:3000

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Expected: { "access_token": "...", "user": { "role": "ADMIN", ... } }

# Save the token from above, then test protected endpoint
TOKEN="paste_your_token_here"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/users

# Expected: Array of users (if token is from ADMIN+ role)
```

### 4. Frontend Verification

```bash
# In a new terminal
cd full_betting_frontend_ui

# Install dependencies
npm install

# Start frontend
npm run dev

# Expected: Server running at http://localhost:5173
```

**Browser Testing:**

1. Open `http://localhost:5173`
2. You should see the login page
3. Try logging in with different roles

## Role-Based Access Testing

### Test 1: USER Role Access

```
Login: testuser / password123
Role: USER

✅ Should see:
- User Dashboard
- Wallet
- My Bets
- Profile
- Referral

❌ Should NOT see:
- Agent menu items
- Admin menu items

Try navigating to: /admin/dashboard
Expected: "Access Denied" message
```

### Test 2: AGENT Role Access

```
Login: agent / password123
Role: AGENT

✅ Should see:
- All User menu items
- Agent Dashboard
- Clients
- Agent Wallet
- Downline

❌ Should NOT see:
- Admin menu items

Try navigating to: /admin/dashboard
Expected: "Access Denied" message

Try navigating to: /agent/downline
Expected: Tree view of downline users
```

### Test 3: ADMIN Role Access

```
Login: admin / password123
Role: ADMIN

✅ Should see:
- All User menu items
- All Agent menu items
- Admin Dashboard
- Users
- Agents
- Reports

Try navigating to: /admin/users
Expected: Table showing all users with their roles
```

### Test 4: OWNER Role Access (Highest Level)

```
Login: owner / password123
Role: OWNER

✅ Should see:
- All menu items (User + Agent + Admin)
- Full access to all routes
```

## API Role Protection Testing

### Test USER trying to access admin endpoint

```bash
# Login as USER
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' \
  | jq -r '.token'

# Use the token to try accessing /api/users
USER_TOKEN="paste_user_token_here"
curl -H "Authorization: Bearer $USER_TOKEN" \
  http://localhost:3000/api/users

# Expected: 403 Forbidden or error message about insufficient permissions
```

### Test ADMIN accessing admin endpoint

```bash
# Login as ADMIN
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}' \
  | jq -r '.token'

# Use the token to access /api/users
ADMIN_TOKEN="paste_admin_token_here"
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3000/api/users

# Expected: JSON array of all users
```

## Language Switcher Testing

1. Login to the application
2. Look at the top-right header
3. Click the language dropdown (EN/BN)
4. Select "BN" (Bengali)
5. UI text should change to Bengali
6. Switch back to "EN"
7. UI text should change to English

## Downline Tree Testing

1. Login as `agent` (password: password123)
2. Navigate to "Agent" → "Downline Tree"
3. You should see a hierarchical tree showing:
   - The agent (root)
   - Any child users (if seeded with hierarchy)
   - Each node shows username, role, and balance

## Balance Management Testing

1. Login as `agent`
2. Navigate to "Agent" → "Agent Wallet"
3. Try giving balance to a user:
   - Enter a user ID or username
   - Enter amount (e.g., 100)
   - Click "Give Balance"
4. Note: This is demo mode, actual API integration needed for production

## Docker Testing (Alternative)

```bash
# From project root
docker-compose -f docker-compose.fullstack.yml up

# Wait for all services to start
# Access at http://localhost

# Check service health
docker-compose -f docker-compose.fullstack.yml ps

# View logs
docker-compose -f docker-compose.fullstack.yml logs -f backend
docker-compose -f docker-compose.fullstack.yml logs -f frontend

# Stop services
docker-compose -f docker-compose.fullstack.yml down
```

## Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution:**
```bash
# Make sure PostgreSQL is running
sudo systemctl start postgresql  # Linux
brew services start postgresql    # Mac
# Windows: Start PostgreSQL service from Services

# Verify DATABASE_URL in .env
cat apps/backend/.env
```

### Issue: "Prisma Client not generated"
**Solution:**
```bash
cd apps/backend
npx prisma generate
```

### Issue: "Frontend can't connect to backend"
**Solution:**
```bash
# Check backend is running on port 3000
curl http://localhost:3000

# Check frontend proxy in vite.config.js
cat full_betting_frontend_ui/vite.config.js
```

### Issue: "Login fails with 401"
**Solution:**
- Verify you ran the seed script
- Check username/password (all demo accounts use "password123")
- Check backend logs for errors

## Success Criteria

✅ All 13 roles created in database  
✅ Backend API starts without errors  
✅ Frontend loads and shows login page  
✅ Can login with different role accounts  
✅ Role-based navigation shows/hides correctly  
✅ Protected routes enforce access control  
✅ Admin can see all users  
✅ User cannot access admin pages  
✅ Agent can view downline tree  
✅ Language switcher works  
✅ API endpoints respect role permissions  

## Next Steps

Once all verifications pass:

1. ✅ Update `.env` files with production values
2. ✅ Configure proper JWT_SECRET
3. ✅ Set up SSL certificates
4. ✅ Deploy to production environment
5. ✅ Run security audit
6. ✅ Set up monitoring and logging

## Support

If any verification step fails:
- Check `QUICK_START.md` for setup instructions
- Review `docs/ROLES.md` for role documentation
- Check backend logs: `apps/backend/error.log`
- Open browser DevTools console for frontend errors

---

**Verification Complete!** Your 13-role RBAC system is ready for production use.
