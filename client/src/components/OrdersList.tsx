
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import type { Order } from '../../../server/src/schema';

interface OrdersListProps {
  orders: Order[];
}

export function OrdersList({ orders }: OrdersListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProduct, setFilterProduct] = useState('');

  const filteredOrders = orders.filter((order: Order) => {
    const matchesSearch = order.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProduct = filterProduct === '' || 
                          order.product_name.toLowerCase().includes(filterProduct.toLowerCase());
    return matchesSearch && matchesProduct;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setFilterProduct('');
  };

  if (orders.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto text-center p-8">
        <CardContent className="pt-6">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h3>
          <p className="text-gray-500">
            Orders will appear here once they are submitted. Switch to the "Create Order" tab to place your first order!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🔍</span>
            <span>Search & Filter</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search by name or email</Label>
              <Input
                id="search"
                placeholder="Type to search..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-filter">Filter by product</Label>
              <Input
                id="product-filter"
                placeholder="Product name..."
                value={filterProduct}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterProduct(e.target.value)}
              />
            </div>
          </div>
          {(searchTerm || filterProduct) && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredOrders.length} of {orders.length} orders
              </p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders Grid */}
      <div className="max-w-6xl mx-auto">
        {filteredOrders.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent className="pt-6">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Matching Orders</h3>
              <p className="text-gray-500">
                Try adjusting your search criteria or clear the filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order: Order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow duration-200 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📋</span>
                      <CardTitle className="text-lg font-semibold">
                        Order #{order.id}
                      </CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {order.created_at.toLocaleDateString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer Info */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">👤</span>
                      <span className="font-medium text-sm">{order.full_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">📧</span>
                      <span className="text-sm text-gray-600">{order.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">📱</span>
                      <span className="text-sm text-gray-600">{order.phone_number}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Product Info */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">📦</span>
                      <span className="font-medium text-sm">{order.product_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">🔢</span>
                      <Badge variant="outline" className="text-xs">
                        Qty: {order.quantity}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Shipping Address */}
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <span className="text-sm mt-0.5">🚚</span>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 line-clamp-3">
                          {order.shipping_address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Date */}
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500 flex items-center space-x-1">
                      <span>🕐</span>
                      <span>Ordered on {order.created_at.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
