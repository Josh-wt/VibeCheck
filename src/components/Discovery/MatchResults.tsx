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
  Gamepad2,
  Palette,
  Mountain,
  Laptop,
  Music,
  Book,
  Trophy,
  Lightbulb,
  Smile,
  Eye,
  Hammer,
  Crown,
  Coffee,
  Zap,
  Target,
  Brain,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ExpandedProfile from "./ExpandedProfile";

interface MatchResultsProps {
  answers: string[];
  onBackToQuiz?: () => void;
  onNavigateToPage?: (path: string) => void;
}

const MatchResults = ({ answers, onBackToQuiz, onNavigateToPage }: MatchResultsProps) => {
  const { user } = useAuth();
  const [aiSocialGroup, setAiSocialGroup] = useState<any>(null);
  const [socialGroupDetails, setSocialGroupDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [expandedProfiles, setExpandedProfiles] = useState<Set<string>>(new Set());
  const [connectedStudents, setConnectedStudents] = useState<Set<string>>(new Set());
  const [meetingRequests, setMeetingRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAISocialGroup();
  }, [user]);

  const loadAISocialGroup = async () => {
    if (!user) return;

    try {
      // Get user's AI-determined social group
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('social_group, social_group_analysis')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.social_group) {
        setAiSocialGroup(profile.social_group_analysis);

        // Get group details
        const { data: groupData, error: groupError } = await supabase
          .from('social_groups')
          .select('*')
          .eq('name', profile.social_group)
          .single();

        if (groupError) throw groupError;
        setSocialGroupDetails(groupData);
      }
    } catch (error) {
      console.error('Error loading AI social group:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fallback logic only if AI hasn't determined a group yet
  const getFallbackGroup = (answers: string[]) => {
    const patterns = answers.join(" ").toLowerCase();
    
    if (patterns.includes("reading") || patterns.includes("writing") || patterns.includes("stories")) {
      return "Bookworms & Storytellers";
    } else if (patterns.includes("gaming") || patterns.includes("games") || patterns.includes("strategically")) {
      return "Social Gamers";
    } else if (patterns.includes("art") || patterns.includes("creative") || patterns.includes("beautiful")) {
      return "Creative Introverts";
    } else if (patterns.includes("outdoor") || patterns.includes("active") || patterns.includes("sports")) {
      return "Outdoor Adventurers";
    } else if (patterns.includes("tech") || patterns.includes("coding") || patterns.includes("technology")) {
      return "Tech Enthusiasts";
    } else if (patterns.includes("performing") || patterns.includes("music") || patterns.includes("theater") || patterns.includes("audience")) {
      return "Performance Artists";
    } else {
      return "Social Butterflies";
    }
  };

  // Use AI-determined group if available, otherwise use fallback
  const userGroup = aiSocialGroup && socialGroupDetails 
    ? socialGroupDetails.name 
    : getFallbackGroup(answers);

  const getGroupIcon = (groupName: string) => {
    // AI-determined groups (return emoji strings - keep minimal for functionality)
    const aiGroupIcons: { [key: string]: string } = {
      'Academic Achievers': '🎓',
      'Social Connectors': '🤝',
      'Creative Innovators': '🎨',
      'Athletic Competitors': '🏆',
      'Balanced Explorers': '🌟',
      'Tech Enthusiasts': '💻'
    };

    // Fallback groups (return React components)
    const fallbackIcons: { [key: string]: any } = {
      "Bookworms & Storytellers": BookOpen,
      "Social Gamers": Gamepad2,
      "Creative Introverts": Palette,
      "Outdoor Adventurers": Mountain,
      "Tech Enthusiasts": Laptop,
      "Performance Artists": Music,
      "Community Helpers": Heart,
      "Academic Collaborators": Book,
      "Competitive Athletes": Trophy,
      "Music Lovers": Music,
      "Science Explorers": Lightbulb,
      "Social Butterflies": Smile,
      "Quiet Observers": Eye,
      "Creative Builders": Hammer,
      "Leadership Types": Crown,
      "Chill Hangout Crew": Coffee,
      "Adventure Seekers": Zap,
      "Study Grinders": Target
    };

    // Return AI group icon (emoji) or fallback icon (Lucide component)
    return aiGroupIcons[groupName] || fallbackIcons[groupName] || Users;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
        <span>Loading your results...</span>
      </div>
    );
  }

  const groupIcon = getGroupIcon(userGroup);
  const isAIGroup = aiSocialGroup && socialGroupDetails;

  const mockStudents = [
    {
      id: "1",
      name: "Alex Chen",
      grade: "11th Grade",
      group: userGroup,
      compatibility: "Excellent",
      reason: "You both love storytelling and deep conversations",
      interests: ["reading", "writing", "creative writing"],
      mutualClasses: ["English Literature", "Creative Writing"],
      icon: BookOpen,
      email: "alex.chen@school.edu",
      personalityFactors: ["Thoughtful", "Creative", "Introspective"],
      conversationStarters: ["Favorite book genres", "Writing inspiration", "Literary analysis"],
      mutualConnections: ["Book Club", "Writing Workshop"],
      scheduleCompatibility: "Afternoons work best",
      meetingSpots: ["Library", "Quiet study rooms", "Campus bookstore"]
    },
    {
      id: "2", 
      name: "Morgan Taylor",
      grade: "10th Grade",
      group: userGroup,
      compatibility: "Very Good",
      reason: "You share a passion for literature and intellectual discussions",
      interests: ["books", "literature", "debate"],
      mutualClasses: ["Advanced English", "Philosophy"],
      icon: Book,
      email: "morgan.taylor@school.edu",
      personalityFactors: ["Analytical", "Articulate", "Intellectual"],
      conversationStarters: ["Current reading list", "Debate topics", "Academic goals"],
      mutualConnections: ["Debate Team", "Literature Club"],
      scheduleCompatibility: "Flexible schedule",
      meetingSpots: ["Debate room", "Library discussion areas", "Campus quad"]
    },
    {
      id: "3",
      name: "Jordan Kim",
      grade: "12th Grade", 
      group: userGroup,
      compatibility: "Great",
      reason: "You both express yourselves through creative arts",
      interests: ["creative writing", "music", "arts"],
      mutualClasses: ["Creative Arts", "Music Theory"],
      icon: Palette,
      email: "jordan.kim@school.edu",
      personalityFactors: ["Artistic", "Expressive", "Original"],
      conversationStarters: ["Creative projects", "Musical tastes", "Artistic inspiration"],
      mutualConnections: ["Art Club", "School Band"],
      scheduleCompatibility: "After school hours",
      meetingSpots: ["Art studio", "Music room", "Creative spaces"]
    }
  ];

  const handleConnectClick = (studentId: string) => {
    setConnectedStudents(prev => new Set([...prev, studentId]));
  };

  const handleMeetingClick = (studentId: string) => {
    setMeetingRequests(prev => new Set([...prev, studentId]));
  };

  const toggleExpandProfile = (studentId: string) => {
    setExpandedProfiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const getMatchScore = (student: any) => {
    return isAIGroup ? 95 : 87; // Higher scores for AI-matched groups
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 80) return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-orange-600 bg-orange-50 border-orange-200";
  };

  return (
    <div className="space-y-8">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Your Friendship Profile</h1>
        {onBackToQuiz && (
          <Button variant="outline" onClick={onBackToQuiz} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Retake Quiz</span>
          </Button>
        )}
      </div>

      {/* AI Analysis Badge */}
      {isAIGroup && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6 text-purple-600" />
            <div>
              <h3 className="font-semibold text-purple-800">AI-Powered Analysis</h3>
              <p className="text-purple-700 text-sm">
                This result is based on our AI analysis of all your onboarding responses, 
                providing a more accurate match than quiz-only results.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* User Group Card */}
      <Card className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
        <div className="text-center space-y-6">
          <div className="text-6xl">
            {typeof groupIcon === 'string' ? (
              groupIcon
            ) : (
              React.createElement(groupIcon, { className: "h-16 w-16 mx-auto text-amber-600" })
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              You're a {userGroup}!
            </h2>
            {isAIGroup ? (
              <>
                <p className="text-muted-foreground mb-4">{socialGroupDetails.description}</p>
                <div className="flex items-center justify-center space-x-2">
                  <Badge variant="secondary">
                    AI Confidence: {Math.round(aiSocialGroup.confidence * 100)}%
                  </Badge>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                Based on your quiz answers, we think you'd fit perfectly with this group
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* AI Reasoning */}
      {isAIGroup && aiSocialGroup.reasoning && (
        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <Brain className="h-4 w-4 mr-2" />
            Why this group fits you
          </h3>
          <p className="text-muted-foreground bg-muted p-4 rounded-lg">
            {aiSocialGroup.reasoning}
          </p>
          {aiSocialGroup.keyFactors && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Key factors:</h4>
              <div className="flex flex-wrap gap-2">
                {aiSocialGroup.keyFactors.map((factor: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Matched Students */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Your Top Friendship Matches</h2>
        </div>
        
        <div className="grid gap-6">
          {mockStudents.map((student) => (
            <Card key={student.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{student.name}</h3>
                    <p className="text-muted-foreground">{student.grade}</p>
                  </div>
                </div>
                <Badge className={`${getMatchColor(getMatchScore(student))} border`}>
                  {getMatchScore(student)}% Match
                </Badge>
              </div>

              <div className="space-y-4">
                <p className="text-muted-foreground">
                  <strong>Connection:</strong> {student.reason}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {student.mutualConnections.map((interest: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleExpandProfile(student.id)}
                    className="flex items-center space-x-1"
                  >
                    {expandedProfiles.has(student.id) ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        <span>Less Info</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        <span>More Info</span>
                      </>
                    )}
                  </Button>
                  
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
                      variant={meetingRequests.has(student.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleMeetingClick(student.id)}
                      disabled={meetingRequests.has(student.id)}
                      className="flex items-center space-x-1"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>{meetingRequests.has(student.id) ? "Requested" : "Meet Up"}</span>
                    </Button>
                  </div>
                </div>

                {expandedProfiles.has(student.id) && (
                  <ExpandedProfile 
                    student={student}
                    onConnect={() => handleConnectClick(student.id)}
                    onRequestMeeting={() => handleMeetingClick(student.id)}
                    isConnected={connectedStudents.has(student.id)}
                    isEmailShared={false}
                  />
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
        <Button 
          onClick={() => onNavigateToPage?.('/study-help')}
          className="flex-1 flex items-center space-x-2"
        >
          <Book className="h-4 w-4" />
          <span>Find Study Partners</span>
        </Button>
        
        <Button 
          onClick={() => onNavigateToPage?.('/activities')}
          variant="outline"
          className="flex-1 flex items-center space-x-2"
        >
          <Trophy className="h-4 w-4" />
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

      {/* Show selected student profile */}
      {selectedStudent && (
        <ExpandedProfile 
          student={mockStudents.find(s => s.id === selectedStudent)!}
          onConnect={() => handleConnectClick(selectedStudent)}
          onRequestMeeting={() => handleMeetingClick(selectedStudent)}
          isConnected={connectedStudents.has(selectedStudent)}
          isEmailShared={false}
        />
      )}
    </div>
  );
};

export default MatchResults;