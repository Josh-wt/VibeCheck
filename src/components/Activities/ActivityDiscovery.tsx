import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Plus, 
  Lightbulb, 
  Clock, 
  MapPin,
  Star,
  CheckCircle,
  TrendingUp,
  Target,
  Heart,
  Trophy,
  BookOpen
} from "lucide-react";

interface ActivityDiscoveryProps {
  userProfile: any;
}

interface Recommendation {
  id?: string;
  type: 'join_existing' | 'start_new' | 'explore_solo';
  name: string;
  category: string;
  reason: string;
  peerCount: number;
  benefits: string;
  nextSteps: string;
  isJoined?: boolean;
  meetingTimes?: string;
  location?: string;
  currentMembers?: number;
  maxMembers?: number;
}

interface ClubProposal {
  id: string;
  name: string;
  category: string;
  description: string;
  status: string;
  interestCount: number;
  minMembers: number;
  proposedBy: string;
  isUserInterested?: boolean;
}

const ActivityDiscovery = ({ userProfile }: ActivityDiscoveryProps) => {
  const [recommendations, setRecommendations] = useState<{
    join_existing: Recommendation[];
    start_new: Recommendation[];
    explore_solo: Recommendation[];
  }>({
    join_existing: [],
    start_new: [],
    explore_solo: []
  });
  const [clubProposals, setClubProposals] = useState<ClubProposal[]>([]);
  const [joinedActivities, setJoinedActivities] = useState<Set<string>>(new Set());
  const [interestedClubs, setInterestedClubs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile && user) {
      generateRecommendations();
      loadClubProposals();
    }
  }, [userProfile, user]);

  const generateRecommendations = async () => {
    try {
      // Get existing activities
      const { data: activities, error: activitiesError } = await supabase
        .from("activities")
        .select("*")
        .eq("is_active", true);

      if (activitiesError) throw activitiesError;

      // Get peer activity data
      const { data: peerActivities, error: peerError } = await supabase
        .from("activity_participation")
        .select(`
          activity_id,
          activities!inner(name, category)
        `);

      if (peerError) throw peerError;

      // Generate AI-like recommendations based on user profile
      const joinExisting: Recommendation[] = [];
      const exploreNew: Recommendation[] = [];
      const userInterests = userProfile.interested_activities as string[];
      const userGoals = userProfile.activity_goals as string[];

      activities?.forEach((activity) => {
        const peerCount = peerActivities?.filter(pa => pa.activity_id === activity.id).length || 0;
        
        // Join existing recommendations
        if (userInterests.some(interest => 
          activity.name.toLowerCase().includes(interest.toLowerCase()) ||
          activity.category.toLowerCase().includes(interest.toLowerCase())
        )) {
          joinExisting.push({
            type: 'join_existing',
            name: activity.name,
            category: activity.category,
            reason: `Matches your interest in ${activity.category.toLowerCase()} activities`,
            peerCount,
            benefits: getBenefitsForActivity(activity.category, userGoals),
            nextSteps: `Contact ${activity.advisor_contact || 'the activity coordinator'} to join`,
            meetingTimes: activity.meeting_times,
            location: activity.location,
            currentMembers: activity.current_members,
            maxMembers: activity.max_members
          });
        }

        // Explore solo recommendations
        if (!userInterests.includes(activity.name) && 
            getActivityAlignment(activity, userGoals) > 0.6) {
          exploreNew.push({
            type: 'explore_solo',
            name: activity.name,
            category: activity.category,
            reason: `Aligns with your goal to ${userGoals.join(' and ')}`,
            peerCount: 0,
            benefits: getBenefitsForActivity(activity.category, userGoals),
            nextSteps: `Try attending a meeting to see if it's a good fit`,
            meetingTimes: activity.meeting_times,
            location: activity.location
          });
        }
      });

      // Generate start new recommendations
      const startNew: Recommendation[] = generateStartNewRecommendations(userProfile);

      setRecommendations({
        join_existing: joinExisting.slice(0, 4),
        start_new: startNew.slice(0, 3),
        explore_solo: exploreNew.slice(0, 3)
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClubProposals = async () => {
    try {
      const { data: proposals, error } = await supabase
        .from("club_proposals")
        .select(`
          *,
          club_interest!left(user_id)
        `)
        .in("status", ["gathering_interest", "ready_to_form"]);

      if (error) throw error;

      const proposalsWithInterest = proposals?.map(proposal => ({
        id: proposal.id,
        name: proposal.name,
        category: proposal.category,
        description: proposal.description,
        status: proposal.status,
        interestCount: proposal.interest_count,
        minMembers: proposal.min_members,
        proposedBy: proposal.proposed_by,
        isUserInterested: proposal.club_interest?.some((ci: any) => ci.user_id === user?.id) || false
      })) || [];

      setClubProposals(proposalsWithInterest);
    } catch (error: any) {
      console.error("Error loading club proposals:", error);
    }
  };

  const handleJoinActivity = async (activityName: string) => {
    try {
      // Find the activity ID
      const { data: activity, error: activityError } = await supabase
        .from("activities")
        .select("id")
        .eq("name", activityName)
        .single();

      if (activityError) throw activityError;

      const { error } = await supabase
        .from("activity_participation")
        .insert({
          user_id: user?.id,
          activity_id: activity.id,
          role: "member"
        });

      if (error) throw error;

      setJoinedActivities(prev => new Set([...prev, activityName]));
      toast({
        title: "Joined Activity!",
        description: `You've joined ${activityName}. Check your email for meeting details.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleClubInterest = async (proposalId: string) => {
    try {
      const { error } = await supabase
        .from("club_interest")
        .insert({
          user_id: user?.id,
          proposal_id: proposalId,
          interest_level: "interested"
        });

      if (error) throw error;

      setInterestedClubs(prev => new Set([...prev, proposalId]));
      toast({
        title: "Interest Recorded!",
        description: "We'll notify you when this club is ready to form.",
      });
      
      loadClubProposals(); // Refresh to update counts
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getBenefitsForActivity = (category: string, goals: string[]): string => {
    const benefits = [];
    if (goals.includes("make_friends")) benefits.push("Meet like-minded peers");
    if (goals.includes("build_skills")) benefits.push("Develop new abilities");
    if (goals.includes("prep_for_college")) benefits.push("Strengthen college applications");
    if (goals.includes("have_fun")) benefits.push("Enjoy engaging activities");
    if (goals.includes("compete")) benefits.push("Compete in tournaments");
    if (goals.includes("help_community")) benefits.push("Make a positive impact");
    
    return benefits.slice(0, 3).join(", ");
  };

  const getActivityAlignment = (activity: any, goals: string[]): number => {
    let score = 0;
    if (goals.includes("compete") && activity.category === "Sports") score += 0.3;
    if (goals.includes("build_skills") && activity.category === "Technology") score += 0.3;
    if (goals.includes("help_community") && activity.category === "Service") score += 0.3;
    if (goals.includes("prep_for_college") && activity.category === "Academic") score += 0.3;
    return Math.min(score + 0.4, 1.0);
  };

  const generateStartNewRecommendations = (profile: any): Recommendation[] => {
    const interests = profile.interested_activities as string[];
    const goals = profile.activity_goals as string[];
    
    const potentialClubs = [
      {
        name: "Creative Writing Club",
        category: "Arts",
        condition: interests.some(i => i.includes("Writing") || i.includes("Literature"))
      },
      {
        name: "Coding Bootcamp Club",
        category: "Technology", 
        condition: interests.some(i => i.includes("Computer") || i.includes("Coding"))
      },
      {
        name: "Community Service League",
        category: "Service",
        condition: goals.includes("help_community")
      },
      {
        name: "Language Exchange Club",
        category: "Academic",
        condition: interests.some(i => i.includes("Language") || i.includes("Spanish") || i.includes("French"))
      }
    ];

    return potentialClubs
      .filter(club => club.condition)
      .map(club => ({
        type: 'start_new' as const,
        name: club.name,
        category: club.category,
        reason: "Based on shared interests with your peer group",
        peerCount: Math.floor(Math.random() * 8) + 3, // Simulate peer interest
        benefits: getBenefitsForActivity(club.category, goals),
        nextSteps: "Propose this club and gather interested students"
      }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'sports': return Trophy;
      case 'academic': return BookOpen;
      case 'arts': return Star;
      case 'technology': return Target;
      case 'service': return Heart;
      case 'leadership': return Users;
      default: return Lightbulb;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Generating your personalized recommendations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-200 border-4 border-purple-300">
          <Lightbulb className="h-10 w-10 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Activity Discovery
          </h1>
          <p className="text-lg text-muted-foreground">
            Personalized recommendations based on your interests and goals
          </p>
        </div>
      </div>

      {/* Recommendations Tabs */}
      <Tabs defaultValue="join" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-purple-100">
          <TabsTrigger value="join" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Join Existing</span>
          </TabsTrigger>
          <TabsTrigger value="start" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Start New</span>
          </TabsTrigger>
          <TabsTrigger value="explore" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Explore Solo</span>
          </TabsTrigger>
        </TabsList>

        {/* Join Existing Activities */}
        <TabsContent value="join" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Join Existing Activities</h2>
            <p className="text-muted-foreground">Activities where your peers are already participating</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {recommendations.join_existing.map((rec, index) => {
              const Icon = getCategoryIcon(rec.category);
              const isJoined = joinedActivities.has(rec.name);
              
              return (
                <Card key={index} className="p-6 border-4 border-blue-200 bg-blue-50 hover:border-blue-400 transition-all">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-blue-200 border-2 border-blue-300 flex items-center justify-center">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{rec.name}</h3>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">{rec.category}</Badge>
                        </div>
                      </div>
                      {rec.peerCount > 0 && (
                        <Badge className="bg-green-200 text-green-800">
                          {rec.peerCount} peers joined
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                    
                    {rec.meetingTimes && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{rec.meetingTimes}</span>
                      </div>
                    )}
                    
                    {rec.location && (
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{rec.location}</span>
                      </div>
                    )}
                    
                    <div className="pt-2">
                      {isJoined ? (
                        <Button disabled className="w-full bg-green-500 text-white">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Joined!
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleJoinActivity(rec.name)}
                          className="w-full bg-blue-500 hover:bg-blue-600"
                        >
                          Join Activity
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Start New Clubs */}
        <TabsContent value="start" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Start New Clubs</h2>
            <p className="text-muted-foreground">Opportunities to create activities your peer group wants</p>
          </div>
          
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recommended New Clubs */}
            {recommendations.start_new.map((rec, index) => {
              const Icon = getCategoryIcon(rec.category);
              
              return (
                <Card key={index} className="p-6 border-4 border-green-200 bg-green-50 hover:border-green-400 transition-all">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-green-200 border-2 border-green-300 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{rec.name}</h3>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">{rec.category}</Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-sm"><strong>Expected Interest:</strong> {rec.peerCount} students</p>
                      <p className="text-sm"><strong>Benefits:</strong> {rec.benefits}</p>
                    </div>
                    
                    <Button className="w-full bg-green-500 hover:bg-green-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Propose This Club
                    </Button>
                  </div>
                </Card>
              );
            })}

            {/* Existing Club Proposals */}
            {clubProposals.map((proposal) => {
              const Icon = getCategoryIcon(proposal.category);
              const isInterested = interestedClubs.has(proposal.id) || proposal.isUserInterested;
              
              return (
                <Card key={proposal.id} className="p-6 border-4 border-yellow-200 bg-yellow-50 hover:border-yellow-400 transition-all">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-yellow-200 border-2 border-yellow-300 flex items-center justify-center">
                          <Icon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{proposal.name}</h3>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">{proposal.category}</Badge>
                        </div>
                      </div>
                      <Badge className={
                        proposal.status === 'ready_to_form' 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-orange-200 text-orange-800'
                      }>
                        {proposal.status === 'ready_to_form' ? 'Ready to Form!' : 'Gathering Interest'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{proposal.description}</p>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-sm">
                        <strong>Interest:</strong> {proposal.interestCount} / {proposal.minMembers} needed
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((proposal.interestCount / proposal.minMembers) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      {isInterested ? (
                        <Button disabled className="w-full bg-green-500 text-white">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Interest Recorded!
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleClubInterest(proposal.id)}
                          className="w-full bg-yellow-500 hover:bg-yellow-600"
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          Show Interest
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Explore Solo */}
        <TabsContent value="explore" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Explore New Interests</h2>
            <p className="text-muted-foreground">Activities that match your goals, even without peer connections</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.explore_solo.map((rec, index) => {
              const Icon = getCategoryIcon(rec.category);
              
              return (
                <Card key={index} className="p-6 border-4 border-purple-200 bg-purple-50 hover:border-purple-400 transition-all">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-purple-200 border-2 border-purple-300 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{rec.name}</h3>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">{rec.category}</Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-sm"><strong>Benefits:</strong> {rec.benefits}</p>
                    </div>
                    
                    <Button className="w-full bg-purple-500 hover:bg-purple-600">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Try This Activity
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ActivityDiscovery;
