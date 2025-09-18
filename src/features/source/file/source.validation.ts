import { z } from 'zod';

// Source type enum
export const sourceTypeSchema = z.enum(['file', 'text']);

// Status enum
export const sourceStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed']);

// Create source schema
export const createSourceSchema = z.object({
  user_id: z.number(),
  source_type: sourceTypeSchema,
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

// Update source schema
export const updateSourceSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  status: sourceStatusSchema.optional(),
  is_embedded: z.boolean().optional(),
});

// File source schema
export const fileSourceSchema = z.object({
  id: z.number(),
  source_id: z.number(),
  file_url: z.string().url('Invalid file URL'),
  mime_type: z.string().optional(),
  file_size: z.number(),
  text_content: z.string().optional(),
});

// Update file source schema
export const updateFileSourceSchema = z.object({
  file_url: z.string().url('Invalid file URL').optional(),
  mime_type: z.string().optional(),
  file_size: z.number().optional(),
  text_content: z.string().optional(),
});

// Create multiple files source schema
export const createMultipleFilesSourceSchema = z.object({
  user_id: z.number(),
  names: z.array(z.string().min(1, 'Name is required')).min(1, 'At least one name is required'),
  descriptions: z.array(z.string()).optional(),
});

// Text source schema
export const textSourceSchema = z.object({
  id: z.number(),
  source_id: z.number(),
  content: z.string().min(1, 'Content is required'),
});

// Create text source schema
export const createTextSourceSchema = z.object({
  user_id: z.number(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
});

// Update text source schema
export const updateTextSourceSchema = z.object({
  content: z.string().min(1, 'Content is required').optional(),
});

// Type exports
export type CreateSource = z.infer<typeof createSourceSchema>;
export type UpdateSource = z.infer<typeof updateSourceSchema>;
export type FileSource = z.infer<typeof fileSourceSchema>;
export type UpdateFileSource = z.infer<typeof updateFileSourceSchema>;
export type CreateMultipleFilesSource = z.infer<typeof createMultipleFilesSourceSchema>;
export type TextSource = z.infer<typeof textSourceSchema>;
export type CreateTextSource = z.infer<typeof createTextSourceSchema>;
export type UpdateTextSource = z.infer<typeof updateTextSourceSchema>;
