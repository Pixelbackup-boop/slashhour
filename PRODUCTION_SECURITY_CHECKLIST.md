# Production Security Checklist for Slashhour

**Created**: October 2025
**Status**: Development Mode - Security features documented but NOT implemented
**Action Required Before Launch**: Complete all HIGH and CRITICAL priority items

---

## Table of Contents
1. [Critical Security Issues](#critical-security-issues)
2. [High Priority Security](#high-priority-security)
3. [Medium Priority Security](#medium-priority-security)
4. [Authentication & Authorization](#authentication--authorization)
5. [Data Protection](#data-protection)
6. [API Security](#api-security)
7. [Infrastructure Security](#infrastructure-security)
8. [Monitoring & Logging](#monitoring--logging)
9. [Implementation Guides](#implementation-guides)

---

## Critical Security Issues

### 1. Admin Guard for Sensitive Endpoints
**Status**: ⚠️ NOT IMPLEMENTED
**Risk Level**: CRITICAL
**Affected File**: `slashhour-api/src/notifications/notifications.controller.ts:114`

**Issue**:
```typescript
// Current: UNPROTECTED endpoint
@Post('send')
async sendNotification(@Body() dto: SendNotificationDto) {
  return this.notificationsService.sendNotification(dto);
}
```

**Solution**:
```typescript
// Protected with admin guard
@Post('send')
@UseGuards(JwtAuthGuard, AdminGuard)
async sendNotification(@Body() dto: SendNotificationDto) {
  return this.notificationsService.sendNotification(dto);
}
```

**Implementation Steps**:
1. Add `role` enum field to users table (ADMIN, BUSINESS, CONSUMER)
2. Create `AdminGuard` in `slashhour-api/src/common/guards/admin.guard.ts`
3. Apply guard to sensitive endpoints
4. Create admin user in database

**See**: [Admin Guard Implementation Guide](#admin-guard-implementation)

---

### 2. Rate Limiting
**Status**: ⚠️ NOT IMPLEMENTED
**Risk Level**: CRITICAL
**Impact**: API abuse, DDoS attacks, spam

**Solution**: Implement rate limiting on all endpoints
- Login: 5 attempts per 15 minutes
- Registration: 3 attempts per hour
- API calls: 100 requests per 15 minutes per user
- Public endpoints: 50 requests per 15 minutes per IP

**Implementation**:
```bash
npm install @nestjs/throttler
```

**See**: [Rate Limiting Implementation Guide](#rate-limiting-implementation)

---

### 3. CORS Configuration
**Status**: ⚠️ CURRENTLY SET TO `*` (ALLOW ALL)
**Risk Level**: CRITICAL
**Affected Files**:
- `slashhour-api/src/conversations/conversations.gateway.ts:21`
- Main API CORS settings

**Current**:
```typescript
cors: { origin: '*' }  // DANGEROUS IN PRODUCTION
```

**Production**:
```typescript
cors: {
  origin: [
    'https://slashhour.com',
    'https://www.slashhour.com',
    'https://admin.slashhour.com',
  ],
  credentials: true
}
```

---

### 4. Environment Variables Security
**Status**: ⚠️ SENSITIVE DATA IN ENV FILES
**Risk Level**: CRITICAL

**Current Issues**:
- Firebase credentials in `.env`
- Database passwords in `.env`
- JWT secrets in `.env`

**Production Requirements**:
1. Use environment-specific secrets management:
   - AWS Secrets Manager
   - HashiCorp Vault
   - Google Secret Manager
2. NEVER commit `.env` files
3. Rotate secrets regularly (JWT secret every 90 days)
4. Use different secrets for dev/staging/production

**Files to Check**:
- `.env` files
- `firebase-adminsdk-*.json` files
- `google-services.json`
- `credentials.json`

---

## High Priority Security

### 5. Password Security
**Status**: ✅ IMPLEMENTED (bcrypt with 10 rounds)
**Location**: `slashhour-api/src/auth/auth.service.ts`

**Current Implementation**:
```typescript
const hashedPassword = await bcrypt.hash(password, 10);
```

**Recommendations**:
- ✅ Using bcrypt (good)
- ⚠️ Consider increasing rounds to 12 for production
- ⚠️ Implement password complexity requirements
- ⚠️ Add password history (prevent reuse of last 5 passwords)

---

### 6. JWT Token Security
**Status**: ⚠️ NEEDS IMPROVEMENT
**Current**: 7-day expiration

**Production Requirements**:
1. **Short-lived access tokens**: 15 minutes (not 7 days!)
2. **Refresh tokens**: 30 days, stored securely
3. **Token blacklist**: For logout functionality
4. **Token rotation**: On refresh

**Implementation**:
```typescript
// Access token: 15 minutes
const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

// Refresh token: 30 days
const refreshToken = this.jwtService.sign(
  { sub: user.id, type: 'refresh' },
  { expiresIn: '30d' }
);
```

---

### 7. SQL Injection Protection
**Status**: ✅ PROTECTED (Using Prisma ORM)
**Note**: Prisma automatically prevents SQL injection

**Verify**: No raw SQL queries in codebase
```bash
# Search for raw SQL
grep -r "prisma.\$queryRaw" slashhour-api/src/
grep -r "prisma.\$executeRaw" slashhour-api/src/
```

---

### 8. XSS Protection
**Status**: ⚠️ NEEDS VALIDATION

**Required**:
1. Input sanitization on all user inputs
2. Install helmet.js for HTTP headers
3. Content Security Policy headers

**Implementation**:
```bash
npm install helmet
npm install class-validator class-transformer
```

```typescript
// main.ts
import helmet from 'helmet';
app.use(helmet());
```

---

### 9. File Upload Security
**Status**: ⚠️ BASIC VALIDATION ONLY
**Location**: `slashhour-api/src/upload/upload.service.ts`

**Current Issues**:
- No file size limits on server
- No virus scanning
- Files stored locally (not scalable)

**Production Requirements**:
1. **File size limits**: 5MB for images
2. **File type validation**: Only allow images (jpg, png, webp)
3. **Virus scanning**: ClamAV integration
4. **Cloud storage**: Move to AWS S3 or Cloudinary
5. **Image optimization**: Compress before serving

---

### 10. Firebase Admin SDK Credentials
**Status**: ⚠️ CREDENTIALS IN REPOSITORY
**Risk Level**: HIGH
**Files**:
- `slashhour-api/slashhour-eaf83-firebase-adminsdk-fbsvc-dc8dff50a8.json`
- `slashhour-eaf83-firebase-adminsdk-fbsvc-dc8dff50a8.json` (root)

**Action Required**:
1. **IMMEDIATELY**: Remove from git history
2. Regenerate Firebase service account key
3. Store in environment variables or secrets manager
4. Add to `.gitignore`

```bash
# Remove from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch slashhour-eaf83-firebase-adminsdk-*.json" \
  --prune-empty --tag-name-filter cat -- --all
```

---

## Medium Priority Security

### 11. User Enumeration Prevention
**Status**: ⚠️ VULNERABLE

**Issue**: Login/registration endpoints reveal if email exists

**Current**:
```typescript
throw new UnauthorizedException('Invalid credentials'); // Good
throw new BadRequestException('Email already exists'); // BAD - reveals email exists
```

**Solution**: Generic error messages
```typescript
// Don't reveal if email exists
throw new BadRequestException('Registration failed');
```

---

### 12. Business Verification
**Status**: ⚠️ NOT IMPLEMENTED

**Issue**: Any user can create a business account
**Risk**: Fake businesses, scams

**Solution**:
1. Add `verified` boolean to businesses table
2. Require manual admin approval
3. Add verification documents upload
4. Display verified badge on verified businesses

---

### 13. Deal Moderation
**Status**: ⚠️ NOT IMPLEMENTED

**Issue**: Deals go live immediately without review
**Risk**: Inappropriate content, scams

**Solution**:
1. Add `status` field (PENDING, APPROVED, REJECTED)
2. Deals start as PENDING
3. Admin approval required
4. Only show APPROVED deals to users

---

### 14. Report System
**Status**: ⚠️ NOT IMPLEMENTED

**Required**:
- Report users
- Report businesses
- Report deals
- Admin moderation queue

---

### 15. Email Verification
**Status**: ⚠️ NOT IMPLEMENTED

**Issue**: Users can register with any email
**Solution**: Send verification email on registration

---

### 16. Two-Factor Authentication (2FA)
**Status**: ⚠️ NOT IMPLEMENTED

**Recommendation**: Implement for business accounts
- SMS OTP
- Authenticator app (Google Authenticator)

---

## Authentication & Authorization

### Current Implementation
✅ JWT-based authentication
✅ Password hashing with bcrypt
✅ JWT guard for protected routes
⚠️ No refresh tokens
⚠️ No role-based access control
⚠️ No session management

### Required for Production

#### 1. Refresh Token Implementation
**Location**: `slashhour-api/src/auth/`

**Database Changes**:
```prisma
model users {
  // ... existing fields
  refresh_token String?
  refresh_token_expires_at DateTime?
}
```

**Endpoints Needed**:
- `POST /auth/refresh` - Get new access token
- `POST /auth/logout` - Invalidate refresh token

---

#### 2. Role-Based Access Control (RBAC)
**Status**: ⚠️ NOT IMPLEMENTED

**Database Changes**:
```prisma
enum UserRole {
  ADMIN
  BUSINESS_OWNER
  CONSUMER
}

model users {
  // ... existing fields
  role UserRole @default(CONSUMER)
}
```

**Guards Needed**:
- `AdminGuard` - Only admins
- `BusinessOwnerGuard` - Business owners only
- `RolesGuard` - Flexible role checking

---

#### 3. Session Management
**Requirements**:
- Track active sessions
- Force logout from all devices
- Session timeout after inactivity
- Concurrent session limits

---

## Data Protection

### 17. Personal Data Encryption
**Status**: ⚠️ NOT ENCRYPTED

**Sensitive Fields** (should be encrypted at rest):
- Phone numbers
- Email addresses (optional)
- Address information
- Payment information (if added)

**Solution**: Field-level encryption with AES-256

---

### 18. GDPR Compliance
**Status**: ⚠️ NOT IMPLEMENTED

**Required**:
1. Privacy Policy
2. Terms of Service
3. Data export functionality
4. Data deletion functionality (Right to be forgotten)
5. Cookie consent banner
6. Data processing agreements

---

### 19. Data Retention Policies
**Status**: ⚠️ NOT DEFINED

**Define policies for**:
- Deleted user data (soft delete vs hard delete)
- Old notifications (auto-delete after 90 days)
- Expired deals
- Chat history
- Analytics data

---

## API Security

### 20. API Versioning
**Status**: ✅ IMPLEMENTED (`/api/v1`)
**Good practice maintained**

---

### 21. Request Validation
**Status**: ⚠️ PARTIAL

**Current**: Using DTOs with class-validator
**Gaps**: Not all endpoints have validation

**Review needed**:
```bash
# Find endpoints without validation
grep -r "@Body()" slashhour-api/src/ | grep -v "dto:"
```

---

### 22. Response Data Sanitization
**Status**: ⚠️ NEEDS REVIEW

**Issue**: Exposing too much data in responses
**Example**: Returning password hash in user object (even though hashed)

**Solution**: Use DTOs for responses
```typescript
// Bad
return user;  // Returns all fields including sensitive data

// Good
return {
  id: user.id,
  username: user.username,
  email: user.email,
  // Only return what's needed
};
```

---

### 23. GraphQL Security (If Adding GraphQL)
**Status**: N/A (Not using GraphQL)
**Note**: If GraphQL added, implement query complexity limits

---

## Infrastructure Security

### 24. HTTPS Enforcement
**Status**: ⚠️ DEVELOPMENT (HTTP)
**Production**: MUST use HTTPS only

**Requirements**:
- SSL/TLS certificates (Let's Encrypt)
- Redirect HTTP to HTTPS
- HSTS headers
- Certificate pinning in mobile app

---

### 25. Database Security
**Status**: ⚠️ NEEDS HARDENING

**PostgreSQL Hardening**:
1. ✅ Using connection pooling (Prisma)
2. ⚠️ Database user permissions (check if too broad)
3. ⚠️ Network isolation (should be in private subnet)
4. ⚠️ Backup encryption
5. ⚠️ Audit logging

**Production Checklist**:
- [ ] Database in private subnet (no public access)
- [ ] Separate read replicas for analytics
- [ ] Automated backups (daily)
- [ ] Point-in-time recovery enabled
- [ ] Connection pooling configured
- [ ] Slow query logging enabled

---

### 26. Secrets Management
**Status**: ⚠️ USING .ENV FILES

**Production**: Use proper secrets manager
- AWS Secrets Manager
- Google Cloud Secret Manager
- HashiCorp Vault
- Azure Key Vault

---

### 27. Logging Security
**Status**: ⚠️ CONSOLE LOGS CLEANED, BUT NEEDS STRUCTURE

**Requirements**:
1. ✅ Removed sensitive data from logs (tokens, passwords)
2. ⚠️ Structured logging (use Winston or Pino)
3. ⚠️ Log aggregation (ELK, CloudWatch, Datadog)
4. ⚠️ Security event logging (failed logins, permission changes)
5. ⚠️ Log retention policy

---

### 28. Error Handling
**Status**: ⚠️ EXPOSING STACK TRACES IN DEV

**Production Requirements**:
```typescript
// main.ts
if (process.env.NODE_ENV === 'production') {
  app.useGlobalFilters(new ProductionExceptionFilter());
}

// Don't expose internal errors
catch (error) {
  // Log detailed error
  logger.error(error.stack);

  // Return generic message to user
  throw new InternalServerErrorException('An error occurred');
}
```

---

## Monitoring & Logging

### 29. Security Monitoring
**Status**: ⚠️ NOT IMPLEMENTED

**Required**:
1. Failed login attempt tracking
2. Unusual activity detection
3. API abuse detection
4. Unauthorized access attempts
5. Data breach detection

**Tools to Consider**:
- Sentry (already integrated for errors)
- AWS GuardDuty
- Datadog Security Monitoring

---

### 30. Audit Logs
**Status**: ⚠️ NOT IMPLEMENTED

**Track**:
- User actions (login, logout, registration)
- Admin actions (user bans, business approvals)
- Data modifications (who changed what, when)
- Permission changes
- Security events

**Database Table**:
```prisma
model audit_logs {
  id         String   @id @default(uuid())
  user_id    String?
  action     String
  resource   String
  details    Json?
  ip_address String?
  user_agent String?
  created_at DateTime @default(now())
}
```

---

## Mobile App Security

### 31. Certificate Pinning
**Status**: ⚠️ NOT IMPLEMENTED

**Risk**: Man-in-the-middle attacks
**Solution**: Pin SSL certificate in React Native app

---

### 32. Code Obfuscation
**Status**: ⚠️ NOT IMPLEMENTED

**Production**: Enable ProGuard (Android) and obfuscation
```javascript
// app.json
{
  "expo": {
    "android": {
      "proguardEnabled": true
    }
  }
}
```

---

### 33. Secure Storage
**Status**: ⚠️ NEEDS REVIEW

**Current**: AsyncStorage for tokens
**Production**: Use react-native-keychain for sensitive data

---

### 34. Root/Jailbreak Detection
**Status**: ⚠️ NOT IMPLEMENTED

**Recommendation**: Detect and warn on rooted/jailbroken devices
```bash
npm install react-native-root-detection
```

---

## Implementation Guides

### Admin Guard Implementation

#### Step 1: Update Database Schema
```prisma
// prisma/schema.prisma
enum UserRole {
  CONSUMER
  BUSINESS
  ADMIN
}

model users {
  // ... existing fields
  role UserRole @default(CONSUMER)
}
```

#### Step 2: Run Migration
```bash
cd slashhour-api
npx prisma migrate dev --name add_user_roles
```

#### Step 3: Create Admin Guard
```typescript
// src/common/guards/admin.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
```

#### Step 4: Apply to Endpoints
```typescript
// notifications.controller.ts
import { AdminGuard } from '../common/guards/admin.guard';

@Post('send')
@UseGuards(JwtAuthGuard, AdminGuard)  // Add AdminGuard
async sendNotification(@Body() dto: SendNotificationDto) {
  return this.notificationsService.sendNotification(dto);
}
```

#### Step 5: Create Admin User
```sql
-- Run in PostgreSQL
UPDATE users
SET role = 'ADMIN'
WHERE email = 'your-admin-email@example.com';
```

---

### Rate Limiting Implementation

#### Step 1: Install Package
```bash
cd slashhour-api
npm install @nestjs/throttler
```

#### Step 2: Configure Module
```typescript
// app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,      // Time window in seconds
      limit: 100,   // Max requests per window
    }),
    // ... other imports
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

#### Step 3: Custom Limits per Endpoint
```typescript
// auth.controller.ts
import { Throttle } from '@nestjs/throttler';

@Post('login')
@Throttle(5, 900)  // 5 requests per 15 minutes
async login(@Body() loginDto: LoginDto) {
  // ...
}

@Post('register')
@Throttle(3, 3600)  // 3 requests per hour
async register(@Body() registerDto: RegisterDto) {
  // ...
}
```

---

### Helmet.js Implementation

#### Step 1: Install
```bash
cd slashhour-api
npm install helmet
```

#### Step 2: Apply Middleware
```typescript
// main.ts
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  await app.listen(3000);
}
```

---

## Pre-Launch Checklist

### Critical (Must Complete)
- [ ] Admin guard implemented and tested
- [ ] Rate limiting enabled on all endpoints
- [ ] CORS restricted to production domains
- [ ] All secrets moved to secrets manager
- [ ] Firebase credentials removed from git
- [ ] HTTPS enforced everywhere
- [ ] Database in private subnet
- [ ] Backup strategy implemented

### High Priority
- [ ] Refresh tokens implemented
- [ ] Short-lived access tokens (15 min)
- [ ] Password complexity requirements
- [ ] Email verification
- [ ] Business verification system
- [ ] Deal moderation workflow
- [ ] Report system for users/businesses/deals

### Medium Priority
- [ ] 2FA for business accounts
- [ ] Audit logging
- [ ] GDPR compliance features
- [ ] Data retention policies defined
- [ ] Certificate pinning in mobile app
- [ ] Code obfuscation enabled

### Security Testing
- [ ] Penetration testing completed
- [ ] Security audit by third party
- [ ] Load testing with rate limits
- [ ] OWASP Top 10 vulnerabilities checked
- [ ] Dependency vulnerability scan (`npm audit`)

---

## Security Testing Commands

### Check for Vulnerabilities
```bash
# Backend
cd slashhour-api
npm audit
npm audit fix

# Frontend
cd slashhour-app
npm audit
npm audit fix
```

### Find Sensitive Data in Logs
```bash
# Search for potential sensitive data leaks
grep -r "password" slashhour-api/src/ | grep -i "log\|console"
grep -r "token" slashhour-api/src/ | grep -i "log\|console"
grep -r "secret" slashhour-api/src/ | grep -i "log\|console"
```

### Find Unprotected Endpoints
```bash
# Find endpoints without guards
cd slashhour-api
grep -r "@Post\|@Get\|@Put\|@Delete\|@Patch" src/ | grep -v "UseGuards"
```

---

## Incident Response Plan

### Data Breach Response
1. **Immediate**: Disable affected systems
2. **Investigate**: Determine scope of breach
3. **Notify**: Users, authorities (within 72 hours for GDPR)
4. **Remediate**: Fix vulnerability
5. **Monitor**: Watch for further attempts
6. **Document**: Full incident report

### Compromised Credentials
1. **Revoke**: All tokens immediately
2. **Force**: Password reset for affected users
3. **Rotate**: JWT secrets, API keys
4. **Audit**: All actions by compromised account
5. **Notify**: Affected users

---

## Security Contacts

### Report Security Issues
- **Email**: security@slashhour.com (set up before launch)
- **Bug Bounty**: Consider HackerOne or Bugcrowd

### External Security Review
Recommended before launch:
- Penetration testing firm
- Code security audit
- OWASP compliance check

---

## Regular Security Maintenance

### Daily
- Monitor failed login attempts
- Review error logs

### Weekly
- Review audit logs
- Check for unusual activity
- Review new user registrations

### Monthly
- Update dependencies (`npm audit fix`)
- Review access permissions
- Check SSL certificate expiration
- Review admin actions

### Quarterly
- Rotate secrets (JWT, API keys)
- Security training for team
- Review and update security policies
- Penetration testing

### Annually
- Full security audit
- Update privacy policy/terms
- Review data retention policies
- Disaster recovery drill

---

## Additional Resources

### Security Standards
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- OWASP Mobile Top 10: https://owasp.org/www-project-mobile-top-10/
- CWE Top 25: https://cwe.mitre.org/top25/

### Tools
- Snyk: Dependency vulnerability scanning
- SonarQube: Code quality and security
- Burp Suite: API security testing
- OWASP ZAP: Security testing

### Compliance
- GDPR: https://gdpr.eu/
- CCPA: https://oag.ca.gov/privacy/ccpa
- PCI DSS: If accepting payments

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Oct 2025 | Initial security checklist | Claude Code |

---

## Notes

**This document should be updated regularly** as new security features are implemented or new vulnerabilities are discovered.

**Before Production Launch**: Have this document reviewed by a security professional and conduct a full security audit.

**Regular Reviews**: Update this checklist quarterly or when major features are added.
