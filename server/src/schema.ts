
import { z } from 'zod';

// Order schema
export const orderSchema = z.object({
  id: z.number(),
  full_name: z.string(),
  email: z.string().email(),
  shipping_address: z.string(),
  phone_number: z.string(),
  product_name: z.string(),
  quantity: z.number().int().positive(),
  created_at: z.coerce.date()
});

export type Order = z.infer<typeof orderSchema>;

// Input schema for creating orders
export const createOrderInputSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email address is required"),
  shipping_address: z.string().min(10, "Complete shipping address is required"),
  phone_number: z.string().min(10, "Valid phone number is required"),
  product_name: z.string().min(1, "Product name is required"),
  quantity: z.number().int().positive("Quantity must be a positive number")
});

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;

// Input schema for updating orders
export const updateOrderInputSchema = z.object({
  id: z.number(),
  full_name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  shipping_address: z.string().min(10).optional(),
  phone_number: z.string().min(10).optional(),
  product_name: z.string().min(1).optional(),
  quantity: z.number().int().positive().optional()
});

export type UpdateOrderInput = z.infer<typeof updateOrderInputSchema>;

// Schema for getting orders with optional filters
export const getOrdersInputSchema = z.object({
  email: z.string().email().optional(),
  product_name: z.string().optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional()
});

export type GetOrdersInput = z.infer<typeof getOrdersInputSchema>;
