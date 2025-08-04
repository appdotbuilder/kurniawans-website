
import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { OrderForm } from '@/components/OrderForm';
import { OrdersList } from '@/components/OrdersList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Order, CreateOrderInput } from '../../server/src/schema';

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [orderCount, setOrderCount] = useState(0);

  const loadOrders = useCallback(async () => {
    try {
      const result = await trpc.getOrders.query();
      setOrders(result);
      setOrderCount(result.length);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleOrderSubmit = async (orderData: CreateOrderInput) => {
    setIsLoading(true);
    try {
      const newOrder = await trpc.createOrder.mutate(orderData);
      setOrders((prev: Order[]) => [newOrder, ...prev]);
      setOrderCount((prev: number) => prev + 1);
      return true;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">📦</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  OrderFlow
                </h1>
                <p className="text-gray-600 text-sm">Modern order management system</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">
                <span className="mr-1">📊</span>
                {orderCount} orders
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="create" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="create" className="flex items-center space-x-2">
                <span>✨</span>
                <span>Create Order</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center space-x-2">
                <span>📋</span>
                <span>View Orders</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Place Your Order 🛍️
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Fill out the form below to place your order. We'll process it quickly and keep you updated!
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-xl font-semibold text-center text-gray-800">
                      Order Information
                    </CardTitle>
                    <Separator className="mt-4" />
                  </CardHeader>
                  <CardContent>
                    <OrderForm onSubmit={handleOrderSubmit} isLoading={isLoading} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Order History 📈
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  View all submitted orders and track their details
                </p>
              </div>

              <OrdersList orders={orders} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 bg-white border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>🚀 Built with modern web technologies • Fast • Secure • Reliable</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
