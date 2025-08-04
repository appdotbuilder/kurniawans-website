
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

import { 
  createOrderInputSchema, 
  updateOrderInputSchema, 
  getOrdersInputSchema 
} from './schema';
import { createOrder } from './handlers/create_order';
import { getOrders } from './handlers/get_orders';
import { getOrderById } from './handlers/get_order_by_id';
import { updateOrder } from './handlers/update_order';
import { deleteOrder } from './handlers/delete_order';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Create a new order
  createOrder: publicProcedure
    .input(createOrderInputSchema)
    .mutation(({ input }) => createOrder(input)),
  
  // Get orders with optional filtering
  getOrders: publicProcedure
    .input(getOrdersInputSchema.optional())
    .query(({ input }) => getOrders(input)),
  
  // Get a specific order by ID
  getOrderById: publicProcedure
    .input(z.number())
    .query(({ input }) => getOrderById(input)),
  
  // Update an existing order
  updateOrder: publicProcedure
    .input(updateOrderInputSchema)
    .mutation(({ input }) => updateOrder(input)),
  
  // Delete an order
  deleteOrder: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteOrder(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
