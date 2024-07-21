export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: number;
  name: string;
  category_id: number;
}