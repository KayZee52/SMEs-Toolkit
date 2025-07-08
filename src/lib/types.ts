
export type Product = {
  id: string;
  name: string;
  description?: string;
  stock: number;
  price: number;
  cost: number;
  category?: string;
  supplier?: string;
  lastUpdatedAt: string;
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
  profit: number;
  notes?: string;
  date: string;
};

export type Customer = {
  id: string;
  name: string;
  phone?: string;
  createdAt: string;
  notes?: string;
  type?: "Regular" | "VIP" | "Debtor";
};

export type Expense = {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
};
