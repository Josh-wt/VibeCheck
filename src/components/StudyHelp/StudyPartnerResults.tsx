import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BookOpen, 
  Calculator, 
  FlaskConical, 
  Globe, 
  Code, 
  Palette,
  Users,
  GraduationCap,
  CheckCircle,
  MessageSquare,
  Clock
} from "lucide-react";

interface StudyPartner {
  id: string;
  name: string;
  grade: string;
  email: string;
  canHelp: string[];
  needsHelp: string[];
  complementarySubjects: string[];
  profileScore: number;
}

interface StudyPartnerResultsProps {
  userProfile: any;
}

const StudyPartnerResults = ({ userProfile }: StudyPartnerResultsProps) => {
  const [studyPartners, setStudyPartners] = useState<StudyPartner[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile && user) {
      findStudyPartners();
    }
  }, [userProfile, user]);

  const findStudyPartners = async () => {
    try {
      // Get current user's academic profile
      const { data: currentUserAcademic, error: currentUserError } = await supabase
        .from("academic_profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (currentUserError || !currentUserAcademic) {
        console.error('No academic profile found for current user');
        setLoading(false);
        return;
      }

      // Get current user's school
      const { data: currentUserProfile, error: profileError } = await supabase
        .from("profiles")
        .select("school_name")
        .eq("user_id", user?.id)
        .single();

      if (profileError) throw profileError;

      // Get all academic profiles from same school except current user
      const { data: profiles, error: profilesError } = await supabase
        .from("academic_profiles")
        .select(`
          user_id,
          favorite_subjects,
          struggle_subjects,
          teaching_subjects,
          help_needed_subjects,
          assessment_completed
        `)
        .neq("user_id", user?.id)
        .eq("assessment_completed", true);

      if (profilesError) throw profilesError;

      // Get user profile data for the academic profiles
      const userIds = profiles?.map(p => p.user_id) || [];
      const { data: userProfiles, error: userProfilesError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, grade, email, school_name")
        .in("user_id", userIds)
        .eq("school_name", currentUserProfile.school_name); // Only same school

      if (userProfilesError) throw userProfilesError;

      // Direct subject-based matching
      const matches = profiles?.map(academicProfile => {
        const userProfileData = userProfiles?.find(up => up.user_id === academicProfile.user_id);
        if (!userProfileData) return null;

        // Find subjects where they can help me (I need help, they can teach)
        const canHelp = (currentUserAcademic.help_needed_subjects as string[]).filter((subject: string) =>
          (academicProfile.teaching_subjects as string[]).includes(subject)
        );
        
        // Find subjects where I can help them (I can teach, they need help)
        const needsHelp = (currentUserAcademic.teaching_subjects as string[]).filter((subject: string) =>
          (academicProfile.help_needed_subjects as string[]).includes(subject)
        );
        
        const complementarySubjects = [...new Set([...canHelp, ...needsHelp])];
        const profileScore = complementarySubjects.length;

        // Only include if there's at least one complementary subject
        if (profileScore === 0) return null;

        return {
          id: academicProfile.user_id,
          name: `${userProfileData.first_name || 'Student'} ${userProfileData.last_name || ''}`.trim(),
          grade: `${userProfileData.grade}th Grade`,
          email: userProfileData.email,
          canHelp,
          needsHelp,
          complementarySubjects,
          profileScore
        };
      })
      .filter(match => match !== null) // Remove null matches
      .sort((a, b) => (b?.profileScore || 0) - (a?.profileScore || 0)) // Sort by number of complementary subjects
      .slice(0, 8) || []; // Show top 8 matches

      setStudyPartners(matches.filter(m => m !== null) as StudyPartner[]);
    } catch (error: any) {
      console.error('Error finding study partners:', error);
      toast({
        title: "Error",
        description: "Failed to find study partners",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStudyRequest = async (partnerId: string, subjects: string[]) => {
    try {
      const { error } = await supabase
        .from("study_connections")
        .insert({
          requester_id: user?.id,
          partner_id: partnerId,
          subjects,
          connection_type: "study_request"
        });

      if (error) throw error;

      setConnectionRequests(prev => new Set([...prev, partnerId]));
      toast({
        title: "Study Request Sent!",
        description: "Your study partner request has been sent. They'll receive your school email when they accept.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getSubjectIcon = (subject: string) => {
    if (subject.includes("Math")) return Calculator;
    if (subject.includes("English")) return BookOpen;
    if (subject.includes("Science") || subject.includes("Biology") || subject.includes("Chemistry") || subject.includes("Physics")) return FlaskConical;
    if (subject.includes("Computer")) return Code;
    if (subject.includes("Art")) return Palette;
    return GraduationCap;
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Finding your perfect study partners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-200 border-4 border-blue-300">
          <Users className="h-10 w-10 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Your Study Partners
          </h1>
          <p className="text-lg text-muted-foreground">
            Students who can help with subjects you struggle with, and who need help with subjects you're good at
          </p>
        </div>
      </div>

      {/* Study Partners */}
      {studyPartners.length === 0 ? (
        <Card className="p-8 border-4 border-yellow-300 bg-yellow-50 text-center">
          <div className="space-y-4">
            <GraduationCap className="h-12 w-12 text-yellow-600 mx-auto" />
            <h3 className="text-xl font-semibold text-foreground">No Study Partners Found</h3>
            <p className="text-muted-foreground">
              We couldn't find students with complementary academic profiles right now. 
              Check back later as more students complete their assessments!
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {studyPartners.map((partner, index) => (
            <Card 
              key={partner.id}
              className="p-8 border-4 border-blue-200 bg-blue-50 hover:border-blue-400 transition-all duration-300 shadow-lg animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-6">
                {/* Partner Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-blue-200 border-4 border-blue-300 flex items-center justify-center">
                      <GraduationCap className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {partner.name}
                      </h3>
                      <p className="text-muted-foreground">{partner.grade}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-200 text-green-800 font-semibold px-3 py-1">
                    {partner.profileScore} Subject{partner.profileScore !== 1 ? 's' : ''} Match
                  </Badge>
                </div>

                {/* Academic Exchange */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* They Can Help You */}
                  {partner.canHelp.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <h4 className="font-semibold text-foreground">They Can Help You With:</h4>
                      </div>
                      <div className="space-y-2">
                        {partner.canHelp.map((subject, idx) => {
                          const Icon = getSubjectIcon(subject);
                          return (
                            <div key={idx} className="flex items-center space-x-3 p-3 bg-green-100 rounded-lg">
                              <Icon className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-foreground">{subject}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* You Can Help Them */}
                  {partner.needsHelp.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        <h4 className="font-semibold text-foreground">You Can Help Them With:</h4>
                      </div>
                      <div className="space-y-2">
                        {partner.needsHelp.map((subject, idx) => {
                          const Icon = getSubjectIcon(subject);
                          return (
                            <div key={idx} className="flex items-center space-x-3 p-3 bg-blue-100 rounded-lg">
                              <Icon className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-foreground">{subject}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Study Suggestions */}
                <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                    <h4 className="font-semibold text-foreground">Study Session Ideas:</h4>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                      <p className="font-medium text-purple-600">• Reciprocal Tutoring</p>
                      <p className="text-muted-foreground">Trade expertise in your strong subjects</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-purple-600">• Study Groups</p>
                      <p className="text-muted-foreground">Form focused groups for exam prep</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-purple-600">• Homework Help</p>
                      <p className="text-muted-foreground">Quick questions and problem solving</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-purple-600">• Test Preparation</p>
                      <p className="text-muted-foreground">Quiz each other before exams</p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center">
                  {connectionRequests.has(partner.id) ? (
                    <Button disabled className="bg-green-500 text-white px-8 py-3">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Study Request Sent!
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleStudyRequest(partner.id, partner.complementarySubjects)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Request Study Partnership
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Help Note */}
      <Card className="p-6 border-4 border-green-300 bg-green-50 text-center">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">How Study Partnerships Work</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">1. Send Request</span>
              <p>Click to request a study partnership</p>
            </div>
            <div>
              <span className="font-medium text-foreground">2. They Accept</span>
              <p>Both students agree to help each other</p>
            </div>
            <div>
              <span className="font-medium text-foreground">3. Exchange Emails</span>
              <p>School emails shared to coordinate study times</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudyPartnerResults;