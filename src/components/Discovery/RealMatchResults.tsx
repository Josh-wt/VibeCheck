import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Heart, 
  Calendar, 
  ArrowLeft,
  BookOpen,
  MessageCircle,
  Brain
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface RealMatchResultsProps {
  onBackToQuiz?: () => void;
  onNavigateToPage?: (path: string) => void;
}

interface StudentMatch {
  id: string;
  name: string;
  grade: number;
  school_name: string;
  social_group: string;
}

const RealMatchResults = ({ onBackToQuiz, onNavigateToPage }: RealMatchResultsProps) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<StudentMatch[]>([]);
  const [socialGroupDetails, setSocialGroupDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connectedStudents, setConnectedStudents] = useState<Set<string>>(new Set());
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadUserDataAndMatches();
    }
  }, [user]);

  const loadUserDataAndMatches = async () => {
    if (!user) return;

    console.log('🚀 [MATCHES] Loading for user:', user.id);

    try {
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('👤 [PROFILE]', {
        hasProfile: !!userProfile,
        socialGroup: userProfile?.social_group,
        schoolName: userProfile?.school_name
      });

      if (userError) throw userError;
      setCurrentUserProfile(userProfile);

      if (!userProfile.social_group) {
        console.log('⏳ [WAIT] No social group yet, polling...');
        // Poll for social group assignment
        let attempts = 0;
        const maxAttempts = 10;
        
        const pollInterval = setInterval(async () => {
          attempts++;
          console.log(`🔄 [POLL] Attempt ${attempts}/${maxAttempts}`);
          
          const { data: updatedProfile, error: pollError } = await supabase
            .from('profiles')
            .select('social_group, social_group_analysis')
            .eq('user_id', user.id)
            .single();

          if (pollError) {
            console.error('❌ [POLL] Error:', pollError);
            clearInterval(pollInterval);
            setLoading(false);
            return;
          }

          if (updatedProfile?.social_group || attempts >= maxAttempts) {
            console.log('✅ [RESULT] Social group:', updatedProfile?.social_group || 'timeout');
            clearInterval(pollInterval);
            
            if (updatedProfile?.social_group) {
              setCurrentUserProfile({ ...userProfile, ...updatedProfile });
              
              // Fetch group details
              const { data: groupData } = await supabase
                .from('social_groups')
                .select('*')
                .eq('name', updatedProfile.social_group)
                .single();
              
              if (groupData) setSocialGroupDetails(groupData);
              
              // Find group members
              await findGroupMembers(updatedProfile.social_group, userProfile.school_name);
            }
            
            setLoading(false);
          }
        }, 2000); // Check every 2 seconds
        
        return;
      }

      // User already has social group
      const { data: groupData } = await supabase
        .from('social_groups')
        .select('*')
        .eq('name', userProfile.social_group)
        .single();
      
      if (groupData) setSocialGroupDetails(groupData);
      
      await findGroupMembers(userProfile.social_group, userProfile.school_name);
      setLoading(false);
      
    } catch (error) {
      console.error('❌ [ERROR] Loading data:', error);
      setLoading(false);
    }
  };

  const findGroupMembers = async (socialGroup: string, schoolName: string) => {
    if (!socialGroup || !schoolName || !user) return;

    console.log('🔍 Finding group members for:', {
      userId: user.id,
      socialGroup,
      schoolName
    });

    try {
      // Find other students with the same social group and school
      const { data: groupMembers, error } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, grade, school_name, social_group')
        .eq('social_group', socialGroup)
        .eq('school_name', schoolName)
        .neq('user_id', user.id)
        .not('first_name', 'is', null)
        .not('last_name', 'is', null);

      console.log('📊 Query results:', { 
        foundMembers: groupMembers?.length || 0,
        error: error?.message,
        members: groupMembers 
      });

      if (error) throw error;

      const transformedMatches = groupMembers?.map((member) => ({
        id: member.user_id,
        name: `${member.first_name} ${member.last_name}`,
        grade: parseInt(member.grade) || 0,
        school_name: member.school_name,
        social_group: member.social_group
      })) || [];

      console.log('✅ Transformed matches:', transformedMatches);
      setMatches(transformedMatches);
    } catch (error) {
      console.error('❌ Error finding group members:', error);
    }
  };

  const handleConnectClick = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from("connections")
        .insert({
          user1_id: user?.id,
          user2_id: studentId,
          connection_type: "friendship"
        });

      if (error) throw error;

      setConnectedStudents(prev => new Set([...prev, studentId]));
    } catch (error) {
      console.error('Error connecting:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
        <span>Finding your group members...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Your Interest Group</h1>
        {onBackToQuiz && (
          <Button variant="outline" onClick={onBackToQuiz} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Retake Quiz</span>
          </Button>
        )}
      </div>

      {/* User Group Card */}
      {socialGroupDetails && (
        <Card className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
          <div className="text-center space-y-6">
            <div className="text-6xl">🎓</div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                You're a {socialGroupDetails.name}!
              </h2>
              <p className="text-muted-foreground mb-4">{socialGroupDetails.description}</p>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Interest-Based Matching
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Group Members */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Students in Your Group at {currentUserProfile?.school_name}</h2>
        </div>
        
        {matches.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No group members found yet</h3>
            <p className="text-muted-foreground">
              Be one of the first students in your group at your school! 
              As more students complete their assessments and get placed in your group, you'll see them here.
            </p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {matches.map((student) => (
              <Card key={student.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{student.name}</h3>
                      <p className="text-muted-foreground">{student.grade}th Grade • {student.social_group}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-50 text-green-600 border-green-200">
                    Same Group
                  </Badge>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    You're both in the {student.social_group} group, which means you share similar interests and social preferences. This is a great foundation for friendship!
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button
                        variant={connectedStudents.has(student.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleConnectClick(student.id)}
                        disabled={connectedStudents.has(student.id)}
                        className="flex items-center space-x-1"
                      >
                        <Heart className="h-4 w-4" />
                        <span>{connectedStudents.has(student.id) ? "Connected" : "Connect"}</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Message</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
        <Button 
          onClick={() => onNavigateToPage?.('/study-help')}
          className="flex-1 flex items-center space-x-2"
        >
          <BookOpen className="h-4 w-4" />
          <span>Find Study Partners</span>
        </Button>
        
        <Button 
          onClick={() => onNavigateToPage?.('/activities')}
          variant="outline"
          className="flex-1 flex items-center space-x-2"
        >
          <Users className="h-4 w-4" />
          <span>Explore Activities</span>
        </Button>
        
        <Button 
          onClick={() => onNavigateToPage?.('/weekend-plans')}
          variant="outline"
          className="flex-1 flex items-center space-x-2"
        >
          <Calendar className="h-4 w-4" />
          <span>Weekend Plans</span>
        </Button>
      </div>
    </div>
  );
};

export default RealMatchResults;