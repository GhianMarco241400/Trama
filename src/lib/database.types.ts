export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: Database["public"]["Enums"]["user_role"];
          status: Database["public"]["Enums"]["record_status"];
          avatar_url: string | null;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          role?: Database["public"]["Enums"]["user_role"];
          status?: Database["public"]["Enums"]["record_status"];
          avatar_url?: string | null;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: Database["public"]["Enums"]["record_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          status?: Database["public"]["Enums"]["record_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      suppliers: {
        Row: {
          id: string;
          ruc: string;
          business_name: string;
          contact_name: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          status: Database["public"]["Enums"]["record_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ruc: string;
          business_name: string;
          contact_name?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          status?: Database["public"]["Enums"]["record_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["suppliers"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          sku: string;
          name: string;
          description: string | null;
          category_id: string;
          supplier_id: string | null;
          base_price: number;
          status: Database["public"]["Enums"]["record_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sku: string;
          name: string;
          description?: string | null;
          category_id: string;
          supplier_id?: string | null;
          base_price?: number;
          status?: Database["public"]["Enums"]["record_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          sku: string;
          size: string | null;
          color_name: string | null;
          color_hex: string | null;
          image_url: string | null;
          status: Database["public"]["Enums"]["record_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          sku: string;
          size?: string | null;
          color_name?: string | null;
          color_hex?: string | null;
          image_url?: string | null;
          status?: Database["public"]["Enums"]["record_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Insert"]>;
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          document_type: Database["public"]["Enums"]["document_type"];
          document_number: string;
          customer_type: Database["public"]["Enums"]["customer_type"];
          name: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          status: Database["public"]["Enums"]["record_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          document_type?: Database["public"]["Enums"]["document_type"];
          document_number: string;
          customer_type?: Database["public"]["Enums"]["customer_type"];
          name: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          status?: Database["public"]["Enums"]["record_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
        Relationships: [];
      };
      sales: {
        Row: {
          id: string;
          code: string;
          sold_at: string;
          customer_id: string | null;
          seller_id: string | null;
          warehouse_id: string | null;
          receipt_type: Database["public"]["Enums"]["receipt_type"];
          receipt_number: string | null;
          payment_method: Database["public"]["Enums"]["payment_method"];
          subtotal: number;
          igv: number;
          total: number;
          status: Database["public"]["Enums"]["sale_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          sold_at?: string;
          customer_id?: string | null;
          seller_id?: string | null;
          warehouse_id?: string | null;
          receipt_type?: Database["public"]["Enums"]["receipt_type"];
          receipt_number?: string | null;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          subtotal?: number;
          igv?: number;
          total?: number;
          status?: Database["public"]["Enums"]["sale_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sales"]["Insert"]>;
        Relationships: [];
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          variant_id: string;
          quantity: number;
          unit_price: number;
          line_total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
          variant_id: string;
          quantity: number;
          unit_price: number;
          line_total: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sale_items"]["Insert"]>;
        Relationships: [];
      };
      quotations: {
        Row: {
          id: string;
          code: string;
          issued_at: string;
          customer_id: string | null;
          seller_id: string | null;
          currency: string;
          valid_until: string | null;
          subtotal: number;
          igv: number;
          total: number;
          status: Database["public"]["Enums"]["quotation_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          issued_at?: string;
          customer_id?: string | null;
          seller_id?: string | null;
          currency?: string;
          valid_until?: string | null;
          subtotal?: number;
          igv?: number;
          total?: number;
          status?: Database["public"]["Enums"]["quotation_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quotations"]["Insert"]>;
        Relationships: [];
      };
      quotation_items: {
        Row: {
          id: string;
          quotation_id: string;
          variant_id: string;
          quantity: number;
          unit_price: number;
          line_total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quotation_id: string;
          variant_id: string;
          quantity: number;
          unit_price: number;
          line_total: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quotation_items"]["Insert"]>;
        Relationships: [];
      };
      purchases: {
        Row: {
          id: string;
          code: string;
          supplier_id: string;
          issued_at: string;
          status: Database["public"]["Enums"]["purchase_status"];
          subtotal: number;
          igv: number;
          total: number;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          supplier_id: string;
          issued_at?: string;
          status?: Database["public"]["Enums"]["purchase_status"];
          subtotal?: number;
          igv?: number;
          total?: number;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["purchases"]["Insert"]>;
        Relationships: [];
      };
      purchase_items: {
        Row: {
          id: string;
          purchase_id: string;
          variant_id: string;
          quantity: number;
          unit_cost: number;
          line_total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          purchase_id: string;
          variant_id: string;
          quantity: number;
          unit_cost: number;
          line_total: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["purchase_items"]["Insert"]>;
        Relationships: [];
      };
      goods_receipts: {
        Row: {
          id: string;
          code: string;
          purchase_id: string;
          supplier_id: string;
          received_at: string;
          status: Database["public"]["Enums"]["receipt_status"];
          total: number;
          received_by: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          purchase_id: string;
          supplier_id: string;
          received_at?: string;
          status?: Database["public"]["Enums"]["receipt_status"];
          total?: number;
          received_by?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["goods_receipts"]["Insert"]>;
        Relationships: [];
      };
      goods_receipt_items: {
        Row: {
          id: string;
          receipt_id: string;
          variant_id: string;
          requested_qty: number;
          received_qty: number;
          difference: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          receipt_id: string;
          variant_id: string;
          requested_qty?: number;
          received_qty?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["goods_receipt_items"]["Insert"]>;
        Relationships: [];
      };
      warehouses: {
        Row: {
          id: string;
          name: string;
          type: Database["public"]["Enums"]["warehouse_type"];
          address: string | null;
          status: Database["public"]["Enums"]["record_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type?: Database["public"]["Enums"]["warehouse_type"];
          address?: string | null;
          status?: Database["public"]["Enums"]["record_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["warehouses"]["Insert"]>;
        Relationships: [];
      };
      inventory: {
        Row: {
          id: string;
          variant_id: string;
          warehouse_id: string;
          stock: number;
          min_stock: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          variant_id: string;
          warehouse_id: string;
          stock?: number;
          min_stock?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["inventory"]["Insert"]>;
        Relationships: [];
      };
      stock_movements: {
        Row: {
          id: string;
          moved_at: string;
          variant_id: string;
          warehouse_id: string;
          type: Database["public"]["Enums"]["movement_type"];
          reason: Database["public"]["Enums"]["movement_reason"];
          document_ref: string | null;
          quantity: number;
          resulting_balance: number;
          user_id: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          moved_at?: string;
          variant_id: string;
          warehouse_id: string;
          type: Database["public"]["Enums"]["movement_type"];
          reason: Database["public"]["Enums"]["movement_reason"];
          document_ref?: string | null;
          quantity: number;
          resulting_balance?: number;
          user_id?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["stock_movements"]["Insert"]>;
        Relationships: [];
      };
      stock_adjustments: {
        Row: {
          id: string;
          code: string;
          adjusted_at: string;
          variant_id: string;
          warehouse_id: string;
          type: Database["public"]["Enums"]["movement_type"];
          quantity: number;
          reason: Database["public"]["Enums"]["adjustment_reason"];
          user_id: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          adjusted_at?: string;
          variant_id: string;
          warehouse_id: string;
          type: Database["public"]["Enums"]["movement_type"];
          quantity: number;
          reason: Database["public"]["Enums"]["adjustment_reason"];
          user_id?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["stock_adjustments"]["Insert"]>;
        Relationships: [];
      };
      transfers: {
        Row: {
          id: string;
          code: string;
          transfered_at: string;
          origin_warehouse_id: string;
          destination_warehouse_id: string;
          status: Database["public"]["Enums"]["transfer_status"];
          requested_by: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          transfered_at?: string;
          origin_warehouse_id: string;
          destination_warehouse_id: string;
          status?: Database["public"]["Enums"]["transfer_status"];
          requested_by?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["transfers"]["Insert"]>;
        Relationships: [];
      };
      transfer_items: {
        Row: {
          id: string;
          transfer_id: string;
          variant_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          transfer_id: string;
          variant_id: string;
          quantity: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["transfer_items"]["Insert"]>;
        Relationships: [];
      };
      accounts: {
        Row: {
          id: string;
          name: string;
          type: Database["public"]["Enums"]["account_type"];
          number: string | null;
          balance: number;
          status: Database["public"]["Enums"]["record_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type?: Database["public"]["Enums"]["account_type"];
          number?: string | null;
          balance?: number;
          status?: Database["public"]["Enums"]["record_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["accounts"]["Insert"]>;
        Relationships: [];
      };
      account_movements: {
        Row: {
          id: string;
          moved_at: string;
          account_id: string;
          description: string | null;
          type: Database["public"]["Enums"]["account_entry_type"];
          amount: number;
          reference: string | null;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          moved_at?: string;
          account_id: string;
          description?: string | null;
          type: Database["public"]["Enums"]["account_entry_type"];
          amount: number;
          reference?: string | null;
          user_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["account_movements"]["Insert"]>;
        Relationships: [];
      };
      receivables: {
        Row: {
          id: string;
          code: string;
          customer_id: string | null;
          sale_id: string | null;
          receipt_number: string | null;
          issue_date: string;
          due_date: string | null;
          total: number;
          balance: number;
          status: Database["public"]["Enums"]["receivable_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          customer_id?: string | null;
          sale_id?: string | null;
          receipt_number?: string | null;
          issue_date?: string;
          due_date?: string | null;
          total?: number;
          balance?: number;
          status?: Database["public"]["Enums"]["receivable_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["receivables"]["Insert"]>;
        Relationships: [];
      };
      payables: {
        Row: {
          id: string;
          code: string;
          supplier_id: string | null;
          purchase_id: string | null;
          receipt_number: string | null;
          issue_date: string;
          due_date: string | null;
          total: number;
          balance: number;
          status: Database["public"]["Enums"]["payable_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          supplier_id?: string | null;
          purchase_id?: string | null;
          receipt_number?: string | null;
          issue_date?: string;
          due_date?: string | null;
          total?: number;
          balance?: number;
          status?: Database["public"]["Enums"]["payable_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payables"]["Insert"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          receivable_id: string | null;
          payable_id: string | null;
          paid_at: string;
          amount: number;
          method: Database["public"]["Enums"]["payment_method"];
          reference: string | null;
          account_id: string | null;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          receivable_id?: string | null;
          payable_id?: string | null;
          paid_at?: string;
          amount: number;
          method?: Database["public"]["Enums"]["payment_method"];
          reference?: string | null;
          account_id?: string | null;
          user_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [];
      };
      cash_counts: {
        Row: {
          id: string;
          code: string;
          counted_at: string;
          shift: Database["public"]["Enums"]["cash_shift"];
          account_id: string;
          user_id: string | null;
          opening_amount: number;
          sales_amount: number;
          other_income: number;
          expenses: number;
          expected: number;
          counted: number;
          difference: number;
          status: Database["public"]["Enums"]["cash_count_status"];
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          counted_at?: string;
          shift?: Database["public"]["Enums"]["cash_shift"];
          account_id: string;
          user_id?: string | null;
          opening_amount?: number;
          sales_amount?: number;
          other_income?: number;
          expenses?: number;
          expected?: number;
          counted?: number;
          difference?: number;
          status?: Database["public"]["Enums"]["cash_count_status"];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cash_counts"]["Insert"]>;
        Relationships: [];
      };
      settings: {
        Row: {
          id: number;
          business_name: string;
          ruc: string | null;
          phone: string | null;
          address: string | null;
          currency: string;
          igv_rate: number;
          timezone: string;
          receipt_format: string;
          notify_critical_stock: boolean;
          updated_at: string;
        };
        Insert: {
          id?: number;
          business_name?: string;
          ruc?: string | null;
          phone?: string | null;
          address?: string | null;
          currency?: string;
          igv_rate?: number;
          timezone?: string;
          receipt_format?: string;
          notify_critical_stock?: boolean;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      v_daily_sales: {
        Row: {
          day: string;
          sale_count: number;
          total: number | null;
        };
        Relationships: [];
      };
      v_sales_by_category: {
        Row: {
          category_id: string;
          category: string;
          total: number | null;
        };
        Relationships: [];
      };
      v_top_products: {
        Row: {
          product_id: string;
          product: string;
          units: number | null;
          total: number | null;
        };
        Relationships: [];
      };
      v_receivables_aging: {
        Row: {
          id: string;
          code: string;
          customer: string | null;
          due_date: string | null;
          total: number;
          balance: number;
          status: Database["public"]["Enums"]["receivable_status"];
          aging_bucket: string;
        };
        Relationships: [];
      };
      v_payables_aging: {
        Row: {
          id: string;
          code: string;
          supplier: string | null;
          due_date: string | null;
          total: number;
          balance: number;
          status: Database["public"]["Enums"]["payable_status"];
          aging_bucket: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      fn_register_sale: {
        Args: {
          p_customer_id: string | null;
          p_seller_id: string | null;
          p_warehouse_id: string | null;
          p_receipt_type: Database["public"]["Enums"]["receipt_type"];
          p_receipt_number: string | null;
          p_payment_method: Database["public"]["Enums"]["payment_method"];
          p_items: Json;
          p_igv_rate?: number;
          p_account_id?: string | null;
        };
        Returns: string;
      };
      fn_next_receipt_number: {
        Args: {
          p_type: Database["public"]["Enums"]["receipt_type"];
        };
        Returns: string;
      };
      fn_default_cash_account: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      fn_create_purchase: {
        Args: {
          p_supplier_id: string;
          p_created_by: string | null;
          p_items: Json;
          p_igv_rate?: number;
          p_notes?: string | null;
          p_issued_at?: string;
        };
        Returns: string;
      };
      fn_approve_purchase: {
        Args: {
          p_purchase_id: string;
          p_user_id: string | null;
          p_due_date?: string | null;
        };
        Returns: string;
      };
      fn_receive_goods: {
        Args: {
          p_receipt_id: string;
          p_warehouse_id: string;
          p_user_id: string | null;
          p_items: Json;
        };
        Returns: undefined;
      };
      fn_register_payment: {
        Args: {
          p_receivable_id: string | null;
          p_payable_id: string | null;
          p_amount: number;
          p_method: Database["public"]["Enums"]["payment_method"];
          p_reference: string | null;
          p_account_id: string | null;
          p_user_id: string | null;
        };
        Returns: string;
      };
      fn_transfer_stock: {
        Args: {
          p_transfer_id: string;
          p_user_id: string | null;
        };
        Returns: undefined;
      };
      current_role: {
        Args: Record<string, never>;
        Returns: Database["public"]["Enums"]["user_role"];
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: "administrador" | "vendedor" | "almacenero" | "contador";
      record_status: "activo" | "inactivo";
      payment_method: "efectivo" | "tarjeta" | "yape_plin" | "transferencia" | "cheque";
      receipt_type: "boleta" | "factura";
      sale_status: "pagada" | "pendiente" | "anulada";
      quotation_status: "pendiente" | "aprobada" | "vencida";
      purchase_status: "pendiente" | "aprobada" | "recibida" | "anulada";
      receipt_status: "pendiente" | "recibido" | "parcial";
      transfer_status: "pendiente" | "en_transito" | "recibido" | "anulado";
      movement_type: "entrada" | "salida";
      movement_reason: "venta" | "compra" | "ajuste" | "transferencia";
      adjustment_reason:
        "conteo_fisico" | "producto_danado" | "producto_vencido" | "correccion_inventario" | "otro";
      warehouse_type: "almacen" | "tienda";
      account_type: "caja" | "banco";
      document_type: "dni" | "ruc";
      customer_type: "natural" | "juridica";
      account_entry_type: "ingreso" | "egreso";
      receivable_status: "pendiente" | "vencida" | "cobrada";
      payable_status: "pendiente" | "vencida" | "pagada";
      cash_count_status: "cuadrado" | "con_diferencia" | "pendiente";
      cash_shift: "manana" | "tarde";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];
