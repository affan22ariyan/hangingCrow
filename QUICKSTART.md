# Betting System - Quick Start Guide

## 🎉 System is Running!

Your complete betting system is fully operational with frontend and backend connected.

## 📊 System Status
- ✅ Backend API: http://localhost:3000
- ✅ Admin Dashboard: http://localhost:3001
- ✅ Swagger Docs: http://localhost:3000/api  
- ✅ PostgreSQL: localhost:5432
- ✅ Redis: localhost:6379

## 🔑 Test Credentials
- **Admin**: `admin` / `password123`
- **Test User**: `testuser` / `password123` (Balance: 10,000 BDT)

## 🚀 Quick Access

### Web Dashboard
1. Open http://localhost:3001 in your browser
2. Login with: `admin` / `password123`
3. View the admin dashboard

### API Testing via Swagger
1. Open http://localhost:3000/api
2. Click "Authorize" and enter your JWT token
3. Test all endpoints interactively

## 🧪 API Test (Command Line)

### 1. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"password\":\"password123\"}"
```

**Response**: Copy the `access_token` for next requests.

### 2. Place a Bet
```bash
curl -X POST http://localhost:3000/betting/place \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"marketId\":\"market123\",\"selectionId\":\"sel456\",\"odds\":2.5,\"stake\":100}"
```

## 📝 Database Access
```bash
# Connect to PostgreSQL
docker exec -it postgres psql -U postgres -d betting_db

# View users
SELECT username, role FROM "User";

# View wallets
SELECT * FROM "Wallet";

# View bets
SELECT * FROM "Bet";
```

## 🛑 Stop Services
```bash
# Stop backend (Ctrl+C in backend terminal)
# Stop admin (Ctrl+C in admin terminal)
# Stop containers
docker stop postgres redis
```

## 🔄 Restart Services
```bash
# Start containers
docker start postgres redis

# Start backend (Terminal 1)
cd apps/backend
npm run start:dev

# Start admin (Terminal 2)
cd apps/admin
npm run dev
```

## 🔗 Integration Points
- **Frontend → Backend**: Fetch API calls to http://localhost:3000
- **Backend → Database**: Prisma Client with PostgreSQL
- **Authentication**: JWT stored in localStorage
- **CORS**: Enabled for cross-origin requests

## 📚 Available Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /betting/place` - Place bet (requires auth)
- `POST /payment/deposit` - Deposit funds
- `POST /payment/webhook/:provider` - Payment webhook
- `POST /kyc/initiate` - Start KYC
- `POST /kyc/webhook` - KYC webhook

## 🎯 Next Steps
1. ✅ Test login flow in web dashboard
2. ✅ Test betting via Swagger UI
3. Configure payment provider webhooks
4. Set up commission rules
5. Build and test mobile app (Flutter)
6. Deploy to production environment

## 🐛 Troubleshooting

### Frontend can't connect to backend
- Check backend is running on port 3000
- Verify CORS is enabled in backend
- Check browser console for errors

### Database connection failed
- Ensure Docker containers are running: `docker ps`
- Restart containers if needed: `docker restart postgres redis`

### Authentication not working
- Clear browser localStorage
- Generate new JWT by logging in again
- Check token expiration (15 minutes)
