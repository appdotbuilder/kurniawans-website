
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { CreateOrderInput } from '../../../server/src/schema';

interface OrderFormProps {
  onSubmit: (data: CreateOrderInput) => Promise<boolean>;
  isLoading?: boolean;
}

export function OrderForm({ onSubmit, isLoading = false }: OrderFormProps) {
  const [formData, setFormData] = useState<CreateOrderInput>({
    full_name: '',
    email: '',
    shipping_address: '',
    phone_number: '',
    product_name: '',
    quantity: 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.shipping_address.trim()) {
      newErrors.shipping_address = 'Shipping address is required';
    } else if (formData.shipping_address.trim().length < 10) {
      newErrors.shipping_address = 'Please provide a complete shipping address';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (formData.phone_number.trim().length < 10) {
      newErrors.phone_number = 'Please enter a valid phone number';
    }

    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Product name is required';
    }

    if (formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const success = await onSubmit(formData);
      if (success) {
        // Reset form after successful submission
        setFormData({
          full_name: '',
          email: '',
          shipping_address: '',
          phone_number: '',
          product_name: '',
          quantity: 1
        });
        setErrors({});
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleInputChange = (field: keyof CreateOrderInput, value: string | number) => {
    setFormData((prev: CreateOrderInput) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="space-y-6">
      {showSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <span className="text-green-600">✅</span>
          <AlertDescription className="text-green-800">
            Order submitted successfully! We'll process it shortly.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information Section */}
        <Card className="border-l-4 border-l-blue-500 bg-blue-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">👤</span>
              <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('full_name', e.target.value)
                  }
                  placeholder="Enter your full name"
                  className={errors.full_name ? 'border-red-500' : ''}
                />
                {errors.full_name && (
                  <p className="text-red-500 text-xs">{errors.full_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('email', e.target.value)
                  }
                  placeholder="your.email@example.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone_number" className="text-sm font-medium text-gray-700">
                  Phone Number *
                </Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('phone_number', e.target.value)
                  }
                  placeholder="+1 (555) 123-4567"
                  className={errors.phone_number ? 'border-red-500' : ''}
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-xs">{errors.phone_number}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Information Section */}
        <Card className="border-l-4 border-l-green-500 bg-green-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">🚚</span>
              <h3 className="text-lg font-semibold text-gray-800">Shipping Information</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shipping_address" className="text-sm font-medium text-gray-700">
                Complete Shipping Address *
              </Label>
              <Textarea
                id="shipping_address"
                value={formData.shipping_address}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleInputChange('shipping_address', e.target.value)
                }
                placeholder="Enter your complete shipping address including street, city, state, and ZIP code"
                rows={3}
                className={errors.shipping_address ? 'border-red-500' : ''}
              />
              {errors.shipping_address && (
                <p className="text-red-500 text-xs">{errors.shipping_address}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Information Section */}
        <Card className="border-l-4 border-l-purple-500 bg-purple-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">📦</span>
              <h3 className="text-lg font-semibold text-gray-800">Product Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="product_name" className="text-sm font-medium text-gray-700">
                  Product Name *
                </Label>
                <Input
                  id="product_name"
                  value={formData.product_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('product_name', e.target.value)
                  }
                  placeholder="Enter the product you want to order"
                  className={errors.product_name ? 'border-red-500' : ''}
                />
                {errors.product_name && (
                  <p className="text-red-500 text-xs">{errors.product_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                  Quantity *
                </Label>
                <div className="relative">
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange('quantity', parseInt(e.target.value) || 1)
                    }
                    className={errors.quantity ? 'border-red-500' : ''}
                  />
                  <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">
                    pcs
                  </Badge>
                </div>
                {errors.quantity && (
                  <p className="text-red-500 text-xs">{errors.quantity}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting Order...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>🚀</span>
                <span>Submit Order</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
