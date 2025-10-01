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
          availability: string[] | null
          created_at: string | null
          favorite_subjects: string[] | null
          help_needed_subjects: string[] | null
          id: string
          struggle_subjects: string[] | null
          study_style: string | null
          teaching_subjects: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assessment_completed?: boolean | null
          availability?: string[] | null
          created_at?: string | null
          favorite_subjects?: string[] | null
          help_needed_subjects?: string[] | null
          id?: string
          struggle_subjects?: string[] | null
          study_style?: string | null
          teaching_subjects?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assessment_completed?: boolean | null
          availability?: string[] | null
          created_at?: string | null
          favorite_subjects?: string[] | null
          help_needed_subjects?: string[] | null
          id?: string
          struggle_subjects?: string[] | null
          study_style?: string | null
          teaching_subjects?: string[] | null
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
          location?: string | null
          max_members?: number | null
          meeting_times?: string | null
          name?: string
        }
        Relationships: []
      }
      activity_participation: {
        Row: {
          activity_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          activity_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          activity_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_activity_participation_activity"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_profiles: {
        Row: {
          activity_goals: string[] | null
          created_at: string | null
          current_activities: string[] | null
          id: string
          interested_activities: string[] | null
          leadership_interest: boolean | null
          time_commitment: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_goals?: string[] | null
          created_at?: string | null
          current_activities?: string[] | null
          id?: string
          interested_activities?: string[] | null
          leadership_interest?: boolean | null
          time_commitment?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_goals?: string[] | null
          created_at?: string | null
          current_activities?: string[] | null
          id?: string
          interested_activities?: string[] | null
          leadership_interest?: boolean | null
          time_commitment?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      club_interest: {
        Row: {
          created_at: string | null
          id: string
          proposal_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          proposal_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          proposal_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_club_interest_proposal"
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
          description: string | null
          id: string
          interest_count: number | null
          location: string | null
          max_members: number | null
          meeting_times: string | null
          min_members: number | null
          name: string
          proposed_by: string
          status: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          interest_count?: number | null
          location?: string | null
          max_members?: number | null
          meeting_times?: string | null
          min_members?: number | null
          name: string
          proposed_by: string
          status?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          interest_count?: number | null
          location?: string | null
          max_members?: number | null
          meeting_times?: string | null
          min_members?: number | null
          name?: string
          proposed_by?: string
          status?: string | null
        }
        Relationships: []
      }
      connections: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      onboarding_progress: {
        Row: {
          academic_assessment_completed: boolean | null
          activity_onboarding_completed: boolean | null
          created_at: string | null
          friendship_discovery_completed: boolean | null
          id: string
          updated_at: string | null
          user_id: string
          weekend_assessment_completed: boolean | null
        }
        Insert: {
          academic_assessment_completed?: boolean | null
          activity_onboarding_completed?: boolean | null
          created_at?: string | null
          friendship_discovery_completed?: boolean | null
          id?: string
          updated_at?: string | null
          user_id: string
          weekend_assessment_completed?: boolean | null
        }
        Update: {
          academic_assessment_completed?: boolean | null
          activity_onboarding_completed?: boolean | null
          created_at?: string | null
          friendship_discovery_completed?: boolean | null
          id?: string
          updated_at?: string | null
          user_id?: string
          weekend_assessment_completed?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          academic_strengths: string[] | null
          academic_weaknesses: string[] | null
          ai_analysis_completed: boolean | null
          created_at: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          grade: string | null
          id: string
          last_name: string | null
          quiz_responses: Json | null
          school_name: string | null
          social_group: string | null
          social_group_analysis: Json | null
          social_group_updated_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          academic_strengths?: string[] | null
          academic_weaknesses?: string[] | null
          ai_analysis_completed?: boolean | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          grade?: string | null
          id?: string
          last_name?: string | null
          quiz_responses?: Json | null
          school_name?: string | null
          social_group?: string | null
          social_group_analysis?: Json | null
          social_group_updated_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          academic_strengths?: string[] | null
          academic_weaknesses?: string[] | null
          ai_analysis_completed?: boolean | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          grade?: string | null
          id?: string
          last_name?: string | null
          quiz_responses?: Json | null
          school_name?: string | null
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
          characteristics: Json | null
          communication_style: string | null
          created_at: string | null
          description: string | null
          id: string
          ideal_activities: Json | null
          name: string
        }
        Insert: {
          characteristics?: Json | null
          communication_style?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          ideal_activities?: Json | null
          name: string
        }
        Update: {
          characteristics?: Json | null
          communication_style?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          ideal_activities?: Json | null
          name?: string
        }
        Relationships: []
      }
      study_connections: {
        Row: {
          created_at: string | null
          id: string
          partner_id: string
          requester_id: string
          status: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          partner_id: string
          requester_id: string
          status?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          partner_id?: string
          requester_id?: string
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      weekend_connection_requests: {
        Row: {
          activity_preference: string | null
          created_at: string | null
          id: string
          recipient_id: string
          requester_id: string
          status: string | null
        }
        Insert: {
          activity_preference?: string | null
          created_at?: string | null
          id?: string
          recipient_id: string
          requester_id: string
          status?: string | null
        }
        Update: {
          activity_preference?: string | null
          created_at?: string | null
          id?: string
          recipient_id?: string
          requester_id?: string
          status?: string | null
        }
        Relationships: []
      }
      weekend_interests: {
        Row: {
          budget_range: string | null
          created_at: string | null
          energy_level: string | null
          favorite_activities: string[] | null
          id: string
          parent_permission_level: string | null
          preferred_group_size: string | null
          preferred_timings: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_range?: string | null
          created_at?: string | null
          energy_level?: string | null
          favorite_activities?: string[] | null
          id?: string
          parent_permission_level?: string | null
          preferred_group_size?: string | null
          preferred_timings?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_range?: string | null
          created_at?: string | null
          energy_level?: string | null
          favorite_activities?: string[] | null
          id?: string
          parent_permission_level?: string | null
          preferred_group_size?: string | null
          preferred_timings?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      weekend_plan_participants: {
        Row: {
          id: string
          joined_at: string | null
          plan_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          plan_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          plan_id?: string
          status?: string | null
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
          activity_type: string | null
          budget_estimate: string | null
          budget_range: string | null
          category: string | null
          created_at: string | null
          current_participants: number | null
          date_time: string | null
          description: string | null
          duration_hours: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          location: string | null
          max_participants: number | null
          organizer_id: string
          planned_date: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          activity_type?: string | null
          budget_estimate?: string | null
          budget_range?: string | null
          category?: string | null
          created_at?: string | null
          current_participants?: number | null
          date_time?: string | null
          description?: string | null
          duration_hours?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          max_participants?: number | null
          organizer_id: string
          planned_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string | null
          budget_estimate?: string | null
          budget_range?: string | null
          category?: string | null
          created_at?: string | null
          current_participants?: number | null
          date_time?: string | null
          description?: string | null
          duration_hours?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          max_participants?: number | null
          organizer_id?: string
          planned_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
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
