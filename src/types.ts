export type Product = {
  id: number;
  title: string;
  description: string;
};

export type ProductResponse = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};
