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
      certificates: {
        Row: {
          certificate_url: string | null
          created_at: string | null
          credential_url: string | null
          expiry_date: string | null
          id: string
          issue_date: string
          issuer: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          certificate_url?: string | null
          created_at?: string | null
          credential_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date: string
          issuer: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          certificate_url?: string | null
          created_at?: string | null
          credential_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string
          issuer?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          read: boolean | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          read?: boolean | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          read?: boolean | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          read: boolean | null
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          read?: boolean | null
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          read?: boolean | null
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      experiences: {
        Row: {
          company: string
          created_at: string | null
          current: boolean | null
          description: string
          end_date: string | null
          id: string
          key_achievements: string[] | null
          location: string
          position: string | null
          start_date: string
          technologies: string[] | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string | null
          current?: boolean | null
          description: string
          end_date?: string | null
          id?: string
          key_achievements?: string[] | null
          location: string
          position?: string | null
          start_date: string
          technologies?: string[] | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string | null
          current?: boolean | null
          description?: string
          end_date?: string | null
          id?: string
          key_achievements?: string[] | null
          location?: string
          position?: string | null
          start_date?: string
          technologies?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_user_id_fkey"
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
          bio: string | null
          created_at: string | null
          email: string | null
          github_url: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          name: string | null
          phone: string | null
          title: string | null
          twitter_url: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          github_url?: string | null
          id: string
          linkedin_url?: string | null
          location?: string | null
          name?: string | null
          phone?: string | null
          title?: string | null
          twitter_url?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          name?: string | null
          phone?: string | null
          title?: string | null
          twitter_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string | null
          contributions: string[]
          created_at: string | null
          description: string | null
          featured: boolean | null
          github_url: string | null
          id: string
          image_url: string | null
          image_urls: string[]
          live_url: string | null
          outcome: string | null
          role: string | null
          short_description: string | null
          tech_stack: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          contributions?: string[]
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[]
          live_url?: string | null
          outcome?: string | null
          role?: string | null
          short_description?: string | null
          tech_stack?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          contributions?: string[]
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[]
          live_url?: string | null
          outcome?: string | null
          role?: string | null
          short_description?: string | null
          tech_stack?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          created_at: string | null
          file_url: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          title: string
          updated_at: string | null
          user_id: string
          version: string | null
        }
        Insert: {
          created_at?: string | null
          file_url: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          title: string
          updated_at?: string | null
          user_id: string
          version?: string | null
        }
        Update: {
          created_at?: string | null
          file_url?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          title?: string
          updated_at?: string | null
          user_id?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string
          created_at: string | null
          id: string
          name: string
          proficiency: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          name: string
          proficiency?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          name?: string
          proficiency?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          theme: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          theme: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          theme?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
