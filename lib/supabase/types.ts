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
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          currency: string
          telegram_chat_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          currency?: string
          telegram_chat_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          currency?: string
          telegram_chat_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          description: string
          category_name: string | null
          vendor: string | null
          type: 'income' | 'expense'
          date: string
          image_url: string | null
          raw_input: string | null
          source: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          description: string
          category_name?: string | null
          vendor?: string | null
          type: 'income' | 'expense'
          date?: string
          image_url?: string | null
          raw_input?: string | null
          source?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          description?: string
          category_name?: string | null
          vendor?: string | null
          type?: 'income' | 'expense'
          date?: string
          image_url?: string | null
          raw_input?: string | null
          source?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          icon: string
          type: 'income' | 'expense'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          icon: string
          type: 'income' | 'expense'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          icon?: string
          type?: 'income' | 'expense'
          created_at?: string
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
      transaction_type: 'income' | 'expense'
    }
  }
}

