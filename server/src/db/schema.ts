
import { serial, text, pgTable, timestamp, integer } from 'drizzle-orm/pg-core';

export const ordersTable = pgTable('orders', {
  id: serial('id').primaryKey(),
  full_name: text('full_name').notNull(),
  email: text('email').notNull(),
  shipping_address: text('shipping_address').notNull(),
  phone_number: text('phone_number').notNull(),
  product_name: text('product_name').notNull(),
  quantity: integer('quantity').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type Order = typeof ordersTable.$inferSelect; // For SELECT operations
export type NewOrder = typeof ordersTable.$inferInsert; // For INSERT operations

// Important: Export all tables and relations for proper query building
export const tables = { orders: ordersTable };
