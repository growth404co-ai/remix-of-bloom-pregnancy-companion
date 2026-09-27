export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      baby_weeks: {
        Row: {
          fact: string
          fruit_emoji: string
          id: string
          length_cm: number
          size_name: string
          week: number
          weight_g: number
        }
        Insert: {
          fact: string
          fruit_emoji: string
          id?: string
          length_cm: number
          size_name: string
          week: number
          weight_g: number
        }
        Update: {
          fact?: string
          fruit_emoji?: string
          id?: string
          length_cm?: number
          size_name?: string
          week?: number
          weight_g?: number
        }
        Relationships: []
      }
      contractions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          intensity: number | null
          started_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          intensity?: number | null
          started_at: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          intensity?: number | null
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string | null
          created_at: string
          id: string
          mood: string | null
          photo_path: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          mood?: string | null
          photo_path?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          mood?: string | null
          photo_path?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          created_at: string
          id: string
          meal_type: string
          notes: string | null
          plan_date: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meal_type: string
          notes?: string | null
          plan_date?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meal_type?: string
          notes?: string | null
          plan_date?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          active: boolean
          created_at: string
          dosage: string | null
          id: string
          name: string
          notes: string | null
          schedule: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          dosage?: string | null
          id?: string
          name: string
          notes?: string | null
          schedule?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          dosage?: string | null
          id?: string
          name?: string
          notes?: string | null
          schedule?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          id: string
          items: Json
          status: string
          stripe_session_id: string
          total_cents: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json
          status?: string
          stripe_session_id: string
          total_cents: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          status?: string
          stripe_session_id?: string
          total_cents?: number
          user_id?: string
        }
        Relationships: []
      }
      partner_links: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          partner_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          partner_id: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          partner_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          affiliate_url: string | null
          benefits: string[]
          category: string
          description: string | null
          emoji: string
          id: string
          image_url: string | null
          name: string
          price_cents: number
          rating: number
          review_count: number
          stripe_price_id: string | null
          tax_code: string | null
          trimesters: number[]
        }
        Insert: {
          affiliate_url?: string | null
          benefits?: string[]
          category: string
          description?: string | null
          emoji: string
          id?: string
          image_url?: string | null
          name: string
          price_cents: number
          rating?: number
          review_count?: number
          stripe_price_id?: string | null
          tax_code?: string | null
          trimesters?: number[]
        }
        Update: {
          affiliate_url?: string | null
          benefits?: string[]
          category?: string
          description?: string | null
          emoji?: string
          id?: string
          image_url?: string | null
          name?: string
          price_cents?: number
          rating?: number
          review_count?: number
          stripe_price_id?: string | null
          tax_code?: string | null
          trimesters?: number[]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          dietary_preferences: string[] | null
          display_name: string | null
          due_date: string | null
          health_conditions: string[] | null
          id: string
          language: string
          partner_invite_code: string | null
          partner_name: string | null
          pregnancy_history: string | null
          previous_pregnancies: number | null
          push_endpoint: string | null
          timezone: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          dietary_preferences?: string[] | null
          display_name?: string | null
          due_date?: string | null
          health_conditions?: string[] | null
          id: string
          language?: string
          partner_invite_code?: string | null
          partner_name?: string | null
          pregnancy_history?: string | null
          previous_pregnancies?: number | null
          push_endpoint?: string | null
          timezone?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          dietary_preferences?: string[] | null
          display_name?: string | null
          due_date?: string | null
          health_conditions?: string[] | null
          id?: string
          language?: string
          partner_invite_code?: string | null
          partner_name?: string | null
          pregnancy_history?: string | null
          previous_pregnancies?: number | null
          push_endpoint?: string | null
          timezone?: string
        }
        Relationships: []
      }
      saved_products: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      symptom_checks: {
        Row: {
          ai_advice: string | null
          created_at: string
          id: string
          notes: string | null
          risk_level: string | null
          symptoms: string[]
          user_id: string
        }
        Insert: {
          ai_advice?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          risk_level?: string | null
          symptoms?: string[]
          user_id: string
        }
        Update: {
          ai_advice?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          risk_level?: string | null
          symptoms?: string[]
          user_id?: string
        }
        Relationships: []
      }
      tracker_logs: {
        Row: {
          id: string
          log_type: string
          logged_at: string
          note: string | null
          user_id: string
          value: Json | null
        }
        Insert: {
          id?: string
          log_type: string
          logged_at?: string
          note?: string | null
          user_id: string
          value?: Json | null
        }
        Update: {
          id?: string
          log_type?: string
          logged_at?: string
          note?: string | null
          user_id?: string
          value?: Json | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_partner_of: { Args: { _owner: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
