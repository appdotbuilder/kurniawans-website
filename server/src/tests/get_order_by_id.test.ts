
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ordersTable } from '../db/schema';
import { type CreateOrderInput } from '../schema';
import { getOrderById } from '../handlers/get_order_by_id';

// Test order input
const testOrderInput: CreateOrderInput = {
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  shipping_address: '123 Main Street, Anytown, ST 12345',
  phone_number: '555-123-4567',
  product_name: 'Test Product',
  quantity: 2
};

describe('getOrderById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return order when found', async () => {
    // Create test order
    const insertResult = await db.insert(ordersTable)
      .values(testOrderInput)
      .returning()
      .execute();

    const createdOrder = insertResult[0];

    // Test retrieval
    const result = await getOrderById(createdOrder.id);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdOrder.id);
    expect(result!.full_name).toEqual('John Doe');
    expect(result!.email).toEqual('john.doe@example.com');
    expect(result!.shipping_address).toEqual('123 Main Street, Anytown, ST 12345');
    expect(result!.phone_number).toEqual('555-123-4567');
    expect(result!.product_name).toEqual('Test Product');
    expect(result!.quantity).toEqual(2);
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should return null when order not found', async () => {
    const result = await getOrderById(999);

    expect(result).toBeNull();
  });

  it('should return correct order when multiple orders exist', async () => {
    // Create multiple test orders
    const order1Input = { ...testOrderInput, full_name: 'Alice Smith' };
    const order2Input = { ...testOrderInput, full_name: 'Bob Johnson' };

    const insertResult1 = await db.insert(ordersTable)
      .values(order1Input)
      .returning()
      .execute();

    const insertResult2 = await db.insert(ordersTable)
      .values(order2Input)
      .returning()
      .execute();

    const createdOrder1 = insertResult1[0];
    const createdOrder2 = insertResult2[0];

    // Test retrieving specific orders
    const result1 = await getOrderById(createdOrder1.id);
    const result2 = await getOrderById(createdOrder2.id);

    expect(result1).not.toBeNull();
    expect(result1!.full_name).toEqual('Alice Smith');
    expect(result1!.id).toEqual(createdOrder1.id);

    expect(result2).not.toBeNull();
    expect(result2!.full_name).toEqual('Bob Johnson');
    expect(result2!.id).toEqual(createdOrder2.id);
  });
});
