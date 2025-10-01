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
      academic_profiles: {
        Row: {
          assessment_completed: boolean | null
          created_at: string | null
          favorite_subjects: Json
          help_needed_subjects: Json
          id: string
          struggle_subjects: Json
          teaching_subjects: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assessment_completed?: boolean | null
          created_at?: string | null
          favorite_subjects?: Json
          help_needed_subjects?: Json
          id?: string
          struggle_subjects?: Json
          teaching_subjects?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assessment_completed?: boolean | null
          created_at?: string | null
          favorite_subjects?: Json
          help_needed_subjects?: Json
          id?: string
          struggle_subjects?: Json
          teaching_subjects?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      activities: {
        Row: {
          advisor_contact: string | null
          category: string
          created_at: string | null
          current_members: number | null
          description: string | null
          id: string
          is_active: boolean | null
          location: string | null
          max_members: number | null
          meeting_times: string | null
          name: string
        }
        Insert: {
          advisor_contact?: string | null
          category: string
          created_at?: string | null
          current_members?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          max_members?: number | null
          meeting_times?: string | null
          name: string
        }
        Update: {
          advisor_contact?: string | null
          category?: string
          created_at?: string | null
          current_members?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          max_members?: number | null
          meeting_times?: string | null
          name?: string
        }
        Relationships: []
      }
      activity_interests: {
        Row: {
          activity_category: string
          activity_name: string
          created_at: string | null
          id: string
          interest_level: string | null
          user_id: string
        }
        Insert: {
          activity_category: string
          activity_name: string
          created_at?: string | null
          id?: string
          interest_level?: string | null
          user_id: string
        }
        Update: {
          activity_category?: string
          activity_name?: string
          created_at?: string | null
          id?: string
          interest_level?: string | null
          user_id?: string
        }
        Relationships: []
      }
      activity_participation: {
        Row: {
          activity_id: string
          id: string
          is_active: boolean | null
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          activity_id: string
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          activity_id?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_participation_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_profiles: {
        Row: {
          activity_goals: Json
          created_at: string | null
          current_activities: Json
          id: string
          interested_activities: Json
          leadership_interest: string
          onboarding_completed: boolean | null
          time_commitment: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_goals?: Json
          created_at?: string | null
          current_activities?: Json
          id?: string
          interested_activities?: Json
          leadership_interest: string
          onboarding_completed?: boolean | null
          time_commitment: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_goals?: Json
          created_at?: string | null
          current_activities?: Json
          id?: string
          interested_activities?: Json
          leadership_interest?: string
          onboarding_completed?: boolean | null
          time_commitment?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      activity_recommendations: {
        Row: {
          activity_category: string
          activity_name: string
          benefits: string | null
          created_at: string | null
          id: string
          is_viewed: boolean | null
          next_steps: string | null
          peer_count: number | null
          priority_score: number | null
          reason: string
          recommendation_type: string
          user_id: string
        }
        Insert: {
          activity_category: string
          activity_name: string
          benefits?: string | null
          created_at?: string | null
          id?: string
          is_viewed?: boolean | null
          next_steps?: string | null
          peer_count?: number | null
          priority_score?: number | null
          reason: string
          recommendation_type: string
          user_id: string
        }
        Update: {
          activity_category?: string
          activity_name?: string
          benefits?: string | null
          created_at?: string | null
          id?: string
          is_viewed?: boolean | null
          next_steps?: string | null
          peer_count?: number | null
          priority_score?: number | null
          reason?: string
          recommendation_type?: string
          user_id?: string
        }
        Relationships: []
      }
      club_interest: {
        Row: {
          created_at: string | null
          id: string
          interest_level: string | null
          proposal_id: string
          user_id: string
          willing_to_lead: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          interest_level?: string | null
          proposal_id: string
          user_id: string
          willing_to_lead?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          interest_level?: string | null
          proposal_id?: string
          user_id?: string
          willing_to_lead?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "club_interest_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "club_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      club_proposals: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          interest_count: number | null
          location: string | null
          max_members: number | null
          meeting_times: string | null
          min_members: number | null
          name: string
          proposed_by: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: string
          interest_count?: number | null
          location?: string | null
          max_members?: number | null
          meeting_times?: string | null
          min_members?: number | null
          name: string
          proposed_by: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          interest_count?: number | null
          location?: string | null
          max_members?: number | null
          meeting_times?: string | null
          min_members?: number | null
          name?: string
          proposed_by?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      connections: {
        Row: {
          connection_type: string
          created_at: string | null
          id: string
          status: string
          updated_at: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          connection_type: string
          created_at?: string | null
          id?: string
          status?: string
          updated_at?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          connection_type?: string
          created_at?: string | null
          id?: string
          status?: string
          updated_at?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      group_activity_suggestions: {
        Row: {
          activity_name: string
          activity_type: string
          created_at: string | null
          description: string
          id: string
          interest_count: number | null
          location: string | null
          max_participants: number | null
          min_participants: number | null
          status: string
          suggested_by: string
          suggested_date: string | null
          target_participants: Json
          updated_at: string | null
        }
        Insert: {
          activity_name: string
          activity_type: string
          created_at?: string | null
          description: string
          id?: string
          interest_count?: number | null
          location?: string | null
          max_participants?: number | null
          min_participants?: number | null
          status?: string
          suggested_by: string
          suggested_date?: string | null
          target_participants?: Json
          updated_at?: string | null
        }
        Update: {
          activity_name?: string
          activity_type?: string
          created_at?: string | null
          description?: string
          id?: string
          interest_count?: number | null
          location?: string | null
          max_participants?: number | null
          min_participants?: number | null
          status?: string
          suggested_by?: string
          suggested_date?: string | null
          target_participants?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_suggestion_interest: {
        Row: {
          availability: string | null
          created_at: string | null
          id: string
          interest_level: string
          suggestion_id: string
          user_id: string
        }
        Insert: {
          availability?: string | null
          created_at?: string | null
          id?: string
          interest_level?: string
          suggestion_id: string
          user_id: string
        }
        Update: {
          availability?: string | null
          created_at?: string | null
          id?: string
          interest_level?: string
          suggestion_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_suggestion_interest_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "group_activity_suggestions"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      onboarding_progress: {
        Row: {
          academic_assessment_completed: boolean | null
          activity_onboarding_completed: boolean | null
          created_at: string
          friendship_discovery_completed: boolean | null
          id: string
          updated_at: string
          user_id: string
          weekend_assessment_completed: boolean | null
        }
        Insert: {
          academic_assessment_completed?: boolean | null
          activity_onboarding_completed?: boolean | null
          created_at?: string
          friendship_discovery_completed?: boolean | null
          id?: string
          updated_at?: string
          user_id: string
          weekend_assessment_completed?: boolean | null
        }
        Update: {
          academic_assessment_completed?: boolean | null
          activity_onboarding_completed?: boolean | null
          created_at?: string
          friendship_discovery_completed?: boolean | null
          id?: string
          updated_at?: string
          user_id?: string
          weekend_assessment_completed?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          grade: number
          id: string
          last_name: string | null
          quiz_responses: Json | null
          school_name: string
          social_group: string | null
          social_group_analysis: Json | null
          social_group_updated_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          grade: number
          id?: string
          last_name?: string | null
          quiz_responses?: Json | null
          school_name?: string
          social_group?: string | null
          social_group_analysis?: Json | null
          social_group_updated_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          grade?: number
          id?: string
          last_name?: string | null
          quiz_responses?: Json | null
          school_name?: string
          social_group?: string | null
          social_group_analysis?: Json | null
          social_group_updated_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      social_groups: {
        Row: {
          characteristics: Json
          created_at: string
          description: string
          id: string
          name: string
        }
        Insert: {
          characteristics?: Json
          created_at?: string
          description: string
          id?: string
          name: string
        }
        Update: {
          characteristics?: Json
          created_at?: string
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      study_connections: {
        Row: {
          connection_type: string
          created_at: string | null
          id: string
          partner_id: string
          requester_id: string
          status: string
          subjects: Json
          updated_at: string | null
        }
        Insert: {
          connection_type: string
          created_at?: string | null
          id?: string
          partner_id: string
          requester_id: string
          status?: string
          subjects?: Json
          updated_at?: string | null
        }
        Update: {
          connection_type?: string
          created_at?: string | null
          id?: string
          partner_id?: string
          requester_id?: string
          status?: string
          subjects?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      weekend_connection_requests: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          plan_id: string
          requester_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          plan_id: string
          requester_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          plan_id?: string
          requester_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weekend_connection_requests_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "weekend_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      weekend_interests: {
        Row: {
          assessment_completed: boolean | null
          budget_range: string
          created_at: string | null
          energy_level: string
          favorite_activities: Json
          id: string
          parent_permission_level: string
          preferred_group_size: string
          preferred_timings: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assessment_completed?: boolean | null
          budget_range: string
          created_at?: string | null
          energy_level: string
          favorite_activities?: Json
          id?: string
          parent_permission_level: string
          preferred_group_size: string
          preferred_timings?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assessment_completed?: boolean | null
          budget_range?: string
          created_at?: string | null
          energy_level?: string
          favorite_activities?: Json
          id?: string
          parent_permission_level?: string
          preferred_group_size?: string
          preferred_timings?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      weekend_matches: {
        Row: {
          activity_name: string
          activity_type: string
          compatibility_score: number | null
          conversation_starters: Json | null
          created_at: string | null
          estimated_cost: string | null
          expires_at: string
          id: string
          is_acted_on: boolean | null
          is_viewed: boolean | null
          match_reason: string
          match_type: string
          suggested_timing: string | null
          target_plan_id: string | null
          target_user_id: string | null
          user_id: string
        }
        Insert: {
          activity_name: string
          activity_type: string
          compatibility_score?: number | null
          conversation_starters?: Json | null
          created_at?: string | null
          estimated_cost?: string | null
          expires_at: string
          id?: string
          is_acted_on?: boolean | null
          is_viewed?: boolean | null
          match_reason: string
          match_type: string
          suggested_timing?: string | null
          target_plan_id?: string | null
          target_user_id?: string | null
          user_id: string
        }
        Update: {
          activity_name?: string
          activity_type?: string
          compatibility_score?: number | null
          conversation_starters?: Json | null
          created_at?: string | null
          estimated_cost?: string | null
          expires_at?: string
          id?: string
          is_acted_on?: boolean | null
          is_viewed?: boolean | null
          match_reason?: string
          match_type?: string
          suggested_timing?: string | null
          target_plan_id?: string | null
          target_user_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekend_matches_target_plan_id_fkey"
            columns: ["target_plan_id"]
            isOneToOne: false
            referencedRelation: "weekend_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      weekend_plan_participants: {
        Row: {
          id: string
          joined_at: string | null
          plan_id: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          plan_id: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          plan_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekend_plan_participants_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "weekend_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      weekend_plans: {
        Row: {
          activity_type: string
          budget_estimate: string | null
          category: string
          created_at: string | null
          current_participants: number | null
          description: string | null
          duration_hours: number | null
          expires_at: string
          id: string
          is_active: boolean | null
          location: string | null
          max_participants: number | null
          planned_date: string
          requirements: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          budget_estimate?: string | null
          category: string
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          duration_hours?: number | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          max_participants?: number | null
          planned_date: string
          requirements?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          budget_estimate?: string | null
          category?: string
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          duration_hours?: number | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          max_participants?: number | null
          planned_date?: string
          requirements?: string | null
          title?: string
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
