# 🔍 Debugging Best Practices 2025
**TypeScript, NestJS & Next.js Production-Ready Debugging Guide**

---

## 🎯 TypeScript Debugging (2025 Modern Techniques)

### ✅ 1. Proper Source Maps Configuration

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "sourceMap": true,           // ✅ Enable source maps
    "inlineSources": true,       // ✅ Include source in maps
    "declaration": true,
    "declarationMap": true,      // ✅ For library debugging
    "removeComments": false      // Keep comments in debug builds
  }
}
```

**Why:** Source maps bridge TypeScript code and compiled JavaScript, allowing you to debug original TypeScript directly.

---

### ✅ 2. VS Code Debug Configuration

**.vscode/launch.json:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeArgs": ["-r", "ts-node/register", "-r", "tsconfig-paths/register"],
      "args": ["${workspaceFolder}/src/main.ts"],
      "cwd": "${workspaceFolder}",
      "protocol": "inspector",
      "sourceMaps": true,
      "envFile": "${workspaceFolder}/.env",
      "skipFiles": ["<node_internals>/**"],
      "console": "integratedTerminal"
    },
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to NestJS",
      "port": 9229,
      "restart": true,
      "sourceMaps": true,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

**Usage:**
```bash
# Run NestJS in debug mode
npm run start:debug

# Or manually
node --inspect-brk -r ts-node/register src/main.ts
```

---

### ✅ 3. Type Guards for Runtime Safety

**❌ BAD - Type assertions:**
```typescript
const user = data as User; // Unsafe! No runtime check
```

**✅ GOOD - Type guards (2025 standard):**
```typescript
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'email' in data &&
    typeof (data as any).id === 'string' &&
    typeof (data as any).email === 'string'
  );
}

// Usage
if (isUser(data)) {
  console.log(data.email); // ✅ Type-safe
} else {
  console.error('Invalid user data:', data);
}
```

**Our Implementation:** Already added in `slashhour-admin/lib/types.ts`

---

### ✅ 4. Conditional Breakpoints (Advanced)

**In VS Code:**
1. Right-click on breakpoint → Edit Breakpoint
2. Add condition:
   - `user.id === '123'` - Break when condition is true
   - `index === 99` - Break on specific iteration
   - `request.url.includes('/admin')` - Break on specific requests

**Logpoints (Non-breaking logs):**
```
Right-click → Logpoint
Message: User {user.email} logged in at {new Date().toISOString()}
```

---

### ✅ 5. Use `unknown` Over `any` (2025 Standard)

**❌ AVOID:**
```typescript
function processData(data: any) {
  return data.value; // No type safety!
}
```

**✅ PREFERRED:**
```typescript
function processData(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return String((data as { value: string }).value);
  }
  throw new Error('Invalid data structure');
}
```

---

## 🚀 NestJS Production Logging (2025 Best Practices)

### ✅ 1. Structured Logging with Pino (Recommended for 2025)

**Why Pino?**
- ⚡ 5x faster than Winston
- 📊 JSON-based (machine-readable)
- 🔥 Better for production
- 🎯 Built-in HTTP logging

**Installation:**
```bash
npm install nestjs-pino pino-http pino-pretty
```

**Configuration:**
```typescript
// app.module.ts
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport: process.env.NODE_ENV !== 'production' ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        } : undefined,
        serializers: {
          req: (req) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            query: req.query,
            params: req.params,
            // Don't log sensitive data
            headers: {
              host: req.headers.host,
              'user-agent': req.headers['user-agent'],
            },
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },
        // Auto-log all HTTP requests
        autoLogging: true,
      },
    }),
  ],
})
export class AppModule {}
```

**Usage in Controllers:**
```typescript
import { Logger } from '@nestjs/common';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Finding user ${id}`);

    try {
      const user = await this.usersService.findOne(id);
      return user;
    } catch (error) {
      this.logger.error(`Failed to find user ${id}`, error.stack);
      throw error;
    }
  }
}
```

---

### ✅ 2. Correlation IDs (Track Requests Across Services)

**Install:**
```bash
npm install nestjs-cls
```

**Setup:**
```typescript
// app.module.ts
import { ClsModule } from 'nestjs-cls';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: Request) =>
          req.headers['x-correlation-id'] || crypto.randomUUID(),
      },
    }),
  ],
})
export class AppModule {}

// middleware.ts
import { ClsService } from 'nestjs-cls';

export class LoggerMiddleware implements NestMiddleware {
  constructor(private cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = this.cls.getId();
    req['correlationId'] = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);
    next();
  }
}
```

**Log with correlation ID:**
```typescript
this.logger.log({
  msg: 'User created',
  correlationId: this.cls.getId(),
  userId: user.id,
});
```

---

### ✅ 3. Log Levels (Production vs Development)

**Development:**
- `verbose`, `debug`, `log`, `warn`, `error` - All enabled

**Production:**
- `log`, `warn`, `error` only - Minimize overhead

**Configure dynamically:**
```typescript
// main.ts
const logLevels = process.env.NODE_ENV === 'production'
  ? ['error', 'warn', 'log']
  : ['error', 'warn', 'log', 'debug', 'verbose'];

const app = await NestFactory.create(AppModule, {
  logger: logLevels,
});
```

---

### ✅ 4. Error Tracking with Sentry (2025 Standard)

**Already configured in our app!** ✅

**Enhancement - Add context:**
```typescript
import * as Sentry from '@sentry/node';

try {
  await this.dangerousOperation();
} catch (error) {
  Sentry.withScope((scope) => {
    scope.setTag('operation', 'dangerous');
    scope.setUser({ id: user.id, email: user.email });
    scope.setContext('additional', {
      dealId: deal.id,
      timestamp: new Date().toISOString(),
    });
    Sentry.captureException(error);
  });
  throw error;
}
```

---

### ✅ 5. OpenTelemetry (2025 Observability Standard)

**Why OpenTelemetry?**
- 🔍 Distributed tracing
- 📊 Metrics collection
- 📝 Log aggregation
- 🎯 Vendor-agnostic

**Installation:**
```bash
npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
npm install @opentelemetry/exporter-trace-otlp-http
```

**Setup:**
```typescript
// tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
});

sdk.start();
```

**main.ts:**
```typescript
import './tracing'; // ✅ Import before anything else
import { NestFactory } from '@nestjs/core';
```

**Auto-generated metrics:**
- Request rate
- Error rate
- Duration (latency)
- Database query analysis

---

## 📊 Production Monitoring Stack (2025)

### Recommended Tools:

1. **Logging:** Pino + Log aggregation (Elasticsearch/Loki)
2. **Tracing:** OpenTelemetry + SigNoz/Jaeger
3. **Errors:** Sentry ✅ (already implemented)
4. **Metrics:** Prometheus + Grafana
5. **APM:** New Relic / Datadog (optional)

---

## 🔧 Debugging Commands Reference

### Backend (NestJS)

```bash
# Debug mode with inspector
npm run start:debug

# Attach debugger (port 9229)
node --inspect=0.0.0.0:9229 dist/main

# Watch mode with debugging
npm run start:dev -- --debug

# Check TypeScript compilation
npx tsc --noEmit

# Prisma studio (database GUI)
npx prisma studio
```

### Frontend (Next.js)

```bash
# Development with Turbopack
npm run dev --turbo

# Debug in Chrome DevTools
# Open: chrome://inspect
# Click: "Open dedicated DevTools for Node"

# Check bundle size
npm run build
npx @next/bundle-analyzer

# Type checking
npx tsc --noEmit
```

---

## 🎯 Quick Debugging Checklist

### When Something Breaks:

**1. Check Logs:**
```bash
# Backend logs
tail -f logs/app.log

# Check specific error
grep "ERROR" logs/app.log | tail -20
```

**2. Verify Types:**
```typescript
// Add runtime checks
console.log('Data type:', typeof data);
console.log('Data structure:', JSON.stringify(data, null, 2));
```

**3. Use Type Guards:**
```typescript
if (!isValidUser(data)) {
  console.error('Invalid user data:', data);
  throw new Error('Type validation failed');
}
```

**4. Check Correlation ID:**
```typescript
// Track request across services
this.logger.log({
  correlationId: req.headers['x-correlation-id'],
  action: 'user_created',
  userId: user.id,
});
```

**5. Sentry Breadcrumbs:**
```typescript
Sentry.addBreadcrumb({
  message: 'About to create user',
  level: 'info',
  data: { email: user.email },
});
```

---

## 🚨 Common Issues & Solutions

### Issue: "Module not found"
**Solution:** Check import paths and tsconfig.json paths

### Issue: "Type 'X' is not assignable to type 'Y'"
**Solution:** Use type guards or proper type definitions

### Issue: "Cannot find module '@prisma/client'"
**Solution:** Run `npx prisma generate`

### Issue: Breakpoints not hitting
**Solution:** Ensure source maps are enabled in tsconfig.json

### Issue: Slow debugging
**Solution:** Use `skipFiles` in launch.json to skip node_modules

---

## 📚 2025 References

- [TypeScript Debugging - VS Code](https://code.visualstudio.com/docs/typescript/typescript-debugging)
- [NestJS Logging Best Practices](https://medium.com/@mohantaankit2002/best-practices-for-logging-and-monitoring-in-large-nestjs-applications)
- [OpenTelemetry NestJS Guide](https://signoz.io/blog/opentelemetry-nestjs/)
- [Pino Logger](https://github.com/pinojs/pino)
- [TypeScript Best Practices 2025](https://dev.to/sovannaro/typescript-best-practices-2025-elevate-your-code-quality-1gh3)

---

## ✅ Our Current Implementation Status

| Feature | Status | Location |
|---------|--------|----------|
| **Source Maps** | ✅ Enabled | tsconfig.json |
| **Sentry Error Tracking** | ✅ Implemented | Backend & Frontend |
| **Winston Logging** | ✅ Implemented | Backend |
| **Type Guards** | ✅ Implemented | Frontend types.ts |
| **Pino Logger** | ⚠️ Recommended | Can upgrade from Winston |
| **OpenTelemetry** | ❌ Not implemented | Optional for production |
| **Correlation IDs** | ❌ Not implemented | Recommended for production |

---

## 🎯 Next Steps for Production

1. **Immediate:** Keep current Winston + Sentry setup ✅
2. **Soon:** Add correlation IDs for request tracking
3. **Production:** Consider Pino for better performance
4. **Advanced:** Add OpenTelemetry for distributed tracing

Your debugging setup is **production-ready** with current best practices! 🎉
