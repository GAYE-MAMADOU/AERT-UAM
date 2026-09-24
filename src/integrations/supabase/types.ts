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
      bus: {
        Row: {
          caravane_id: string
          created_at: string
          id: string
          nom: string | null
          numero: number
          places_total: number
          status: Database["public"]["Enums"]["bus_status"]
          updated_at: string
        }
        Insert: {
          caravane_id: string
          created_at?: string
          id?: string
          nom?: string | null
          numero: number
          places_total?: number
          status?: Database["public"]["Enums"]["bus_status"]
          updated_at?: string
        }
        Update: {
          caravane_id?: string
          created_at?: string
          id?: string
          nom?: string | null
          numero?: number
          places_total?: number
          status?: Database["public"]["Enums"]["bus_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bus_caravane_id_fkey"
            columns: ["caravane_id"]
            isOneToOne: false
            referencedRelation: "caravanes"
            referencedColumns: ["id"]
          },
        ]
      }
      caravanes: {
        Row: {
          created_at: string
          created_by: string | null
          date_depart: string
          description: string | null
          id: string
          lieu_depart: string
          numero_om: string | null
          numero_wave: string | null
          places_total: number
          prix: number
          status: Database["public"]["Enums"]["caravane_status"]
          titre: string
          trajet: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date_depart: string
          description?: string | null
          id?: string
          lieu_depart: string
          numero_om?: string | null
          numero_wave?: string | null
          places_total?: number
          prix?: number
          status?: Database["public"]["Enums"]["caravane_status"]
          titre: string
          trajet: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date_depart?: string
          description?: string | null
          id?: string
          lieu_depart?: string
          numero_om?: string | null
          numero_wave?: string | null
          places_total?: number
          prix?: number
          status?: Database["public"]["Enums"]["caravane_status"]
          titre?: string
          trajet?: string
          updated_at?: string
        }
        Relationships: []
      }
      evenements: {
        Row: {
          cover_url: string | null
          created_at: string
          created_by: string | null
          date_evenement: string
          description: string | null
          id: string
          titre: string
          type: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          date_evenement: string
          description?: string | null
          id?: string
          titre: string
          type?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          date_evenement?: string
          description?: string | null
          id?: string
          titre?: string
          type?: string | null
        }
        Relationships: []
      }
      inscriptions: {
        Row: {
          bagages: number
          bus_id: string | null
          caravane_id: string
          created_at: string
          email: string | null
          filiere: string | null
          id: string
          montant: number
          moyen_paiement: string | null
          nom_complet: string
          note_bureau: string | null
          payment_token: string | null
          payment_url: string | null
          reference: string
          reference_transaction: string | null
          statut: Database["public"]["Enums"]["paiement_status"]
          telephone: string
          valide_le: string | null
          valide_par: string | null
        }
        Insert: {
          bagages?: number
          bus_id?: string | null
          caravane_id: string
          created_at?: string
          email?: string | null
          filiere?: string | null
          id?: string
          montant?: number
          moyen_paiement?: string | null
          nom_complet: string
          note_bureau?: string | null
          payment_token?: string | null
          payment_url?: string | null
          reference?: string
          reference_transaction?: string | null
          statut?: Database["public"]["Enums"]["paiement_status"]
          telephone: string
          valide_le?: string | null
          valide_par?: string | null
        }
        Update: {
          bagages?: number
          bus_id?: string | null
          caravane_id?: string
          created_at?: string
          email?: string | null
          filiere?: string | null
          id?: string
          montant?: number
          moyen_paiement?: string | null
          nom_complet?: string
          note_bureau?: string | null
          payment_token?: string | null
          payment_url?: string | null
          reference?: string
          reference_transaction?: string | null
          statut?: Database["public"]["Enums"]["paiement_status"]
          telephone?: string
          valide_le?: string | null
          valide_par?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inscriptions_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "bus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscriptions_caravane_id_fkey"
            columns: ["caravane_id"]
            isOneToOne: false
            referencedRelation: "caravanes"
            referencedColumns: ["id"]
          },
        ]
      }
      medias: {
        Row: {
          created_at: string
          evenement_id: string
          id: string
          legende: string | null
          type: string
          url: string
        }
        Insert: {
          created_at?: string
          evenement_id: string
          id?: string
          legende?: string | null
          type?: string
          url: string
        }
        Update: {
          created_at?: string
          evenement_id?: string
          id?: string
          legende?: string | null
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "medias_evenement_id_fkey"
            columns: ["evenement_id"]
            isOneToOne: false
            referencedRelation: "evenements"
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
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      lookup_inscription: {
        Args: { _reference: string; _telephone: string }
        Returns: {
          bus_nom: string
          bus_numero: number
          bus_status: string
          caravane_date: string
          caravane_titre: string
          caravane_trajet: string
          nom_complet: string
          reference: string
          statut: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "bureau" | "member"
      bus_status: "ouvert" | "ferme" | "plein"
      caravane_status: "ouverte" | "fermee" | "terminee"
      paiement_status: "en_attente" | "valide" | "refuse"
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
      app_role: ["admin", "bureau", "member"],
      bus_status: ["ouvert", "ferme", "plein"],
      caravane_status: ["ouverte", "fermee", "terminee"],
      paiement_status: ["en_attente", "valide", "refuse"],
    },
  },
} as const
