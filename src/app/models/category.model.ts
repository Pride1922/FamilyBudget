import { Subcategory } from './subcategory.model';

export interface Category {
  id?: number;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  subcategories?: Subcategory[];
}