
import { db } from '../db';
import { ordersTable } from '../db/schema';
import { type GetOrdersInput, type Order } from '../schema';
import { eq, and, ilike, type SQL } from 'drizzle-orm';

export const getOrders = async (input?: GetOrdersInput): Promise<Order[]> => {
  try {
    // Build conditions array for filters
    const conditions: SQL<unknown>[] = [];

    if (input?.email) {
      conditions.push(eq(ordersTable.email, input.email));
    }

    if (input?.product_name) {
      conditions.push(ilike(ordersTable.product_name, `%${input.product_name}%`));
    }

    // Apply pagination with defaults
    const limit = input?.limit || 50;
    const offset = input?.offset || 0;

    // Build and execute query in one chain
    const results = conditions.length > 0
      ? await db.select()
          .from(ordersTable)
          .where(conditions.length === 1 ? conditions[0] : and(...conditions))
          .limit(limit)
          .offset(offset)
          .execute()
      : await db.select()
          .from(ordersTable)
          .limit(limit)
          .offset(offset)
          .execute();

    return results;
  } catch (error) {
    console.error('Get orders failed:', error);
    throw error;
  }
};
