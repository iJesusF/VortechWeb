/** Supabase Database type definitions for VORTECH */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ClientType = "individual" | "company";

export type QuoteRequestStatus = "new" | "reviewing" | "converted" | "closed";

export type QuoteStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "expired"
  | "cancelled"
  | "payment_pending"
  | "paid";

export type QuoteItemType = "catalog" | "custom";

export type DiscountType = "none" | "fixed" | "percentage";

export type PaymentMethodType = "gateway" | "bank_transfer";

export type FeeType = "none" | "fixed" | "percentage";

export type FeePaidBy = "seller" | "customer";

export type PaymentSessionStatus =
  | "created"
  | "pending"
  | "completed"
  | "failed"
  | "cancelled"
  | "expired";

export type QuoteEventType =
  | "created"
  | "edited"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "pdf_downloaded"
  | "payment_link_created"
  | "marked_paid"
  | "cancelled"
  | "version_created";

export interface Address {
  street: string;
  exterior_number: string;
  interior_number?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface CartSnapshotItem {
  product_id?: string;
  name: string;
  sku?: string;
  quantity: number;
  url?: string;
  observations?: string;
  unit_price?: number;
  image_url?: string;
}

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["categories"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          sku: string | null;
          description: string | null;
          short_description: string | null;
          unit_price: number | null;
          currency: string;
          unit: string;
          image_url: string | null;
          images: string[];
          specifications: Json | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      clients: {
        Row: {
          id: string;
          client_type: ClientType;
          business_name: string;
          contact_name: string;
          email: string;
          phone: string;
          rfc: string | null;
          tax_regime: string | null;
          cfdi_use: string | null;
          fiscal_zip_code: string | null;
          billing_address: Address | null;
          shipping_address: Address | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["clients"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
      };
      quote_requests: {
        Row: {
          id: string;
          request_number: string;
          customer_name: string;
          company: string | null;
          email: string;
          phone: string;
          rfc: string | null;
          general_notes: string | null;
          status: QuoteRequestStatus;
          cart_snapshot: CartSnapshotItem[];
          converted_quote_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["quote_requests"]["Row"], "id" | "request_number" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["quote_requests"]["Insert"]>;
      };
      quotes: {
        Row: {
          id: string;
          quote_number: string;
          version: number;
          client_id: string;
          request_id: string | null;
          status: QuoteStatus;
          currency: string;
          issue_date: string;
          valid_until: string;
          subtotal: number;
          discount_total: number;
          shipping_total: number;
          tax_total: number;
          withholding_total: number;
          payment_fee_total: number;
          grand_total: number;
          notes: string | null;
          terms: string | null;
          internal_notes: string | null;
          public_token: string;
          public_token_expires_at: string | null;
          accepted_at: string | null;
          rejected_at: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["quotes"]["Row"], "id" | "quote_number" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["quotes"]["Insert"]>;
      };
      quote_items: {
        Row: {
          id: string;
          quote_id: string;
          item_type: QuoteItemType;
          product_id: string | null;
          sku: string | null;
          name: string;
          description: string | null;
          quantity: number;
          unit: string;
          unit_price: number;
          discount_type: DiscountType;
          discount_value: number;
          tax_rate: number;
          withholding_rate: number;
          line_subtotal: number;
          line_total: number;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["quote_items"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["quote_items"]["Insert"]>;
      };
      quote_events: {
        Row: {
          id: string;
          quote_id: string;
          event_type: QuoteEventType;
          metadata: Json | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["quote_events"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["quote_events"]["Insert"]>;
      };
      payment_methods: {
        Row: {
          id: string;
          type: PaymentMethodType;
          provider: string;
          display_name: string;
          is_enabled: boolean;
          sort_order: number;
          fee_type: FeeType;
          fee_value: number;
          fee_paid_by: FeePaidBy;
          public_instructions: string | null;
          private_configuration: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payment_methods"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["payment_methods"]["Insert"]>;
      };
      payment_sessions: {
        Row: {
          id: string;
          quote_id: string;
          provider: string;
          external_reference: string | null;
          amount: number;
          currency: string;
          fee_amount: number;
          checkout_url: string | null;
          status: PaymentSessionStatus;
          provider_response: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payment_sessions"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["payment_sessions"]["Insert"]>;
      };
      billing_documents: {
        Row: {
          id: string;
          quote_id: string;
          provider: string;
          external_id: string | null;
          status: string;
          document_type: string;
          pdf_url: string | null;
          xml_url: string | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["billing_documents"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["billing_documents"]["Insert"]>;
      };
      company_settings: {
        Row: {
          id: string;
          legal_name: string;
          trade_name: string;
          rfc: string | null;
          address: Address | null;
          phone: string;
          email: string;
          website: string | null;
          logo_url: string | null;
          currency: string;
          default_validity_days: number;
          default_terms: string | null;
          default_tax_rate: number;
          default_withholding_rate: number;
          tax_enabled: boolean;
          withholding_enabled: boolean;
          quote_prefix: string;
          next_quote_number: number;
          pdf_footer: string | null;
          responsible_name: string | null;
          whatsapp: string | null;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["company_settings"]["Row"], "id" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["company_settings"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
