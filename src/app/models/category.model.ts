export interface Subcategory {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  subcategories?: Subcategory[]; 
}
