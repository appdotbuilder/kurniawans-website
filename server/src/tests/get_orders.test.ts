
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ordersTable } from '../db/schema';
import { type GetOrdersInput, type CreateOrderInput } from '../schema';
import { getOrders } from '../handlers/get_orders';

// Test data setup
const testOrder1: CreateOrderInput = {
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  shipping_address: '123 Main St, City, State 12345',
  phone_number: '1234567890',
  product_name: 'Test Product A',
  quantity: 2
};

const testOrder2: CreateOrderInput = {
  full_name: 'Jane Smith',
  email: 'jane.smith@example.com',
  shipping_address: '456 Oak Ave, City, State 54321',
  phone_number: '0987654321',
  product_name: 'Test Product B',
  quantity: 1
};

const testOrder3: CreateOrderInput = {
  full_name: 'Bob Johnson',
  email: 'john.doe@example.com', // Same email as testOrder1
  shipping_address: '789 Pine Rd, City, State 67890',
  phone_number: '5555555555',
  product_name: 'Another Product',
  quantity: 3
};

describe('getOrders', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all orders when no filters provided', async () => {
    // Create test orders
    await db.insert(ordersTable).values([testOrder1, testOrder2]).execute();

    const result = await getOrders();

    expect(result).toHaveLength(2);
    expect(result[0].full_name).toEqual('John Doe');
    expect(result[1].full_name).toEqual('Jane Smith');
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[1].created_at).toBeInstanceOf(Date);
  });

  it('should filter orders by email', async () => {
    // Create test orders with same email
    await db.insert(ordersTable).values([testOrder1, testOrder2, testOrder3]).execute();

    const input: GetOrdersInput = {
      email: 'john.doe@example.com'
    };

    const result = await getOrders(input);

    expect(result).toHaveLength(2);
    result.forEach(order => {
      expect(order.email).toEqual('john.doe@example.com');
    });
  });

  it('should filter orders by product name with partial match', async () => {
    // Create test orders
    await db.insert(ordersTable).values([testOrder1, testOrder2, testOrder3]).execute();

    const input: GetOrdersInput = {
      product_name: 'Test Product'
    };

    const result = await getOrders(input);

    expect(result).toHaveLength(2);
    expect(result.some(order => order.product_name === 'Test Product A')).toBe(true);
    expect(result.some(order => order.product_name === 'Test Product B')).toBe(true);
  });

  it('should apply both email and product name filters', async () => {
    // Create test orders
    await db.insert(ordersTable).values([testOrder1, testOrder2, testOrder3]).execute();

    const input: GetOrdersInput = {
      email: 'john.doe@example.com',
      product_name: 'Test Product'
    };

    const result = await getOrders(input);

    expect(result).toHaveLength(1);
    expect(result[0].email).toEqual('john.doe@example.com');
    expect(result[0].product_name).toEqual('Test Product A');
  });

  it('should apply pagination with limit and offset', async () => {
    // Create multiple test orders
    const orders = [testOrder1, testOrder2, testOrder3];
    await db.insert(ordersTable).values(orders).execute();

    // Test with limit only
    const result1 = await getOrders({ limit: 2 });
    expect(result1).toHaveLength(2);

    // Test with offset
    const result2 = await getOrders({ limit: 2, offset: 1 });
    expect(result2).toHaveLength(2);
    expect(result2[0].id).not.toEqual(result1[0].id);
  });

  it('should return empty array when no orders match filters', async () => {
    await db.insert(ordersTable).values([testOrder1]).execute();

    const input: GetOrdersInput = {
      email: 'nonexistent@example.com'
    };

    const result = await getOrders(input);
    expect(result).toHaveLength(0);
  });

  it('should handle undefined input gracefully', async () => {
    await db.insert(ordersTable).values([testOrder1]).execute();

    const result = await getOrders(undefined);

    expect(result).toHaveLength(1);
    expect(result[0].full_name).toEqual('John Doe');
  });
});
