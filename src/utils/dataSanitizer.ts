/**
 * Simple utility for sanitizing response data
 * Removes sensitive fields before sending to client
 */

/**
 * Remove sensitive fields from a single object
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  fieldsToRemove: string[] = ['password', 'passwordHash']
): Partial<T> {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized = { ...obj };

  fieldsToRemove.forEach(field => {
    delete sanitized[field];
  });

  return sanitized;
}

/**
 * Remove sensitive fields from an array of objects
 */
export function sanitizeArray<T extends Record<string, unknown>>(
  array: T[],
  fieldsToRemove: string[] = ['password', 'passwordHash']
): Partial<T>[] {
  if (!Array.isArray(array)) {
    return array;
  }

  return array.map(obj => sanitizeObject(obj, fieldsToRemove));
}

/**
 * Quick helper for removing passwords (most common case)
 * Accepts any object type and returns a sanitized version
 */
export function removePassword<T>(obj: T): Omit<T, 'password'> {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized = { ...obj } as Record<string, unknown>;
  delete sanitized.password;
  return sanitized as Omit<T, 'password'>;
}

/**
 * Quick helper for removing passwords from arrays (most common case)
 * Accepts any array type and returns a sanitized version
 */
export function removePasswords<T>(array: T[]): Omit<T, 'password'>[] {
  if (!Array.isArray(array)) {
    return array;
  }

  return array.map(obj => removePassword(obj));
}

/**
 * Remove all authentication-related sensitive fields
 */
export function sanitizeAuthData<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return sanitizeObject(obj, [
    'password',
    'passwordHash',
    'token',
    'refreshToken',
    'apiKey',
    'secret',
  ]);
}

/**
 * Create a data transformer function for consistent field removal
 * Useful when you always want to remove the same fields for a specific entity
 */
export function createSanitizer<T extends Record<string, unknown>>(fieldsToRemove: string[]) {
  return {
    one: (obj: T) => sanitizeObject(obj, fieldsToRemove),
    many: (array: T[]) => sanitizeArray(array, fieldsToRemove),
  };
}

// Pre-configured sanitizers for common use cases
export const userSanitizer = createSanitizer(['password', 'passwordHash']);
export const apiKeySanitizer = createSanitizer(['apiKey', 'secret', 'token']);

/**
 * Transform nested objects (e.g., user data within other objects)
 * Example: { post: {...}, author: { id: 1, password: 'hash' } } -> removes password from author
 */
export function sanitizeNested<T extends Record<string, unknown>>(
  obj: T,
  nestedFieldMap: Record<string, string[]>
): Record<string, unknown> {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const result: Record<string, unknown> = { ...obj };

  Object.entries(nestedFieldMap).forEach(([fieldName, fieldsToRemove]) => {
    const fieldValue = result[fieldName];
    if (fieldValue && typeof fieldValue === 'object' && !Array.isArray(fieldValue)) {
      result[fieldName] = sanitizeObject(fieldValue as Record<string, unknown>, fieldsToRemove);
    }
  });

  return result;
}
