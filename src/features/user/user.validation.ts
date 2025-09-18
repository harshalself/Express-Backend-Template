import { z } from 'zod';

// User creation schema
export const createUserSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone_number: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  created_by: z.number().optional(),
  updated_by: z.number().optional(),
  is_deleted: z.boolean().optional(),
  deleted_by: z.number().optional(),
});

// User update schema
export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone_number: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long').optional(),
  updated_by: z.number().optional(),
});

// User login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Type exports
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type Login = z.infer<typeof loginSchema>;
