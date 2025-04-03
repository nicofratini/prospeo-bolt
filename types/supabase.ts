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
      ai_agents: {
        Row: {
          id: string
          user_id: string
          agent_name: string | null
          elevenlabs_voice_id: string
          system_prompt: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          agent_name?: string | null
          elevenlabs_voice_id: string
          system_prompt?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          agent_name?: string | null
          elevenlabs_voice_id?: string
          system_prompt?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      call_history: {
        Row: {
          id: string
          user_id: string | null
          ai_agent_id: string | null
          property_id: string | null
          caller_number: string
          call_timestamp: string
          duration_seconds: number | null
          status: 'completed' | 'missed' | 'failed' | 'in-progress'
          recording_url: string | null
          summary: string | null
          transcript: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          ai_agent_id?: string | null
          property_id?: string | null
          caller_number: string
          call_timestamp?: string
          duration_seconds?: number | null
          status?: 'completed' | 'missed' | 'failed' | 'in-progress'
          recording_url?: string | null
          summary?: string | null
          transcript?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          ai_agent_id?: string | null
          property_id?: string | null
          caller_number?: string
          call_timestamp?: string
          duration_seconds?: number | null
          status?: 'completed' | 'missed' | 'failed' | 'in-progress'
          recording_url?: string | null
          summary?: string | null
          transcript?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          password: string
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          password: string
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          password?: string
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
      }
      properties: {
        Row: {
          id: string
          user_id: string
          name: string
          address: string | null
          property_type: 'Maison' | 'Appartement' | null
          status: 'active' | 'inactive' | 'sold'
          price: number | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          address?: string | null
          property_type?: 'Maison' | 'Appartement' | null
          status?: 'active' | 'inactive' | 'sold'
          price?: number | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          address?: string | null
          property_type?: 'Maison' | 'Appartement' | null
          status?: 'active' | 'inactive' | 'sold'
          price?: number | null
          description?: string | null
          created_at?: string
          updated_at?: string
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