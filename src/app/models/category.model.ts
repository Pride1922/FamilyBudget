export interface Category {
    id?: number;
    name: string;
    subcategories?: Subcategory[];
  }
  
  export interface Subcategory {
    id?: number;
    name: string;
    categoryId?: number;
  }
  