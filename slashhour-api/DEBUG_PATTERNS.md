# Debug Patterns & Solutions

This document contains common issues encountered during development and their proven solutions.

---

## NestJS + Prisma: "Cannot find module generated/prisma" Error

### Problem Description
Server compiles successfully with TypeScript (0 errors) but crashes at runtime with:
```
Error: Cannot find module '../../generated/prisma'
Require stack:
- /path/to/dist/src/prisma/prisma.service.js
```

### Symptoms
- ✅ TypeScript compilation succeeds
- ✅ Generated Prisma Client exists at `generated/prisma/`
- ❌ Server crashes immediately on startup
- ❌ Node.js cannot resolve the Prisma Client module from dist folder

### Root Cause
When Prisma schema uses a custom output path (e.g., `output = "../generated/prisma"`), the generated files are placed outside the `src` directory. NestJS's default build process only compiles TypeScript files and doesn't copy these external generated files to the `dist` folder.

The compiled code in `dist/src/prisma/prisma.service.js` tries to require `../../generated/prisma`, which resolves to `dist/generated/prisma` - but those files don't exist because they weren't copied during the build.

### Solution: Configure nest-cli.json for Asset Copying

Update `/nest-cli.json` to treat generated Prisma files as assets that should be copied during compilation:

**Before (Broken):**
```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

**After (Working):**
```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": false,
    "assets": [
      {
        "include": "../generated/prisma/**/*",
        "outDir": "dist/generated",
        "watchAssets": true
      }
    ],
    "watchAssets": true
  }
}
```

**Key Configuration Changes:**
1. `"deleteOutDir": false` - Prevents deleting generated files during rebuild
2. `"assets"` array - Specifies files to copy during compilation
3. `"include": "../generated/prisma/**/*"` - Source path (relative to src/)
4. `"outDir": "dist/generated"` - Destination in dist folder
5. `"watchAssets": true` - Auto-copy when files change (development mode)

### How to Apply the Fix

1. Update `nest-cli.json` with the configuration above
2. Kill all running NestJS processes:
   ```bash
   pkill -9 -f "nest start"
   ```
3. Clean dist and restart:
   ```bash
   rm -rf dist && npm run start:dev
   ```
4. Verify generated files are copied:
   ```bash
   ls -la dist/generated/prisma/
   ```

### Verification

After applying the fix, verify:

1. **Files are copied:**
   ```bash
   ls -la dist/generated/prisma/
   # Should show: index.d.ts, index.js, runtime/, etc.
   ```

2. **Server starts successfully:**
   ```
   [NestApplication] Nest application successfully started
   [PrismaService] Successfully connected to database via Prisma
   🚀 Slashhour API is running!
   ```

3. **Endpoints work:**
   ```bash
   curl http://localhost:3000/api/v1/
   # Should return: {"message":"Slashhour API v1","status":"ok"}
   ```

### Why This Solution Works

- **Automatic**: Files are copied during every build (dev and production)
- **Reliable**: Works with TypeScript watch mode and hot reload
- **Standard**: This is the established best practice in NestJS + Prisma ecosystem
- **No Manual Intervention**: No need to manually copy files or write custom scripts

### Related Issues

This solution addresses the same problem discussed in:
- Stack Overflow: "NestJS cannot find Prisma client after build"
- GitHub Issues: Prisma + NestJS module resolution problems
- NestJS Documentation: Assets configuration for external dependencies

### Date Encountered
October 24, 2025

### Related Files
- `/nest-cli.json` - Build configuration
- `/prisma/schema.prisma` - Prisma schema with custom output path
- `/src/prisma/prisma.service.ts` - Service that imports Prisma Client

---

## TypeORM to Prisma Migration: Field Name Mapping

### Problem Description
TypeScript compilation errors when migrating from TypeORM to Prisma due to field name case mismatch.

### Symptoms
```
error TS2322: Type 'string | undefined' is not assignable to type 'string'.
error TS2352: Conversion of type '{ ...; user_type: string; }' to type 'User' may be a mistake
Property 'userType' is missing in type '{ ...; user_type: string; }'
```

### Root Cause
- Database columns use `snake_case` (e.g., `user_type`)
- TypeScript entities expect `camelCase` (e.g., `userType`)
- Prisma returns data as-is from database (snake_case)
- TypeORM automatically converted field names to camelCase

### Solution: Add Transformation Helper Functions

Add a private transformation method in services that work with Prisma:

```typescript
/**
 * Transform Prisma user (snake_case) to User entity (camelCase)
 */
private transformPrismaUser(prismaUser: any): User {
  const { user_type, ...rest } = prismaUser;
  return {
    ...rest,
    userType: user_type,
  } as User;
}
```

Apply transformation to all methods that return User objects:

```typescript
async findById(id: string): Promise<User | null> {
  const prismaUser = await this.prisma.users.findUnique({
    where: { id },
  });
  return prismaUser ? this.transformPrismaUser(prismaUser) : null;
}
```

### Key Points
- Destructure snake_case fields separately
- Map them to camelCase in returned object
- Use `as User` type assertion for type safety
- Apply to ALL methods that return entity objects

---

## How to Use This File

When encountering similar issues:

1. Search this file for error messages or symptoms
2. Follow the documented solution step-by-step
3. Verify the fix using the provided verification steps
4. Add new patterns when discovering new solutions
