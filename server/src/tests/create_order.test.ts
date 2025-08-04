
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ordersTable } from '../db/schema';
import { type CreateOrderInput } from '../schema';
import { createOrder } from '../handlers/create_order';
import { eq } from 'drizzle-orm';

// Complete test input with all required fields
const testInput: CreateOrderInput = {
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  shipping_address: '123 Main Street, Anytown, State 12345',
  phone_number: '555-123-4567',
  product_name: 'Wireless Headphones',
  quantity: 2
};

describe('createOrder', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an order', async () => {
    const result = await createOrder(testInput);

    // Basic field validation
    expect(result.full_name).toEqual('John Doe');
    expect(result.email).toEqual('john.doe@example.com');
    expect(result.shipping_address).toEqual('123 Main Street, Anytown, State 12345');
    expect(result.phone_number).toEqual('555-123-4567');
    expect(result.product_name).toEqual('Wireless Headphones');
    expect(result.quantity).toEqual(2);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save order to database', async () => {
    const result = await createOrder(testInput);

    // Query using proper drizzle syntax
    const orders = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, result.id))
      .execute();

    expect(orders).toHaveLength(1);
    expect(orders[0].full_name).toEqual('John Doe');
    expect(orders[0].email).toEqual('john.doe@example.com');
    expect(orders[0].shipping_address).toEqual('123 Main Street, Anytown, State 12345');
    expect(orders[0].phone_number).toEqual('555-123-4567');
    expect(orders[0].product_name).toEqual('Wireless Headphones');
    expect(orders[0].quantity).toEqual(2);
    expect(orders[0].created_at).toBeInstanceOf(Date);
  });

  it('should auto-generate sequential order IDs', async () => {
    const firstOrder = await createOrder(testInput);
    const secondOrder = await createOrder({
      ...testInput,
      email: 'jane.doe@example.com'
    });

    expect(firstOrder.id).toBeDefined();
    expect(secondOrder.id).toBeDefined();
    expect(secondOrder.id).toBeGreaterThan(firstOrder.id);
  });

  it('should set created_at timestamp automatically', async () => {
    const beforeCreate = new Date();
    const result = await createOrder(testInput);
    const afterCreate = new Date();

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.created_at >= beforeCreate).toBe(true);
    expect(result.created_at <= afterCreate).toBe(true);
  });
});
