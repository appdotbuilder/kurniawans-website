
import { db } from '../db';
import { ordersTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteOrder = async (id: number): Promise<boolean> => {
  try {
    const result = await db.delete(ordersTable)
      .where(eq(ordersTable.id, id))
      .execute();

    // Check if any rows were affected (deleted)
    // rowCount can be null, so we need to handle that case
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Order deletion failed:', error);
    throw error;
  }
};
