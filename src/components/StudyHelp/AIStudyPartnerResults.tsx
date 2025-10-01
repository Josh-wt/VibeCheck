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
  Code, 
  Palette,
  Users,
  GraduationCap,
  CheckCircle,
  MessageSquare,
  Clock,
  ArrowRight
} from "lucide-react";

interface AIStudyPartner {
  id: string;
  name: string;
  grade: string;
  email: string;
  canHelpWith: string[]; // Their strengths that match my weaknesses
  needsHelpWith: string[]; // Their weaknesses that match my strengths
  matchScore: number;
}

const AIStudyPartnerResults = () => {
  const [studyPartners, setStudyPartners] = useState<AIStudyPartner[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      findAIStudyPartners();
    }
  }, [user]);

  const findAIStudyPartners = async () => {
    try {
      // Get current user's AI-assigned academic tags
      const { data: currentUserProfile, error: currentUserError } = await supabase
        .from("profiles")
        .select("academic_strengths, academic_weaknesses, school_name, ai_analysis_completed")
        .eq("user_id", user?.id)
        .single();

      if (currentUserError) throw currentUserError;

      if (!currentUserProfile?.ai_analysis_completed) {
        console.log('User has not completed AI analysis yet');
        setLoading(false);
        return;
      }

      const myStrengths = currentUserProfile.academic_strengths || [];
      const myWeaknesses = currentUserProfile.academic_weaknesses || [];

      // Get all other users from same school with AI analysis completed
      const { data: otherProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, grade, email, academic_strengths, academic_weaknesses")
        .eq("school_name", currentUserProfile.school_name)
        .eq("ai_analysis_completed", true)
        .neq("user_id", user?.id);

      if (profilesError) throw profilesError;

      // Find complementary matches: their strengths match my weaknesses & vice versa
      const matches = otherProfiles
        ?.map(profile => {
          const theirStrengths = profile.academic_strengths || [];
          const theirWeaknesses = profile.academic_weaknesses || [];

          // Subjects they can help me with (they're strong, I'm weak)
          const canHelpWith = myWeaknesses.filter(subject =>
            theirStrengths.includes(subject)
          );

          // Subjects I can help them with (I'm strong, they're weak)
          const needsHelpWith = theirWeaknesses.filter(subject =>
            myStrengths.includes(subject)
          );

          const matchScore = canHelpWith.length + needsHelpWith.length;

          // Only include if there's at least one complementary subject
          if (matchScore === 0) return null;

          return {
            id: profile.user_id,
            name: `${profile.first_name || 'Student'} ${profile.last_name || ''}`.trim(),
            grade: `${profile.grade}th Grade`,
            email: profile.email,
            canHelpWith,
            needsHelpWith,
            matchScore
          };
        })
        .filter(match => match !== null)
        .sort((a, b) => (b?.matchScore || 0) - (a?.matchScore || 0))
        .slice(0, 8) as AIStudyPartner[];

      setStudyPartners(matches || []);
    } catch (error: any) {
      console.error('Error finding AI study partners:', error);
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
          subject: subjects.join(', '),
          status: 'pending'
        });

      if (error) throw error;

      setConnectionRequests(prev => new Set([...prev, partnerId]));
      toast({
        title: "Study Request Sent! 🎓",
        description: "Your study partner request has been sent.",
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
    const subjectLower = subject.toLowerCase();
    if (subjectLower.includes("math")) return Calculator;
    if (subjectLower.includes("english")) return BookOpen;
    if (subjectLower.includes("science") || subjectLower.includes("biology") || 
        subjectLower.includes("chemistry") || subjectLower.includes("physics")) return FlaskConical;
    if (subjectLower.includes("computer") || subjectLower.includes("coding")) return Code;
    if (subjectLower.includes("art")) return Palette;
    return GraduationCap;
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Finding your perfect study partners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20">
          <Users className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Your AI-Matched Study Partners
          </h1>
          <p className="text-lg text-muted-foreground">
            Students matched based on complementary academic strengths and weaknesses
          </p>
        </div>
      </div>

      {/* Study Partners */}
      {studyPartners.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-xl font-semibold">No Study Partners Yet</h3>
            <p className="text-muted-foreground">
              Complete your friendship quiz to get AI-analyzed, or check back as more students join!
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {studyPartners.map((partner, index) => (
            <Card 
              key={partner.id}
              className="p-8 hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-6">
                {/* Partner Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <GraduationCap className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{partner.name}</h3>
                      <p className="text-muted-foreground">{partner.grade}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="px-3 py-1">
                    {partner.matchScore} Subject Match{partner.matchScore !== 1 ? 'es' : ''}
                  </Badge>
                </div>

                {/* Academic Exchange */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* They Can Help You */}
                  {partner.canHelpWith.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <h4 className="font-semibold">They Can Help You With:</h4>
                      </div>
                      <div className="space-y-2">
                        {partner.canHelpWith.map((subject, idx) => {
                          const Icon = getSubjectIcon(subject);
                          return (
                            <div key={idx} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                              <Icon className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium">{subject}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* You Can Help Them */}
                  {partner.needsHelpWith.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <ArrowRight className="h-5 w-5 text-blue-500" />
                        <h4 className="font-semibold">You Can Help Them With:</h4>
                      </div>
                      <div className="space-y-2">
                        {partner.needsHelpWith.map((subject, idx) => {
                          const Icon = getSubjectIcon(subject);
                          return (
                            <div key={idx} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                              <Icon className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">{subject}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Study Suggestions */}
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                    <h4 className="font-semibold">Study Session Ideas:</h4>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="font-medium text-purple-600">• Reciprocal Tutoring</p>
                      <p className="text-muted-foreground">Trade expertise in your strong subjects</p>
                    </div>
                    <div>
                      <p className="font-medium text-purple-600">• Homework Help</p>
                      <p className="text-muted-foreground">Quick questions and problem solving</p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center">
                  {connectionRequests.has(partner.id) ? (
                    <Button disabled variant="outline">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Request Sent!
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleStudyRequest(partner.id, [...partner.canHelpWith, ...partner.needsHelpWith])}
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
    </div>
  );
};

export default AIStudyPartnerResults;
