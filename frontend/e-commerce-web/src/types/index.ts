export interface Product {
  productId: number;
  name: string;
  price: number;
  stock: number;
}

export interface ProductFormData {
  name: string;
  price: number | string;
  stock: number | string;
}

export interface Order {
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  totalPrice: number;
  orderDate: string;
}

export interface OrderFormData {
  productId: number | string;
  quantity: number | string;
}

export interface ApiError {
  message: string;
  status?: number;
}
