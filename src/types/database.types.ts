export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          short_description: string | null
          tags: string[] | null
          image_url: string | null
          github_url: string | null
          live_url: string | null
          featured: boolean
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          short_description?: string | null
          tags?: string[] | null
          image_url?: string | null
          github_url?: string | null
          live_url?: string | null
          featured?: boolean
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          short_description?: string | null
          tags?: string[] | null
          image_url?: string | null
          github_url?: string | null
          live_url?: string | null
          featured?: boolean
          user_id?: string
        }
      }
<<<<<<< HEAD
=======
      experiences: {
        Row: {
          id: string
          user_id: string
          title: string
          company: string
          location: string
          type: string
          start_date: string
          end_date: string | null
          current: boolean
          description: string
          technologies: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          company: string
          location: string
          type: string
          start_date: string
          end_date?: string | null
          current?: boolean
          description: string
          technologies?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          company?: string
          location?: string
          type?: string
          start_date?: string
          end_date?: string | null
          current?: boolean
          description?: string
          technologies?: string[]
          created_at?: string
          updated_at?: string
        }
      }
>>>>>>> 183ebc5 (Initial commit)
      skills: {
        Row: {
          id: string
          created_at: string
          name: string
          category: string
          proficiency: number
          icon_name: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          category: string
          proficiency: number
          icon_name?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          category?: string
          proficiency?: number
          icon_name?: string | null
          user_id?: string
        }
      }
      certificates: {
        Row: {
          id: string
          created_at: string
          title: string
          issuer: string
          issue_date: string
          expiry_date: string | null
          credential_url: string | null
          certificate_url: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          issuer: string
          issue_date: string
          expiry_date?: string | null
          credential_url?: string | null
          certificate_url?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          issuer?: string
          issue_date?: string
          expiry_date?: string | null
          credential_url?: string | null
          certificate_url?: string | null
          user_id?: string
        }
      }
      resumes: {
        Row: {
          id: string
          created_at: string
          title: string
          version: string
          file_url: string
          is_active: boolean
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          version: string
          file_url: string
          is_active?: boolean
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          version?: string
          file_url?: string
          is_active?: boolean
          user_id?: string
        }
      }
      contacts: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string
          subject: string
          message: string
          read: boolean
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          email: string
          subject: string
          message: string
          read?: boolean
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string
          subject?: string
          message?: string
          read?: boolean
          user_id?: string
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string
          bio: string
          avatar_url: string | null
          email: string | null
          github_url: string | null
          linkedin_url: string | null
          twitter_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name: string
          bio: string
          avatar_url?: string | null
          email?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string
          bio?: string
          avatar_url?: string | null
          email?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
        }
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
  }
}