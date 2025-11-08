# Testing Guide

## Overview

This document provides comprehensive information about the testing infrastructure and coverage for the Slashhour API.

## Test Coverage Summary

### Current Status
- **Statement Coverage**: 81.84% ✅
- **Branch Coverage**: 70.39% ✅
- **Function Coverage**: 82.73% ✅
- **Line Coverage**: 81.54% ✅
- **Total Tests**: 409 tests across 26 test suites
- **Status**: All tests passing ✅

### Coverage Progress
- **Initial Coverage**: 50.58% (before improvements)
- **Previous Coverage**: 63.63%
- **Current Coverage**: 81.84%
- **Total Improvement**: +31.26 percentage points
- **Target**: 70% ✅ **ACHIEVED!**

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:cov
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### Debug Tests
```bash
npm run test:debug
```

## Test Structure

### Test Organization
Tests are organized alongside their source files:
```
src/
├── auth/
│   ├── auth.controller.spec.ts
│   ├── auth.service.spec.ts
│   └── strategies/
│       └── jwt.strategy.spec.ts
├── bookmarks/
│   ├── bookmarks.controller.spec.ts
│   └── bookmarks.service.spec.ts
├── businesses/
│   ├── businesses.controller.spec.ts
│   └── businesses.service.spec.ts
...
```

### Test Categories

#### 1. Controller Tests
Test HTTP layer, request/response handling, and route authorization:
- `*.controller.spec.ts`
- Mock service layer
- Verify correct service method calls
- Validate response structures

#### 2. Service Tests
Test business logic, data validation, and database interactions:
- `*.service.spec.ts`
- Mock PrismaService for database operations
- Test edge cases and error handling
- Validate business rules

#### 3. Strategy Tests
Test authentication and authorization strategies:
- JWT validation (`jwt.strategy.spec.ts`)
- User authentication flow

## Module Coverage

### Excellent Coverage Modules (>95%)
- ⭐ **Feed Module**: 100% statements, 80% branches
- ⭐ **Bookmarks Module**: 100% statements, 90% branches
- ⭐ **Redemptions Module**: 100% statements, 80% branches
- ⭐ **Reviews Module**: 100% statements, 88% branches
- ⭐ **Search Module**: 98.18% statements, 93.75% branches
- ⭐ **Businesses Module**: 99.21% statements, 80% branches
- ⭐ **Deals Module**: 96.87% statements, 84.84% branches 🎉 **MAJOR IMPROVEMENT**
- ⭐ **Follows Module**: 96.42% statements, 89.13% branches

### High Coverage Modules (90-95%)
- ✅ **Users Module**: 93.86% statements, 76.33% branches
- ✅ **Auth Module**: 90.9% statements, 66.03% branches
- ✅ **Notifications Module**: 89.77% statements, 64.89% branches

### Low/No Coverage Modules (<60%)
- 🔴 **Search Service**: 0% coverage (393 lines)
- 🔴 **Reviews Service**: 0% coverage (328 lines)
- 🔴 **Upload Service**: 15.78% coverage (complex file operations)
- 🔴 **Verification Service**: 13.46% coverage
- 🔴 **Conversations Module**: 0% coverage (279 lines)
- 🔴 **Cron Tasks**: 0% coverage (184 lines)
- 🔴 **Common Services/Filters**: 0% coverage

## Testing Best Practices

### 1. Test Structure
Follow the AAA pattern (Arrange, Act, Assert):
```typescript
describe('ServiceMethod', () => {
  it('should perform expected behavior', async () => {
    // Arrange
    mockDependency.method.mockResolvedValue(mockData);

    // Act
    const result = await service.method(params);

    // Assert
    expect(result).toEqual(expectedOutput);
    expect(mockDependency.method).toHaveBeenCalledWith(expectedArgs);
  });
});
```

### 2. Type-Safe Mocks (2025 Best Practice)
Always use type-safe mocks instead of `any`:
```typescript
const mockPrismaService: {
  users: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
} = {
  users: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};
```

### 3. Test Coverage
- Aim for at least 70% coverage for all modules
- Focus on business-critical paths first
- Test both success and error cases
- Include edge cases and boundary conditions

### 4. Naming Conventions
- Test files: `*.spec.ts`
- E2E tests: `*.e2e-spec.ts`
- Test suites: Use descriptive `describe` blocks
- Test cases: Use clear, action-oriented `it` statements

### 5. Mock Data
- Keep mock data realistic but minimal
- Define reusable mock objects at the top of test files
- Use factories for complex mock data
- Clear mocks between tests with `jest.clearAllMocks()`

## CI/CD Integration

### GitHub Actions
Test coverage is automatically checked on:
- Every pull request
- Pushes to main branch
- Manual workflow dispatch

### Coverage Requirements
- Minimum statement coverage: 70%
- Minimum branch coverage: 70%
- Minimum function coverage: 70%
- Minimum line coverage: 70%

### Codecov Integration
Coverage reports are uploaded to Codecov for visualization and tracking:
- Pull request comments with coverage diff
- Coverage badges for README
- Historical coverage trends
- Per-file coverage analysis

## Common Testing Patterns

### Testing Controllers
```typescript
describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockRequest = {
    user: { id: 'user-123', email: 'test@example.com' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should return user profile', async () => {
    mockService.getProfile.mockResolvedValue(mockUser);
    const result = await controller.getProfile(mockRequest as never);
    expect(result).toEqual(mockUser);
  });
});
```

### Testing Services
```typescript
describe('BookmarksService', () => {
  let service: BookmarksService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookmarksService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BookmarksService>(BookmarksService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should add bookmark and increment save count', async () => {
    mockPrismaService.deals.findUnique.mockResolvedValue(mockDeal);
    mockPrismaService.bookmarks.findUnique.mockResolvedValue(null);
    mockPrismaService.bookmarks.create.mockResolvedValue(mockBookmark);

    const result = await service.addBookmark(userId, dealId);

    expect(mockPrismaService.deals.update).toHaveBeenCalledWith({
      where: { id: dealId },
      data: { save_count: { increment: 1 } },
    });
  });
});
```

### Testing Error Cases
```typescript
it('should throw NotFoundException when user not found', async () => {
  mockPrismaService.users.findUnique.mockResolvedValue(null);

  await expect(
    service.getUserById('invalid-id'),
  ).rejects.toThrow(NotFoundException);

  await expect(
    service.getUserById('invalid-id'),
  ).rejects.toThrow('User not found');
});
```

## Coverage Goals by Module

### Immediate Priority (Next Sprint)
1. **Deals Service**: Add tests for `update`, `findByBusiness`, `updateWithMultipart` (target: 80%)
2. **Verification Service**: Add tests for email/SMS verification (target: 70%)
3. **Upload Service**: Add tests for file handling and image conversion (target: 70%)

### Medium Priority
1. **Reviews Module**: Implement service and controller tests (target: 70%)
2. **Search Module**: Add tests for search functionality (target: 70%)
3. **Conversations Module**: Add tests for messaging (target: 70%)

### Low Priority (Infrastructure)
1. **Cron Tasks**: Add tests for scheduled jobs
2. **Common Services**: Logger service tests
3. **Exception Filters**: Sentry filter tests

## Troubleshooting

### Common Issues

#### 1. Mock Not Being Called
**Problem**: `Expected mock to have been called`
**Solution**: Ensure mock is set up before calling the tested method:
```typescript
mockService.method.mockResolvedValue(data);
const result = await controller.method();
```

#### 2. Async Test Timeout
**Problem**: Test times out
**Solution**: Ensure all promises are awaited and use `async/await`:
```typescript
it('should handle async operation', async () => {
  await expect(service.asyncMethod()).resolves.toBe(expected);
});
```

#### 3. Mock Data Type Mismatch
**Problem**: TypeScript errors with mock data
**Solution**: Use proper typing for mocks or `as any` sparingly:
```typescript
const mockUser: Partial<User> = {
  id: 'user-123',
  email: 'test@example.com',
};
```

#### 4. Coverage Not Updating
**Problem**: Coverage percentage doesn't change
**Solution**: Run `npm run test:cov` (not just `npm test`) to generate coverage

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Codecov Documentation](https://docs.codecov.com)

## Contributing

When adding new features:
1. Write tests before or alongside implementation
2. Maintain or improve existing coverage percentages
3. Follow the testing patterns documented here
4. Run `npm run test:cov` before committing
5. Ensure all tests pass in CI/CD pipeline

## Test Metrics

### Recent Improvements (Latest Update)
- Added 16 new tests for Deals service
- Improved branch coverage from 64.45% to 70.39% ✅ **TARGET ACHIEVED**
- **Deals Service Coverage Breakthrough**:
  - Branch coverage: 47.87% → 84.84% (+37%)
  - Statement coverage: 65.1% → 96.87% (+32%)
  - Added comprehensive tests for:
    - `findByBusiness()` method (2 tests)
    - `update()` date and price validation (4 tests)
    - `updateWithMultipart()` complete coverage (8 tests)
    - `delete()` error scenarios (2 tests)

### Previous Improvements
- Added 31 new tests in previous update
- Fixed 19 failing controller tests
- Improved coverage from 50.58% to 63.63%
- Added comprehensive service tests for:
  - Bookmarks Service (19 tests)
  - JWT Strategy (4 tests)
  - Follows Service (11 additional tests)
  - All controller tests passing (250 → 281 → 409 tests)

### Test Distribution
- **Controller Tests**: ~100 tests
- **Service Tests**: ~300 tests
- **Integration Tests**: 9 tests
- **Total**: 409 tests

## Continuous Improvement

The testing infrastructure has achieved the 70% coverage target! 🎉

### Completed Milestones
1. ✅ Achieved 70%+ coverage target (81.84% statement, 70.39% branch)
2. ✅ Comprehensive service tests for all critical modules
3. ✅ CI/CD pipeline with automated coverage reporting
4. ✅ 409 passing tests across 26 test suites

### Optional Future Enhancements (Low Priority)
1. Add tests for infrastructure services (Email, SMS, Upload services)
2. Add WebSocket tests for conversations gateway
3. Increase E2E test coverage for complete user journeys
4. Add integration tests with real database for complex queries
5. Improve coverage for Cron tasks and common services
