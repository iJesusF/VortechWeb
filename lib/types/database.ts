export type PriceMode = "request_quote" | "fixed" | "from" | "hidden";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  category_id: string | null;
  short_description: string;
  description: string | null;
  specifications: Record<string, string>;
  price_mode: PriceMode;
  price: number | null;
  currency: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  whatsapp_message_override: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  public_url: string;
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
  created_at: string;
}

export interface ProductWithCategory extends Product {
  category: Category | null;
}

export interface ProductWithImages extends Product {
  category: Category | null;
  product_images: ProductImage[];
}

// Supabase Database type definition for typed client
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          is_active?: boolean;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          sku?: string | null;
          category_id?: string | null;
          short_description: string;
          description?: string | null;
          specifications?: Record<string, string>;
          price_mode?: PriceMode;
          price?: number | null;
          currency?: string;
          is_active?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          whatsapp_message_override?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          sku?: string | null;
          category_id?: string | null;
          short_description?: string;
          description?: string | null;
          specifications?: Record<string, string>;
          price_mode?: PriceMode;
          price?: number | null;
          currency?: string;
          is_active?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          whatsapp_message_override?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      product_images: {
        Row: ProductImage;
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          public_url: string;
          alt_text?: string | null;
          sort_order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          storage_path?: string;
          public_url?: string;
          alt_text?: string | null;
          sort_order?: number;
          is_cover?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      price_mode: PriceMode;
    };
    CompositeTypes: Record<string, never>;
  };
}
