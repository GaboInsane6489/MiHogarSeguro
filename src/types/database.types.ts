export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AreaType = 'trabajo' | 'universidad' | 'gimnasio' | 'cashea' | 'personal';

export type HorizonType = 'hoy' | 'corto' | 'mediano' | 'largo';

export type BlockType = 'heading' | 'paragraph' | 'todo' | 'bullet' | 'code' | 'callout';

export type BlockItem = {
  id: string;
  type: BlockType;
  content: string;
  metadata?: Record<string, unknown>;
};

export type EntryItem = {
  id: string;
  user_id?: string;
  title: string;
  content: BlockItem[];
  area: AreaType;
  horizon: HorizonType;
  is_completed: boolean;
  metadata?: Record<string, unknown>;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
};

export type UserProfile = {
  id: string;
  full_name?: string;
  ai_context: Record<string, unknown>;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      entries: {
        Row: EntryItem;
        Insert: {
          id?: string;
          user_id?: string;
          title: string;
          content?: BlockItem[];
          area?: AreaType;
          horizon?: HorizonType;
          is_completed?: boolean;
          metadata?: Record<string, unknown>;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: BlockItem[];
          area?: AreaType;
          horizon?: HorizonType;
          is_completed?: boolean;
          metadata?: Record<string, unknown>;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: UserProfile;
        Insert: {
          id: string;
          full_name?: string;
          ai_context?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          ai_context?: Record<string, unknown>;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      area_type: AreaType;
      horizon_type: HorizonType;
      block_type: BlockType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
