
import { db } from '../db';
import { ordersTable } from '../db/schema';
import { type UpdateOrderInput, type Order } from '../schema';
import { eq } from 'drizzle-orm';

export const updateOrder = async (input: UpdateOrderInput): Promise<Order | null> => {
  try {
    // Extract id and update fields
    const { id, ...updateFields } = input;
    
    // Check if there are any fields to update
    if (Object.keys(updateFields).length === 0) {
      // If no fields to update, just return the existing order
      const existingOrder = await db.select()
        .from(ordersTable)
        .where(eq(ordersTable.id, id))
        .execute();
      
      return existingOrder.length > 0 ? existingOrder[0] : null;
    }

    // Update the order and return the updated record
    const result = await db.update(ordersTable)
      .set(updateFields)
      .where(eq(ordersTable.id, id))
      .returning()
      .execute();

    // Return the updated order or null if not found
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Order update failed:', error);
    throw error;
  }
};
