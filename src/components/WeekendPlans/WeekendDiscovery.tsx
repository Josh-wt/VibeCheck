import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Users, 
  Clock, 
  MapPin,
  Star,
  CheckCircle,
  Plus,
  MessageCircle,
  Heart,
  Film,
  Coffee,
  ShoppingBag,
  Gamepad2,
  Mountain
} from "lucide-react";

interface WeekendDiscoveryProps {
  userProfile: any;
}

interface WeekendPlan {
  id: string;
  title: string;
  description: string;
  activityType: string;
  category: string;
  location: string;
  plannedDate: string;
  durationHours: number;
  maxParticipants: number;
  currentParticipants: number;
  budgetEstimate: string;
  organizer: string;
  isJoined?: boolean;
}

interface WeekendMatch {
  id: string;
  type: 'immediate_opportunity' | 'future_suggestion' | 'one_on_one_match';
  activityName: string;
  activityType: string;
  matchReason: string;
  compatibilityScore: number;
  suggestedTiming: string;
  estimatedCost: string;
  conversationStarters: string[];
  targetUser?: string;
  targetPlan?: string;
}

const WeekendDiscovery = ({ userProfile }: WeekendDiscoveryProps) => {
  const [weekendPlans, setWeekendPlans] = useState<WeekendPlan[]>([]);
  const [weekendMatches, setWeekendMatches] = useState<{
    immediate: WeekendMatch[];
    future: WeekendMatch[];
    oneOnOne: WeekendMatch[];
  }>({
    immediate: [],
    future: [],
    oneOnOne: []
  });
  const [joinedPlans, setJoinedPlans] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile && user) {
      loadWeekendPlans();
      generateMatches();
    }
  }, [userProfile, user]);

  const loadWeekendPlans = async () => {
    try {
      const { data: plans, error } = await supabase
        .from("weekend_plans")
        .select("*")
        .eq("is_active", true)
        .gte("planned_date", new Date().toISOString())
        .order("planned_date", { ascending: true });

      if (error) throw error;

      // Get organizer names separately
      const userIds = plans?.map(p => p.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      const formattedPlans = plans?.map(plan => {
        const profile = profiles?.find(p => p.user_id === plan.user_id);
        return {
          id: plan.id,
          title: plan.title,
          description: plan.description || '',
          activityType: plan.activity_type,
          category: plan.category,
          location: plan.location || 'TBD',
          plannedDate: plan.planned_date,
          durationHours: plan.duration_hours,
          maxParticipants: plan.max_participants,
          currentParticipants: plan.current_participants,
          budgetEstimate: plan.budget_estimate || 'Free',
          organizer: profile ? `${profile.first_name} ${profile.last_name}`.trim() : 'Unknown'
        };
      }) || [];

      setWeekendPlans(formattedPlans);
    } catch (error: any) {
      console.error("Error loading weekend plans:", error);
    }
  };

  const generateMatches = async () => {
    try {
      // Simulate AI-powered matching based on user profile
      const userActivities = userProfile.favorite_activities as string[];
      const userEnergyLevel = userProfile.energy_level;
      const userBudget = userProfile.budget_range;
      const userTimings = userProfile.preferred_timings as string[];

      // Generate immediate opportunities
      const immediate: WeekendMatch[] = [
        {
          id: '1',
          type: 'immediate_opportunity',
          activityName: 'Saturday Movie Night',
          activityType: 'movies_entertainment',
          matchReason: `Perfect match! You both love ${userActivities.includes('movies_entertainment') ? 'movies' : 'entertainment'} and have ${userBudget} budget alignment`,
          compatibilityScore: 95,
          suggestedTiming: 'Saturday 7:00 PM',
          estimatedCost: '$12-15',
          conversationStarters: [
            "What's your favorite movie genre?",
            "Have you seen any good movies lately?",
            "Are you excited for any upcoming releases?"
          ],
          targetUser: 'Alex from Drama Club'
        },
        {
          id: '2',
          type: 'immediate_opportunity',
          activityName: 'Sunday Coffee & Study',
          activityType: 'coffee_cafes',
          matchReason: 'Combines your love for coffee with productive study time',
          compatibilityScore: 88,
          suggestedTiming: 'Sunday 2:00 PM',
          estimatedCost: '$8-12',
          conversationStarters: [
            "What subjects are you working on?",
            "Do you have a favorite coffee order?",
            "How do you stay motivated while studying?"
          ],
          targetUser: 'Sam from Math Club'
        }
      ];

      // Generate future suggestions
      const future: WeekendMatch[] = [
        {
          id: '3',
          type: 'future_suggestion',
          activityName: 'Gaming Tournament Weekend',
          activityType: 'gaming_arcades',
          matchReason: '4 peers share your gaming interests - perfect for a group event',
          compatibilityScore: 92,
          suggestedTiming: 'Next Saturday',
          estimatedCost: '$15-20',
          conversationStarters: [
            "What games do you play?",
            "Are you interested in competitive gaming?",
            "Want to team up for the tournament?"
          ]
        },
        {
          id: '4',
          type: 'future_suggestion',
          activityName: 'Art Museum Visit',
          activityType: 'creative_arts',
          matchReason: 'Several creative students want to explore local art scene together',
          compatibilityScore: 85,
          suggestedTiming: 'Sunday afternoon',
          estimatedCost: '$5-10',
          conversationStarters: [
            "What kind of art inspires you?",
            "Do you create art yourself?",
            "Have you been to this museum before?"
          ]
        }
      ];

      // Generate one-on-one matches
      const oneOnOne: WeekendMatch[] = [
        {
          id: '5',
          type: 'one_on_one_match',
          activityName: 'Coffee Chat',
          activityType: 'coffee_cafes',
          matchReason: 'You both prefer small groups and share similar energy levels',
          compatibilityScore: 90,
          suggestedTiming: 'Flexible - weekend afternoons',
          estimatedCost: '$5-8',
          conversationStarters: [
            "How's your semester going so far?",
            "What are you most excited about this year?",
            "Any fun weekend traditions in your family?"
          ],
          targetUser: 'Casey from English Class'
        }
      ];

      setWeekendMatches({ immediate, future, oneOnOne });
    } catch (error: any) {
      console.error("Error generating matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from("weekend_plan_participants")
        .insert({
          plan_id: planId,
          user_id: user?.id,
          status: "joined"
        });

      if (error) throw error;

      setJoinedPlans(prev => new Set([...prev, planId]));
      toast({
        title: "Joined Plan!",
        description: "You've successfully joined this weekend activity. Check your email for details.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleConnectMatch = async (matchId: string) => {
    try {
      // In a real app, this would send a connection request
      toast({
        title: "Connection Request Sent!",
        description: "Your friend request has been sent. You'll be notified when they respond.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'movies_entertainment': return Film;
      case 'coffee_cafes': return Coffee;
      case 'shopping_malls': return ShoppingBag;
      case 'gaming_arcades': return Gamepad2;
      case 'outdoor_activities': return Mountain;
      default: return Calendar;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Finding your perfect weekend opportunities...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-200 border-4 border-blue-300">
          <Calendar className="h-10 w-10 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Weekend Discovery
          </h1>
          <p className="text-lg text-muted-foreground">
            Turn school friendships into weekend adventures
          </p>
        </div>
      </div>

      {/* Discovery Tabs */}
      <Tabs defaultValue="immediate" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-blue-100">
          <TabsTrigger value="immediate" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>This Weekend</span>
          </TabsTrigger>
          <TabsTrigger value="future" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Group Ideas</span>
          </TabsTrigger>
          <TabsTrigger value="oneOnOne" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>Perfect Matches</span>
          </TabsTrigger>
        </TabsList>

        {/* This Weekend - Immediate Opportunities */}
        <TabsContent value="immediate" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Join This Weekend</h2>
            <p className="text-muted-foreground">Active plans from peers that match your preferences</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Active Weekend Plans */}
            {weekendPlans.slice(0, 4).map((plan) => {
              const Icon = getCategoryIcon(plan.category);
              const isJoined = joinedPlans.has(plan.id);
              
              return (
                <Card key={plan.id} className="p-6 border-4 border-green-200 bg-green-50 hover:border-green-400 transition-all">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-green-200 border-2 border-green-300 flex items-center justify-center">
                          <Icon className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{plan.title}</h3>
                          <p className="text-sm text-muted-foreground">by {plan.organizer}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-200 text-green-800">
                        {plan.currentParticipants}/{plan.maxParticipants} joined
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(plan.plannedDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{plan.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Budget: {plan.budgetEstimate}</span>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      {isJoined ? (
                        <Button disabled className="w-full bg-green-500 text-white">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Joined!
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleJoinPlan(plan.id)}
                          className="w-full bg-green-500 hover:bg-green-600"
                        >
                          Join This Plan
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}

            {/* AI Matches - Immediate */}
            {weekendMatches.immediate.map((match) => {
              const Icon = getCategoryIcon(match.activityType);
              
              return (
                <Card key={match.id} className="p-6 border-4 border-blue-200 bg-blue-50 hover:border-blue-400 transition-all">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-blue-200 border-2 border-blue-300 flex items-center justify-center">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{match.activityName}</h3>
                          <p className="text-sm text-muted-foreground">{match.targetUser}</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-200 text-blue-800">
                        {match.compatibilityScore}% match
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{match.matchReason}</p>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-sm"><strong>When:</strong> {match.suggestedTiming}</p>
                      <p className="text-sm"><strong>Cost:</strong> {match.estimatedCost}</p>
                    </div>
                    
                    <Button 
                      onClick={() => handleConnectMatch(match.id)}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Request
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Future Group Ideas */}
        <TabsContent value="future" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Group Activity Ideas</h2>
            <p className="text-muted-foreground">Opportunities to propose and organize new activities</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weekendMatches.future.map((match) => {
              const Icon = getCategoryIcon(match.activityType);
              
              return (
                <Card key={match.id} className="p-6 border-4 border-purple-200 bg-purple-50 hover:border-purple-400 transition-all">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-purple-200 border-2 border-purple-300 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{match.activityName}</h3>
                        <Badge className="bg-purple-100 text-purple-700">{match.compatibilityScore}% interest</Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{match.matchReason}</p>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-sm"><strong>Suggested:</strong> {match.suggestedTiming}</p>
                      <p className="text-sm"><strong>Budget:</strong> {match.estimatedCost}</p>
                    </div>
                    
                    <Button className="w-full bg-purple-500 hover:bg-purple-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Organize This
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* One-on-One Matches */}
        <TabsContent value="oneOnOne" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Perfect Hangout Matches</h2>
            <p className="text-muted-foreground">Highly compatible peers for meaningful one-on-one time</p>
          </div>
          
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
            {weekendMatches.oneOnOne.map((match) => {
              const Icon = getCategoryIcon(match.activityType);
              
              return (
                <Card key={match.id} className="p-6 border-4 border-pink-200 bg-pink-50 hover:border-pink-400 transition-all">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-pink-200 border-2 border-pink-300 flex items-center justify-center">
                          <Icon className="h-6 w-6 text-pink-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{match.activityName}</h3>
                          <p className="text-sm text-muted-foreground">{match.targetUser}</p>
                        </div>
                      </div>
                      <Badge className="bg-pink-200 text-pink-800">
                        <Star className="h-3 w-3 mr-1" />
                        {match.compatibilityScore}%
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{match.matchReason}</p>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-sm mb-2"><strong>Conversation Starters:</strong></p>
                      <ul className="text-xs space-y-1">
                        {match.conversationStarters.map((starter, idx) => (
                          <li key={idx} className="text-muted-foreground">• {starter}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-sm"><strong>Best Time:</strong> {match.suggestedTiming}</p>
                      <p className="text-sm"><strong>Budget:</strong> {match.estimatedCost}</p>
                    </div>
                    
                    <Button 
                      onClick={() => handleConnectMatch(match.id)}
                      className="w-full bg-pink-500 hover:bg-pink-600"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Suggest Hangout
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

export default WeekendDiscovery;