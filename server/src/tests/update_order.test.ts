
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ordersTable } from '../db/schema';
import { type CreateOrderInput, type UpdateOrderInput } from '../schema';
import { updateOrder } from '../handlers/update_order';
import { eq } from 'drizzle-orm';

// Test data for creating an order
const testOrderInput: CreateOrderInput = {
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  shipping_address: '123 Main Street, Anytown, ST 12345',
  phone_number: '555-123-4567',
  product_name: 'Test Product',
  quantity: 2
};

describe('updateOrder', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update an existing order', async () => {
    // Create an order first
    const createResult = await db.insert(ordersTable)
      .values(testOrderInput)
      .returning()
      .execute();
    
    const createdOrder = createResult[0];

    // Update the order
    const updateInput: UpdateOrderInput = {
      id: createdOrder.id,
      full_name: 'Jane Doe',
      email: 'jane.doe@example.com',
      quantity: 5
    };

    const result = await updateOrder(updateInput);

    // Verify the result
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdOrder.id);
    expect(result!.full_name).toEqual('Jane Doe');
    expect(result!.email).toEqual('jane.doe@example.com');
    expect(result!.quantity).toEqual(5);
    // Unchanged fields should remain the same
    expect(result!.shipping_address).toEqual(testOrderInput.shipping_address);
    expect(result!.phone_number).toEqual(testOrderInput.phone_number);
    expect(result!.product_name).toEqual(testOrderInput.product_name);
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should update order in database', async () => {
    // Create an order first
    const createResult = await db.insert(ordersTable)
      .values(testOrderInput)
      .returning()
      .execute();
    
    const createdOrder = createResult[0];

    // Update the order
    const updateInput: UpdateOrderInput = {
      id: createdOrder.id,
      full_name: 'Updated Name',
      shipping_address: '456 New Street, Different City, ST 67890'
    };

    await updateOrder(updateInput);

    // Query the database to verify the update
    const orders = await db.select()
      .from(ordersTable)
      .where(eq(ordersTable.id, createdOrder.id))
      .execute();

    expect(orders).toHaveLength(1);
    const updatedOrder = orders[0];
    expect(updatedOrder.full_name).toEqual('Updated Name');
    expect(updatedOrder.shipping_address).toEqual('456 New Street, Different City, ST 67890');
    // Unchanged fields should remain the same
    expect(updatedOrder.email).toEqual(testOrderInput.email);
    expect(updatedOrder.phone_number).toEqual(testOrderInput.phone_number);
    expect(updatedOrder.product_name).toEqual(testOrderInput.product_name);
    expect(updatedOrder.quantity).toEqual(testOrderInput.quantity);
  });

  it('should return null for non-existent order', async () => {
    const updateInput: UpdateOrderInput = {
      id: 999, // Non-existent ID
      full_name: 'Updated Name'
    };

    const result = await updateOrder(updateInput);

    expect(result).toBeNull();
  });

  it('should handle partial updates', async () => {
    // Create an order first
    const createResult = await db.insert(ordersTable)
      .values(testOrderInput)
      .returning()
      .execute();
    
    const createdOrder = createResult[0];

    // Update only one field
    const updateInput: UpdateOrderInput = {
      id: createdOrder.id,
      quantity: 10
    };

    const result = await updateOrder(updateInput);

    // Verify only the quantity was updated
    expect(result).not.toBeNull();
    expect(result!.quantity).toEqual(10);
    expect(result!.full_name).toEqual(testOrderInput.full_name);
    expect(result!.email).toEqual(testOrderInput.email);
    expect(result!.shipping_address).toEqual(testOrderInput.shipping_address);
    expect(result!.phone_number).toEqual(testOrderInput.phone_number);
    expect(result!.product_name).toEqual(testOrderInput.product_name);
  });

  it('should return existing order when no update fields provided', async () => {
    // Create an order first
    const createResult = await db.insert(ordersTable)
      .values(testOrderInput)
      .returning()
      .execute();
    
    const createdOrder = createResult[0];

    // Update with only ID (no update fields)
    const updateInput: UpdateOrderInput = {
      id: createdOrder.id
    };

    const result = await updateOrder(updateInput);

    // Should return the existing order unchanged
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdOrder.id);
    expect(result!.full_name).toEqual(testOrderInput.full_name);
    expect(result!.email).toEqual(testOrderInput.email);
    expect(result!.shipping_address).toEqual(testOrderInput.shipping_address);
    expect(result!.phone_number).toEqual(testOrderInput.phone_number);
    expect(result!.product_name).toEqual(testOrderInput.product_name);
    expect(result!.quantity).toEqual(testOrderInput.quantity);
  });

  it('should update multiple fields correctly', async () => {
    // Create an order first
    const createResult = await db.insert(ordersTable)
      .values(testOrderInput)
      .returning()
      .execute();
    
    const createdOrder = createResult[0];

    // Update multiple fields
    const updateInput: UpdateOrderInput = {
      id: createdOrder.id,
      full_name: 'Multi Update Name',
      email: 'multi.update@example.com',
      phone_number: '555-999-8888',
      product_name: 'Updated Product',
      quantity: 7
    };

    const result = await updateOrder(updateInput);

    // Verify all fields were updated
    expect(result).not.toBeNull();
    expect(result!.full_name).toEqual('Multi Update Name');
    expect(result!.email).toEqual('multi.update@example.com');
    expect(result!.phone_number).toEqual('555-999-8888');
    expect(result!.product_name).toEqual('Updated Product');
    expect(result!.quantity).toEqual(7);
    // Unchanged field should remain the same
    expect(result!.shipping_address).toEqual(testOrderInput.shipping_address);
  });
});
