# Development Utilities Guide

This guide shows how to use the simple utility functions that eliminate common code duplication in controllers.

## 🎯 **Controller Helpers** (`src/utils/controllerHelpers.ts`)

### Parameter Parsing

```typescript
// Old way (repeated in every controller):
const id = Number(req.params.id);
if (isNaN(id)) {
  throw new HttpException(400, 'Invalid user ID');
}

// New way (one line):
import { parseIdParam } from '../utils/controllerHelpers';
const id = parseIdParam(req); // or parseIdParam(req, 'customParam')
```

### User Authentication Check

```typescript
// Old way (repeated everywhere):
const userId = req.userId || req.user?.id;
if (!userId) {
  throw new HttpException(401, 'User authentication required');
}

// New way (one line):
import { getUserId } from '../utils/controllerHelpers';
const userId = getUserId(req);
```

### Async Error Handling

```typescript
// Old way (try-catch in every method):
public getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // controller logic
  } catch (error) {
    next(error);
  }
};

// New way (no try-catch needed):
import { asyncHandler } from '../utils/controllerHelpers';
public getUser = asyncHandler(async (req: Request, res: Response) => {
  // controller logic - errors automatically caught and passed to error middleware
});
```

### Pagination

```typescript
// Old way:
const page = Math.max(1, Number(req.query.page) || 1);
const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
const offset = (page - 1) * limit;

// New way:
import { getPaginationParams } from '../utils/controllerHelpers';
const { page, limit, offset } = getPaginationParams(req);
```

## 🧹 **Data Sanitization** (`src/utils/dataSanitizer.ts`)

### Remove Passwords

```typescript
// Old way (repeated for every user response):
const userResponse = { ...user };
delete userResponse.password;

// New way:
import { removePassword } from '../utils/dataSanitizer';
const userResponse = removePassword(user);

// For arrays:
import { removePasswords } from '../utils/dataSanitizer';
const usersResponse = removePasswords(users);
```

### Custom Field Removal

```typescript
import { sanitizeObject, sanitizeArray } from '../utils/dataSanitizer';

// Remove custom fields:
const cleanData = sanitizeObject(data, ['password', 'apiKey', 'secret']);
const cleanArray = sanitizeArray(dataArray, ['password', 'apiKey']);
```

### Pre-configured Sanitizers

```typescript
import { userSanitizer, apiKeySanitizer } from '../utils/dataSanitizer';

// Consistent user data cleaning:
const cleanUser = userSanitizer.one(user);
const cleanUsers = userSanitizer.many(users);

// API key data:
const cleanApiData = apiKeySanitizer.one(apiData);
```

## 📝 **Example: Before vs After**

### Before (Lots of Duplication):

```typescript
class UserController {
  public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        throw new HttpException(400, 'Invalid user ID');
      }

      const userId = req.userId || req.user?.id;
      if (!userId) {
        throw new HttpException(401, 'User authentication required');
      }

      const user = await this.userService.getUserById(id);

      // Remove password from response
      const userResponse = { ...user };
      delete userResponse.password;

      ResponseFormatter.success(res, userResponse, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
```

### After (Clean & Simple):

```typescript
import { asyncHandler, parseIdParam, getUserId } from '../utils/controllerHelpers';
import { removePassword } from '../utils/dataSanitizer';

class UserController {
  public getUserById = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const id = parseIdParam(req);
    const userId = getUserId(req); // only if needed for authorization

    const user = await this.userService.getUserById(id);
    const userResponse = removePassword(user);

    ResponseFormatter.success(res, userResponse, 'User retrieved successfully');
  });
}
```

## ✅ **When to Use These Utilities**

**✅ DO use for:**

- Parameter parsing (every controller needs this)
- User authentication checks (used everywhere)
- Password/sensitive data removal (security requirement)
- Pagination (standard pattern)
- Try-catch wrapping (every async method)

**❌ DON'T create utilities for:**

- Feature-specific business logic
- Complex validation (use Zod schemas)
- Database queries (too feature-specific)
- Custom middleware (already well-organized)

## 🔧 **Adding New Controllers**

When creating a new controller, you can now focus on business logic:

```typescript
import { NextFunction, Response } from 'express';
import { RequestWithUser } from '../../interfaces/auth.interface';
import { ResponseFormatter } from '../../utils/responseFormatter';
import { asyncHandler, parseIdParam, getUserId } from '../../utils/controllerHelpers';
import { removePassword } from '../../utils/dataSanitizer';
import MyService from './my.service';

class MyController {
  public myService = new MyService();

  public getAll = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const userId = getUserId(req);
    const data = await this.myService.findAll(userId);
    ResponseFormatter.success(res, data, 'Data retrieved successfully');
  });

  public getById = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const id = parseIdParam(req);
    const data = await this.myService.findById(id);
    ResponseFormatter.success(res, data, 'Data retrieved successfully');
  });

  public create = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const userId = getUserId(req);
    const data = await this.myService.create(req.body, userId);
    ResponseFormatter.created(res, data, 'Data created successfully');
  });

  public update = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const id = parseIdParam(req);
    const userId = getUserId(req);
    const data = await this.myService.update(id, req.body, userId);
    ResponseFormatter.success(res, data, 'Data updated successfully');
  });

  public delete = asyncHandler(async (req: RequestWithUser, res: Response) => {
    const id = parseIdParam(req);
    const userId = getUserId(req);
    await this.myService.delete(id, userId);
    ResponseFormatter.success(res, null, 'Data deleted successfully');
  });
}

export default MyController;
```

This approach gives you **80% of the benefits** with **20% of the complexity** compared to forcing everything into abstract base classes!
