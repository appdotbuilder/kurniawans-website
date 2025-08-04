
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ordersTable } from '../db/schema';
import { type CreateOrderInput } from '../schema';
import { deleteOrder } from '../handlers/delete_order';
import { eq } from 'drizzle-orm';

// Test input for creating orders
const testOrderInput: CreateOrderInput = {
  full_name: 'John Doe',
  email: 'john@example.com',
  shipping_address: '123 Main St, City, State 12345',
  phone_number: '1234567890',
  product_name: 'Test Product',
  quantity: 2
};

describe('deleteOrder', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing order', async () => {
    // Create an order first
    const insertResult = await db.insert(ordersTable)
      .values(testOrderInput)
      .returning()
      .execute();

    const createdOrder = insertResult[0];
    expect(createdOrder.id).toBeDefined();

    // Delete the order
    const result = await deleteOrder(createdOrder.id);

    expect(result).toBe(true);

    // Verify the order was deleted
    const orders = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, createdOrder.id))
      .execute();

    expect(orders).toHaveLength(0);
  });

  it('should return false when order does not exist', async () => {
    const nonExistentId = 999;

    const result = await deleteOrder(nonExistentId);

    expect(result).toBe(false);
  });

  it('should not affect other orders when deleting', async () => {
    // Create two orders
    const order1Result = await db.insert(ordersTable)
      .values(testOrderInput)
      .returning()
      .execute();

    const order2Input = {
      ...testOrderInput,
      email: 'jane@example.com',
      full_name: 'Jane Smith'
    };

    const order2Result = await db.insert(ordersTable)
      .values(order2Input)
      .returning()
      .execute();

    const order1 = order1Result[0];
    const order2 = order2Result[0];

    // Delete only the first order
    const result = await deleteOrder(order1.id);

    expect(result).toBe(true);

    // Verify first order is deleted
    const deletedOrders = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, order1.id))
      .execute();

    expect(deletedOrders).toHaveLength(0);

    // Verify second order still exists
    const remainingOrders = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, order2.id))
      .execute();

    expect(remainingOrders).toHaveLength(1);
    expect(remainingOrders[0].email).toEqual('jane@example.com');
  });
});
