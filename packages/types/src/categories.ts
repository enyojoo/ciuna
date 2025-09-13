import { z } from 'zod';
import { BaseRecordSchema } from './common';

// Category
export const CategorySchema = BaseRecordSchema.extend({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  parent_id: z.string().uuid().nullable(),
  description: z.string().optional(),
  icon: z.string().optional(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

// Category creation
export const CreateCategorySchema = CategorySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Category update
export const UpdateCategorySchema = CategorySchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Category with children
export const CategoryWithChildrenSchema = CategorySchema.extend({
  children: z.array(z.any()).optional(),
});

// Category tree
export const CategoryTreeSchema = z.array(CategoryWithChildrenSchema);

export type Category = z.infer<typeof CategorySchema>;
export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
export type CategoryWithChildren = z.infer<typeof CategoryWithChildrenSchema>;
export type CategoryTree = z.infer<typeof CategoryTreeSchema>;
