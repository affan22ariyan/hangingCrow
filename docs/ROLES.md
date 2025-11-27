# Role-Based Access Control (RBAC) System

## Overview

This betting platform implements a comprehensive 13-role hierarchical access control system designed for multi-level operations.

## Role Hierarchy

The platform supports the following roles in order of authority (highest to lowest):

1. **OWNER** - Platform owner with complete control
2. **MOTHER** - Mother account with broad oversight
3. **WHITELABEL** - White label operator
4. **SUPERADMIN** - Super administrator
5. **ADMIN** - Administrator
6. **B2C_SUBADMIN** - B2C sub-administrator
7. **B2B_SUBADMIN** - B2B sub-administrator
8. **SENIOR_AFFILIATE** - Senior affiliate marketer
9. **AFFILIATE** - Affiliate marketer
10. **SUPER_AGENT** - Super agent
11. **MASTER_AGENT** - Master agent
12. **AGENT** - Agent
13. **USER** - End user (player)

## Permissions by Role

### Owner
- Complete platform access
- Can manage all roles
- Full financial control
- System configuration

### Mother
- Manages white labels and below
- Financial oversight
- User management
- Reports access

### Whitelabel
- Manages their brand instance
- Sub-admin management
- Brand-level reports
- Commission configuration

### Superadmin
- Platform-wide user management
- System monitoring
- Advanced reports
- Technical configuration

### Admin
- User and agent management
- Daily operations
- Standard reports
- Support functions

### B2C_SUBADMIN / B2B_SUBADMIN
- Segment-specific management
- User acquisition
- Segment reports
- Commission settings

### Senior Affiliate / Affiliate
- Marketing campaigns
- Referral tracking
- Commission viewing
- Marketing materials

### Super Agent / Master Agent
- Downline management
- Client acquisition
- Balance management
- Commission earnings

### Agent
- Client management
- Give/take balance
- Basic reports
- Client support

### User
- Place bets
- Deposit/withdraw
- View history
- Profile management

## API Endpoints and Required Roles

### Authentication
- `POST /api/auth/register` - Public
- `POST /api/auth/login` - Public

### User Management
- `GET /api/users` - ADMIN and above
- `GET /api/users/:id` - Own profile or ADMIN+
- `POST /api/users` - ADMIN and above (agents can create USER role only)
- `PUT /api/users/:id/balance` - AGENT and above

### Betting
- `POST /api/bet/place` - USER and above
- `GET /api/bets` - Own bets or ADMIN+

### Reports
- `GET /api/admin/dashboard` - ADMIN and above
- `GET /api/agent/stats` - AGENT and above

## Implementation

### Backend (NestJS)

The backend uses decorators and guards for role protection:

```typescript
@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  
  @Get()
  @Roles('OWNER', 'ADMIN', 'B2C_SUBADMIN')
  findAll() {
    // Only accessible by OWNER, ADMIN, or B2C_SUBADMIN
  }
}
```

### Frontend (React)

The frontend uses protected routes:

```jsx
<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN', 'OWNER']}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

## Hierarchy Rules

1. **Parent-Child Relationship**: Users created by an agent/admin become their children in the hierarchy
2. **Commission Flow**: Commissions flow upward through the hierarchy chain
3. **Access Control**: Higher roles can manage lower roles, but not vice versa
4. **Balance Management**: Agents can only manage balances of their downline users

## Database Schema

```sql
enum Role {
  OWNER
  MOTHER
  WHITELABEL
  SUPERADMIN
  ADMIN
  B2C_SUBADMIN
  B2B_SUBADMIN
  SENIOR_AFFILIATE
  AFFILIATE
  SUPER_AGENT
  MASTER_AGENT
  AGENT
  USER
}

model User {
  id       String
  username String @unique
  role     Role
  parentId String?  // Reference to parent in hierarchy
  parent   User?    @relation("UserHierarchy")
  children User[]   @relation("UserHierarchy")
}
```

## Adding New Roles

To add a new role:

1. Update `prisma/schema.prisma` to add the role to the enum
2. Run `npm run prisma:migrate`
3. Update the role hierarchy in `auth/guards/roles.guard.ts`
4. Add appropriate guards to controllers
5. Update frontend `ProtectedRoute` components
6. Add to seed script for testing

## Security Considerations

- Roles are verified on both frontend (UX) and backend (security)
- JWT tokens contain role information
- All API endpoints validate user role before processing
- Hierarchy relationships prevent unauthorized access
- Balance operations check parent-child relationships

## Testing

Use the provided seed script to create test accounts for all 13 roles:

```bash
npm run seed
```

This creates demo accounts with username = role name (lowercase) and password = "password123".
