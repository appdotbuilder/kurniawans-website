
import { db } from '../db';
import { ordersTable } from '../db/schema';
import { type Order } from '../schema';
import { eq } from 'drizzle-orm';

export const getOrderById = async (id: number): Promise<Order | null> => {
  try {
    const results = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Failed to get order by ID:', error);
    throw error;
  }
};
