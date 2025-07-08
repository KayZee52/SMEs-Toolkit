export type Product = {
  id: string;
  name: string;
  stock: number;
  price: number;
  cost: number;
};

export type Sale = {
  id: string;
  productId: string;
  customerId?: string;
  customerName: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
  date: string;
};

export type Customer = {
  id: string;
  name: string;
  phone?: string;
  createdAt: string;
};
