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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      communities: {
        Row: {
          banner_url: string | null
          category: string
          created_at: string
          description: string | null
          dynamic_fields: Json | null
          id: string
          manager_id: string | null
          name: string
          status: Database["public"]["Enums"]["community_status"]
          territory: string
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          category: string
          created_at?: string
          description?: string | null
          dynamic_fields?: Json | null
          id?: string
          manager_id?: string | null
          name: string
          status?: Database["public"]["Enums"]["community_status"]
          territory: string
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          category?: string
          created_at?: string
          description?: string | null
          dynamic_fields?: Json | null
          id?: string
          manager_id?: string | null
          name?: string
          status?: Database["public"]["Enums"]["community_status"]
          territory?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communities_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          block_reason: string | null
          community_id: string
          created_at: string
          id: string
          is_blocked: boolean | null
          joined_at: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["join_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          block_reason?: string | null
          community_id: string
          created_at?: string
          id?: string
          is_blocked?: boolean | null
          joined_at?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["join_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          block_reason?: string | null
          community_id?: string
          created_at?: string
          id?: string
          is_blocked?: boolean | null
          joined_at?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["join_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendance: {
        Row: {
          attended_at: string | null
          created_at: string | null
          event_id: string
          id: string
          qr_code_verified: boolean | null
          registration_id: string | null
          user_id: string
        }
        Insert: {
          attended_at?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          qr_code_verified?: boolean | null
          registration_id?: string | null
          user_id: string
        }
        Update: {
          attended_at?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          qr_code_verified?: boolean | null
          registration_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendance_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          attended: boolean | null
          attended_at: string | null
          created_at: string
          event_id: string
          form_data: Json | null
          id: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["approval_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          attended_at?: string | null
          created_at?: string
          event_id: string
          form_data?: Json | null
          id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          attended?: boolean | null
          attended_at?: string | null
          created_at?: string
          event_id?: string
          form_data?: Json | null
          id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_volunteers: {
        Row: {
          created_at: string
          event_id: string
          id: string
          message: string | null
          status: Database["public"]["Enums"]["approval_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_volunteers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          banner_url: string | null
          community_id: string
          created_at: string
          created_by: string
          creative_url: string | null
          description: string
          dynamic_form: Json | null
          end_datetime: string
          id: string
          needs_volunteers: boolean | null
          qr_code_url: string | null
          registration_end: string
          registration_limit: number | null
          start_datetime: string
          territory: string
          title: string
          updated_at: string
          venue_address: string
          venue_lat: number | null
          venue_lng: number | null
          venue_name: string
          volunteer_limit: number | null
        }
        Insert: {
          banner_url?: string | null
          community_id: string
          created_at?: string
          created_by: string
          creative_url?: string | null
          description: string
          dynamic_form?: Json | null
          end_datetime: string
          id?: string
          needs_volunteers?: boolean | null
          qr_code_url?: string | null
          registration_end: string
          registration_limit?: number | null
          start_datetime: string
          territory: string
          title: string
          updated_at?: string
          venue_address: string
          venue_lat?: number | null
          venue_lng?: number | null
          venue_name: string
          volunteer_limit?: number | null
        }
        Update: {
          banner_url?: string | null
          community_id?: string
          created_at?: string
          created_by?: string
          creative_url?: string | null
          description?: string
          dynamic_form?: Json | null
          end_datetime?: string
          id?: string
          needs_volunteers?: boolean | null
          qr_code_url?: string | null
          registration_end?: string
          registration_limit?: number | null
          start_datetime?: string
          territory?: string
          title?: string
          updated_at?: string
          venue_address?: string
          venue_lat?: number | null
          venue_lng?: number | null
          venue_name?: string
          volunteer_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "events_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          attachment_url: string | null
          community_id: string
          created_at: string
          description: string
          id: string
          post_type: Database["public"]["Enums"]["post_type"]
          price_budget: number | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["approval_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachment_url?: string | null
          community_id: string
          created_at?: string
          description: string
          id?: string
          post_type: Database["public"]["Enums"]["post_type"]
          price_budget?: number | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachment_url?: string | null
          community_id?: string
          created_at?: string
          description?: string
          id?: string
          post_type?: Database["public"]["Enums"]["post_type"]
          price_budget?: number | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          pincode: string | null
          territory: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          pincode?: string | null
          territory?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          pincode?: string | null
          territory?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pulse_communities: {
        Row: {
          community_id: string
          created_at: string
          id: string
          pulse_id: string
          status: Database["public"]["Enums"]["approval_status"]
        }
        Insert: {
          community_id: string
          created_at?: string
          id?: string
          pulse_id: string
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Update: {
          community_id?: string
          created_at?: string
          id?: string
          pulse_id?: string
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Relationships: [
          {
            foreignKeyName: "pulse_communities_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pulse_communities_pulse_id_fkey"
            columns: ["pulse_id"]
            isOneToOne: false
            referencedRelation: "pulses"
            referencedColumns: ["id"]
          },
        ]
      }
      pulses: {
        Row: {
          attachment_url: string | null
          community_id: string | null
          created_at: string
          description: string
          id: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["approval_status"]
          territory: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachment_url?: string | null
          community_id?: string | null
          created_at?: string
          description: string
          id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          territory: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachment_url?: string | null
          community_id?: string | null
          created_at?: string
          description?: string
          id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          territory?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pulses_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pulses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          check_role: Database["public"]["Enums"]["app_role"]
          check_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "member"
      approval_status: "pending" | "approved" | "rejected" | "draft"
      community_status: "active" | "inactive"
      join_status: "pending" | "approved" | "rejected"
      post_type: "want" | "offer"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "manager", "member"],
      approval_status: ["pending", "approved", "rejected", "draft"],
      community_status: ["active", "inactive"],
      join_status: ["pending", "approved", "rejected"],
      post_type: ["want", "offer"],
    },
  },
} as const
