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
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          bio: string | null
          location: string | null
          preferred_currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          bio?: string | null
          location?: string | null
          preferred_currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          bio?: string | null
          location?: string | null
          preferred_currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      items: {
        Row: {
          id: string
          title: string
          description: string | null
          price: number
          currency_code: string
          category: string
          condition: string | null
          images: string[] | null
          user_id: string
          created_at: string
          updated_at: string
          status: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          price: number
          currency_code?: string
          category: string
          condition?: string | null
          images?: string[] | null
          user_id: string
          created_at?: string
          updated_at?: string
          status?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          price?: number
          currency_code?: string
          category?: string
          condition?: string | null
          images?: string[] | null
          user_id?: string
          created_at?: string
          updated_at?: string
          status?: string
        }
      }
      jobs: {
        Row: {
          id: string
          title: string
          description: string
          salary: number | null
          currency_code: string
          location: string | null
          job_type: string
          company: string | null
          user_id: string
          created_at: string
          updated_at: string
          status: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          salary?: number | null
          currency_code?: string
          location?: string | null
          job_type: string
          company?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
          status?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          salary?: number | null
          currency_code?: string
          location?: string | null
          job_type?: string
          company?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
          status?: string
        }
      }
      services: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          currency_code: string
          category: string
          user_id: string
          created_at: string
          updated_at: string
          status: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          price: number
          currency_code?: string
          category: string
          user_id: string
          created_at?: string
          updated_at?: string
          status?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number
          currency_code?: string
          category?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          status?: string
        }
      }
      interests: {
        Row: {
          id: string
          listing_type: string
          listing_id: string
          interested_user_id: string
          message: string | null
          contact_info: string | null
          created_at: string
        }
        Insert: {
          id?: string
          listing_type: string
          listing_id: string
          interested_user_id: string
          message?: string | null
          contact_info?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          listing_type?: string
          listing_id?: string
          interested_user_id?: string
          message?: string | null
          contact_info?: string | null
          created_at?: string
        }
      }
      currencies: {
        Row: {
          code: string
          name: string
          symbol: string
          conversion_rate_to_usd: number
        }
        Insert: {
          code: string
          name: string
          symbol: string
          conversion_rate_to_usd: number
        }
        Update: {
          code?: string
          name?: string
          symbol?: string
          conversion_rate_to_usd?: number
        }
      }
      resumes: {
        Row: {
          id: string
          job_id: string
          user_id: string
          file_url: string
          cover_letter: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          user_id: string
          file_url: string
          cover_letter?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          user_id?: string
          file_url?: string
          cover_letter?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// --- Offer and Bid Types ---
export type Offer = {
  id: string;
  user_id: string;
  amount: number;
  message: string | null;
  created_at: string;
  listing_id: string;
  profiles?: { username: string | null; avatar_url: string | null } | null;
};
export type Bid = Offer;