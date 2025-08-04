
import { db } from '../db';
import { ordersTable } from '../db/schema';
import { type CreateOrderInput, type Order } from '../schema';

export const createOrder = async (input: CreateOrderInput): Promise<Order> => {
  try {
    // Insert order record
    const result = await db.insert(ordersTable)
      .values({
        full_name: input.full_name,
        email: input.email,
        shipping_address: input.shipping_address,
        phone_number: input.phone_number,
        product_name: input.product_name,
        quantity: input.quantity
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Order creation failed:', error);
    throw error;
  }
};
