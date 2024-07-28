// merchants.model.ts
export interface Merchant {
  id?: number;
  name: string;
  category_id?: number;
  subcategory_id?: number;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}
