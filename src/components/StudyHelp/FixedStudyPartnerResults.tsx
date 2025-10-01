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
  School
} from "lucide-react";

interface StudyPartner {
  id: string;
  name: string;
  grade: number;
  school_name: string;
  canHelp: string[];
  needsHelp: string[];
  complementarySubjects: string[];
  profileScore: number;
  favoriteSubjects: string[];
  strugglingSubjects: string[];
}

interface FixedStudyPartnerResultsProps {
  userProfile: any;
}

const FixedStudyPartnerResults = ({ userProfile }: FixedStudyPartnerResultsProps) => {
  const [studyPartners, setStudyPartners] = useState<StudyPartner[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile && user) {
      loadUserProfile();
      findStudyPartners();
    }
  }, [userProfile, user]);

  const loadUserProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setCurrentUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const findStudyPartners = async () => {
    if (!user) return;

    try {
      // Get current user's profile and academic data
      const { data: currentUserProfile, error: userProfileError } = await supabase
        .from('profiles')
        .select('school_name, grade')
        .eq('user_id', user.id)
        .single();

      if (userProfileError) throw userProfileError;

      // Get all academic profiles excluding current user
      const { data: academicProfiles, error: academicError } = await supabase
        .from('academic_profiles')
        .select('*')
        .neq('user_id', user.id)
        .eq('assessment_completed', true);

      if (academicError) throw academicError;

      if (!academicProfiles || academicProfiles.length === 0) {
        setStudyPartners([]);
        setLoading(false);
        return;
      }

      // Get profile information for these users
      const userIds = academicProfiles.map(profile => profile.user_id);
      const { data: userProfiles, error: userProfilesError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, grade, school_name')
        .in('user_id', userIds);

      if (userProfilesError) throw userProfilesError;

      // Filter by same school and similar grade, then calculate complementary matches
      const schoolPeers = academicProfiles.filter(academicProfile => {
        const profile = userProfiles?.find(p => p.user_id === academicProfile.user_id);
        return profile && 
               profile.school_name === currentUserProfile.school_name &&
               Math.abs(profile.grade - currentUserProfile.grade) <= 1;
      });

      // Calculate complementary matches with current user's academic profile
      const userHelpNeeded = Array.isArray(userProfile.help_needed_subjects) 
        ? userProfile.help_needed_subjects 
        : [];
      const userCanTeach = Array.isArray(userProfile.teaching_subjects) 
        ? userProfile.teaching_subjects 
        : [];

      const matches = schoolPeers.map(academicProfile => {
        const profile = userProfiles?.find(p => p.user_id === academicProfile.user_id);
        if (!profile) return null;

        const peerCanTeach = Array.isArray(academicProfile.teaching_subjects) 
          ? academicProfile.teaching_subjects 
          : [];
        const peerNeedsHelp = Array.isArray(academicProfile.help_needed_subjects) 
          ? academicProfile.help_needed_subjects 
          : [];
        
        // What peer can help current user with
        const canHelp = userHelpNeeded.filter(subject =>
          peerCanTeach.includes(subject)
        );
        
        // What current user can help peer with
        const needsHelp = userCanTeach.filter(subject =>
          peerNeedsHelp.includes(subject)
        );
        
        const complementarySubjects = [...new Set([...canHelp, ...needsHelp])];
        const profileScore = complementarySubjects.length;

        return {
          id: academicProfile.user_id,
          name: `${profile.first_name || 'Student'} ${profile.last_name || ''}`.trim(),
          grade: profile.grade,
          school_name: profile.school_name,
          canHelp,
          needsHelp,
          complementarySubjects,
          profileScore,
          favoriteSubjects: Array.isArray(academicProfile.favorite_subjects) 
            ? academicProfile.favorite_subjects 
            : [],
          strugglingSubjects: Array.isArray(academicProfile.struggle_subjects) 
            ? academicProfile.struggle_subjects 
            : []
        };
      })
      .filter(match => match && match.profileScore > 0) // Only show students with complementary subjects
      .sort((a, b) => (b?.profileScore || 0) - (a?.profileScore || 0))
      .slice(0, 8) as StudyPartner[]; // Limit to top 8 matches

      setStudyPartners(matches);
    } catch (error: any) {
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
          connection_type: "study_partnership"
        });

      if (error) throw error;

      setConnectionRequests(prev => new Set([...prev, partnerId]));
      toast({
        title: "Study Request Sent!",
        description: "Your study partner request has been sent. They'll be notified to respond.",
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
    if (subjectLower.includes("math") || subjectLower.includes("calculus") || subjectLower.includes("algebra")) return Calculator;
    if (subjectLower.includes("english") || subjectLower.includes("literature") || subjectLower.includes("writing")) return BookOpen;
    if (subjectLower.includes("science") || subjectLower.includes("biology") || subjectLower.includes("chemistry") || subjectLower.includes("physics")) return FlaskConical;
    if (subjectLower.includes("computer") || subjectLower.includes("programming") || subjectLower.includes("coding")) return Code;
    if (subjectLower.includes("art") || subjectLower.includes("music") || subjectLower.includes("drama")) return Palette;
    return GraduationCap;
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Finding study partners at your school...</p>
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
            Study Partners at {currentUserProfile?.school_name}
          </h1>
          <p className="text-lg text-muted-foreground">
            Students with complementary academic strengths who can help you succeed
          </p>
        </div>
      </div>

      {/* Study Partners */}
      {studyPartners.length === 0 ? (
        <Card className="p-8 border-4 border-yellow-300 bg-yellow-50 text-center">
          <div className="space-y-4">
            <School className="h-12 w-12 text-yellow-600 mx-auto" />
            <h3 className="text-xl font-semibold text-foreground">No Study Partners Found Yet</h3>
            <p className="text-muted-foreground">
              We couldn't find students with complementary academic profiles at your school right now. 
              This could mean:
            </p>
            <ul className="text-muted-foreground text-sm space-y-1">
              <li>• You're one of the first to complete the academic assessment</li>
              <li>• Other students haven't indicated they can help with subjects you need</li>
              <li>• Other students haven't indicated they need help with subjects you excel in</li>
            </ul>
            <p className="text-muted-foreground text-sm">
              Check back later as more students complete their assessments!
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <School className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Showing {studyPartners.length} students from {currentUserProfile?.school_name}
            </span>
          </div>

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
                      <p className="text-muted-foreground">{partner.grade}th Grade • {partner.school_name}</p>
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

                {/* Additional Subject Info */}
                {(partner.favoriteSubjects.length > 0 || partner.strugglingSubjects.length > 0) && (
                  <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                    <div className="grid md:grid-cols-2 gap-4">
                      {partner.favoriteSubjects.length > 0 && (
                        <div>
                          <h5 className="font-medium text-foreground mb-2">Their Favorite Subjects:</h5>
                          <div className="flex flex-wrap gap-1">
                            {partner.favoriteSubjects.map((subject, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-green-50 text-green-700">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {partner.strugglingSubjects.length > 0 && (
                        <div>
                          <h5 className="font-medium text-foreground mb-2">Subjects They Find Challenging:</h5>
                          <div className="flex flex-wrap gap-1">
                            {partner.strugglingSubjects.map((subject, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-orange-50 text-orange-700">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
              <span className="font-medium text-foreground">3. Exchange Contact</span>
              <p>Coordinate study times and meet up</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FixedStudyPartnerResults;