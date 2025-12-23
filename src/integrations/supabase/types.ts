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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      days: {
        Row: {
          closed_at: string | null
          coins_earned: number
          created_at: string
          date: string
          id: string
          is_forgiveness: boolean
          profile_id: string
          status: string
          xp_gained: number
          xp_lost: number
        }
        Insert: {
          closed_at?: string | null
          coins_earned?: number
          created_at?: string
          date: string
          id?: string
          is_forgiveness?: boolean
          profile_id: string
          status?: string
          xp_gained?: number
          xp_lost?: number
        }
        Update: {
          closed_at?: string | null
          coins_earned?: number
          created_at?: string
          date?: string
          id?: string
          is_forgiveness?: boolean
          profile_id?: string
          status?: string
          xp_gained?: number
          xp_lost?: number
        }
        Relationships: [
          {
            foreignKeyName: "days_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          coin_change: number | null
          created_at: string
          details: string
          id: string
          profile_id: string
          type: string
          xp_change: number | null
        }
        Insert: {
          coin_change?: number | null
          created_at?: string
          details: string
          id?: string
          profile_id: string
          type: string
          xp_change?: number | null
        }
        Update: {
          coin_change?: number | null
          created_at?: string
          details?: string
          id?: string
          profile_id?: string
          type?: string
          xp_change?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_logs: {
        Row: {
          created_at: string
          day_id: string
          habit_id: string | null
          habit_name: string
          habit_type: string
          id: string
          xp_value: number
        }
        Insert: {
          created_at?: string
          day_id: string
          habit_id?: string | null
          habit_name: string
          habit_type: string
          id?: string
          xp_value: number
        }
        Update: {
          created_at?: string
          day_id?: string
          habit_id?: string | null
          habit_name?: string
          habit_type?: string
          id?: string
          xp_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          created_at: string
          id: string
          name: string
          profile_id: string
          type: string
          xp_value: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          profile_id: string
          type: string
          xp_value: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          profile_id?: string
          type?: string
          xp_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "habits_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          coin_reward: number
          created_at: string
          day_id: string
          description: string | null
          id: string
          status: string
          title: string
          type: string
        }
        Insert: {
          coin_reward?: number
          created_at?: string
          day_id: string
          description?: string | null
          id?: string
          status?: string
          title: string
          type: string
        }
        Update: {
          coin_reward?: number
          created_at?: string
          day_id?: string
          description?: string | null
          id?: string
          status?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "days"
            referencedColumns: ["id"]
          },
        ]
      }
      redeemed_rewards: {
        Row: {
          id: string
          profile_id: string
          redeemed_at: string
          reward_cost: number
          reward_id: string | null
          reward_name: string
        }
        Insert: {
          id?: string
          profile_id: string
          redeemed_at?: string
          reward_cost: number
          reward_id?: string | null
          reward_name: string
        }
        Update: {
          id?: string
          profile_id?: string
          redeemed_at?: string
          reward_cost?: number
          reward_id?: string | null
          reward_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "redeemed_rewards_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redeemed_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "store_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      store_rewards: {
        Row: {
          available: boolean
          cost: number
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          available?: boolean
          cost: number
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          available?: boolean
          cost?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      users_profile: {
        Row: {
          bonus_slots: number
          coins: number
          created_at: string
          has_forgiveness: boolean
          id: string
          level: number
          secondary_slots: number
          total_xp: number
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          bonus_slots?: number
          coins?: number
          created_at?: string
          has_forgiveness?: boolean
          id?: string
          level?: number
          secondary_slots?: number
          total_xp?: number
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          bonus_slots?: number
          coins?: number
          created_at?: string
          has_forgiveness?: boolean
          id?: string
          level?: number
          secondary_slots?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_profile_id: { Args: never; Returns: string }
      is_day_open: { Args: { day_uuid: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
