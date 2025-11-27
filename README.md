# Full-Stack Betting Platform with 13-Role RBAC

Production-ready betting platform with comprehensive role-based access control system, modern React frontend, NestJS backend, and PostgreSQL database.

## 🎯 Features

- ✅ **13-Role Hierarchical RBAC**: Owner, Mother, Whitelabel, Superadmin, Admin, B2C/B2B Subadmin, Affiliates, Agents, and Users
- ✅ **Full-Stack Architecture**: React + NestJS + PostgreSQL
- ✅ **Role-Based Dashboards**: Separate UIs for Users, Agents, and Admins
- ✅ **Multi-Language Support**: English and Bengali (বাংলা)
- ✅ **Modern Dark Theme**: Premium UI with smooth animations
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **Wallet System**: Deposit, withdraw, balance management
- ✅ **Commission System**: Multi-level commission distribution
- ✅ **Downline Management**: Hierarchical user tree visualization
- ✅ **Docker Ready**: Full containerization support

## 📋 Supported Roles

| Role | Access Level | Description |
|------|-------------|-------------|
| OWNER | 1 | Platform owner with complete control |
| MOTHER | 2 | Mother account with broad oversight |
| WHITELABEL | 3 | White label operator |
| SUPERADMIN | 4 | Super administrator |
| ADMIN | 5 | Administrator |
| B2C_SUBADMIN | 6 | B2C sub-administrator |
| B2B_SUBADMIN | 7 | B2B sub-administrator |
| SENIOR_AFFILIATE | 8 | Senior affiliate marketer |
| AFFILIATE | 9 | Affiliate marketer |
| SUPER_AGENT | 10 | Super agent |
| MASTER_AGENT | 11 | Master agent |
| AGENT | 12 | Agent |
| USER | 13 | End user (player) |

See [docs/ROLES.md](./docs/ROLES.md) for detailed role permissions.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
docker-compose up -d
```

This will spin up:
- Postgres (DB)
- Redis (Cache/Queue)
- Backend API (http://localhost:3000)
- Admin Dashboard (http://localhost:3001)

### Development
To run services individually:

```bash
# Backend
cd apps/backend
npm run start:dev

# Admin
cd apps/admin
npm run dev

# Mobile
cd apps/mobile
flutter run
```

## Documentation
- [OpenAPI Spec](./openapi.yaml)
- [ADRs](./docs/adr)
