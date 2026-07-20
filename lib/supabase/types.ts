export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
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
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          sku: string | null;
          category_id: string;
          short_description: string;
          description: string;
          specifications: Json;
          price_mode: "request_quote" | "fixed" | "from" | "hidden";
          price: number | null;
          currency: string;
          is_active: boolean;
          is_featured: boolean;
          sort_order: number;
          whatsapp_message_override: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          sku?: string | null;
          category_id: string;
          short_description: string;
          description: string;
          specifications?: Json;
          price_mode?: "request_quote" | "fixed" | "from" | "hidden";
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
          category_id?: string;
          short_description?: string;
          description?: string;
          specifications?: Json;
          price_mode?: "request_quote" | "fixed" | "from" | "hidden";
          price?: number | null;
          currency?: string;
          is_active?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          whatsapp_message_override?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          public_url: string;
          alt_text: string;
          sort_order: number;
          is_cover: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          public_url: string;
          alt_text?: string;
          sort_order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          storage_path?: string;
          public_url?: string;
          alt_text?: string;
          sort_order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      price_mode: "request_quote" | "fixed" | "from" | "hidden";
    };
  };
}

// Convenience types
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
export type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
export type ProductImageInsert = Database["public"]["Tables"]["product_images"]["Insert"];
export type ProductImageUpdate = Database["public"]["Tables"]["product_images"]["Update"];

// Extended types with relations
export type ProductWithCategory = Product & {
  categories: Category | null;
};

export type ProductWithImages = Product & {
  product_images: ProductImage[];
};

export type ProductFull = Product & {
  categories: Category | null;
  product_images: ProductImage[];
};
