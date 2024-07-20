export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: number;
  name: string;
}
