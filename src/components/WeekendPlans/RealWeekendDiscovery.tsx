import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, DollarSign, User, Heart, Send, PartyPopper } from "lucide-react";
import { CreateWeekendPlanModal } from "@/components/forms/CreateWeekendPlanModal";

interface RealWeekendDiscoveryProps {
  userProfile: any;
}

interface WeekendPlan {
  id: string;
  title: string;
  description: string;
  activity_type: string;
  category: string;
  location: string;
  planned_date: string;
  duration_hours: number;
  current_participants: number;
  max_participants: number;
  budget_estimate: string;
  organizer: string;
  hasJoined: boolean;
}

interface WeekendMatch {
  id: string;
  name: string;
  grade: number;
  school_name: string;
  compatibilityScore: number;
  sharedActivities: string[];
  energyLevel: string;
  budgetRange: string;
  favoriteActivities: string[];
}

const RealWeekendDiscovery = ({ userProfile }: RealWeekendDiscoveryProps) => {
  const { user } = useAuth();
  const [weekendPlans, setWeekendPlans] = useState<WeekendPlan[]>([]);
  const [weekendMatches, setWeekendMatches] = useState<WeekendMatch[]>([]);
  const [joinedPlans, setJoinedPlans] = useState<Set<string>>(new Set());
  const [connectionRequests, setConnectionRequests] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  
  // New plan state
  const [newPlan, setNewPlan] = useState({
    title: "",
    description: "",
    activity_type: "",
    category: "",
    location: "",
    planned_date: "",
    duration_hours: 2,
    max_participants: 5,
    budget_estimate: ""
  });

  useEffect(() => {
    if (user && userProfile) {
      loadUserProfile();
      loadWeekendPlans();
      findWeekendMatches();
    }
  }, [user, userProfile]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setCurrentUserProfile(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadWeekendPlans = async () => {
    if (!user || !currentUserProfile) return;

    try {
      // Get weekend plans from the same school
      const { data: plansData, error: plansError } = await supabase
        .from('weekend_plans')
        .select('*')
        .eq('is_active', true)
        .neq('user_id', user.id);

      if (plansError) throw plansError;

      if (plansData) {
        // Get organizer details and filter by school
        const plansWithOrganizerDetails = await Promise.all(
          plansData.map(async (plan) => {
            const { data: organizerData } = await supabase
              .from('profiles')
              .select('first_name, last_name, school_name, grade')
              .eq('user_id', plan.user_id)
              .single();

            // Filter by same school and similar grade (within 2 grades)
            const organizerGrade = parseInt(organizerData?.grade || '0');
            const currentUserGrade = parseInt(currentUserProfile.grade || '0');
            if (organizerData && 
                organizerData.school_name === currentUserProfile.school_name &&
                Math.abs(organizerGrade - currentUserGrade) <= 2) {
              
              return {
                id: plan.id,
                title: plan.title,
                description: plan.description,
                activity_type: plan.activity_type,
                category: plan.category,
                location: plan.location,
                planned_date: plan.planned_date,
                duration_hours: plan.duration_hours,
                current_participants: plan.current_participants,
                max_participants: plan.max_participants,
                budget_estimate: plan.budget_estimate,
                organizer: `${organizerData.first_name || ''} ${organizerData.last_name || ''}`.trim(),
                hasJoined: false
              };
            }
            return null;
          })
        );

        const filteredPlans = plansWithOrganizerDetails.filter(plan => plan !== null) as WeekendPlan[];

        // Check which plans user has already joined
        const { data: participantsData } = await supabase
          .from('weekend_plan_participants')
          .select('plan_id')
          .eq('user_id', user.id);

        const joinedPlanIds = new Set(participantsData?.map(p => p.plan_id) || []);
        setJoinedPlans(joinedPlanIds);

        const plansWithJoinStatus = filteredPlans.map(plan => ({
          ...plan,
          hasJoined: joinedPlanIds.has(plan.id)
        }));

        setWeekendPlans(plansWithJoinStatus);
      }
    } catch (error) {
      console.error('Error loading weekend plans:', error);
    }
  };

  const findWeekendMatches = async () => {
    if (!user || !userProfile || !currentUserProfile) return;

    try {
      // Get weekend interests from other students
      const { data: interestsData, error: interestsError } = await supabase
        .from('weekend_interests')
        .select('*')
        .neq('user_id', user.id);

      if (interestsError) throw interestsError;

      if (interestsData) {
        const matchesWithProfiles = await Promise.all(
          interestsData.map(async (interest) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('first_name, last_name, school_name, grade')
              .eq('user_id', interest.user_id)
              .single();

            // Filter by same school and similar grade
            const profileGrade = parseInt(profileData?.grade || '0');
            const currentUserGrade = parseInt(currentUserProfile.grade || '0');
            if (profileData && 
                profileData.school_name === currentUserProfile.school_name &&
                Math.abs(profileGrade - currentUserGrade) <= 2) {

              // Calculate compatibility
              const userActivities = Array.isArray(userProfile.favorite_activities) 
                ? userProfile.favorite_activities 
                : [];
              const matchActivities = Array.isArray(interest.favorite_activities) 
                ? interest.favorite_activities 
                : [];

              const sharedActivities = userActivities.filter((activity: string) => 
                matchActivities.includes(activity)
              );

              let compatibilityScore = 0;
              
              // Shared activities (40% weight)
              compatibilityScore += sharedActivities.length * 10;
              
              // Same energy level (30% weight)
              if (userProfile.energy_level === interest.energy_level) {
                compatibilityScore += 15;
              }
              
              // Compatible budget (20% weight)
              if (userProfile.budget_range === interest.budget_range) {
                compatibilityScore += 10;
              }
              
              // Same grade (10% weight)
              if (currentUserProfile.grade === profileData.grade) {
                compatibilityScore += 5;
              }

              return {
                id: interest.user_id,
                name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
              grade: profileGrade,
              school_name: profileData.school_name,
                compatibilityScore,
                sharedActivities,
                energyLevel: interest.energy_level,
                budgetRange: interest.budget_range,
                favoriteActivities: matchActivities
              };
            }
            return null;
          })
        );

        const filteredMatches = matchesWithProfiles
          .filter(match => match !== null && match.compatibilityScore > 0) as WeekendMatch[];

        // Sort by compatibility score
        filteredMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

        setWeekendMatches(filteredMatches.slice(0, 10)); // Top 10 matches
      }
    } catch (error) {
      console.error('Error finding weekend matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinPlan = async (planId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('weekend_plan_participants')
        .insert({
          plan_id: planId,
          user_id: user.id,
          status: 'joined'
        });

      if (error) throw error;

      setJoinedPlans(prev => new Set([...prev, planId]));
      setWeekendPlans(prev => prev.map(plan => 
        plan.id === planId 
          ? { ...plan, hasJoined: true, current_participants: plan.current_participants + 1 }
          : plan
      ));
    } catch (error) {
      console.error('Error joining plan:', error);
    }
  };

  const handleConnectMatch = async (matchId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('weekend_connection_requests')
        .insert([{
          requester_id: user.id,
          recipient_id: matchId,
          status: 'pending',
          activity_preference: 'Weekend activities'
        }]);

      if (error) throw error;

      setConnectionRequests(prev => new Set([...prev, matchId]));
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const handleCreatePlan = async () => {
    if (!user) return;

    try {
      const planData = {
        ...newPlan,
        organizer_id: user.id,
        user_id: user.id,
        planned_date: new Date(newPlan.planned_date).toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        is_active: true,
        current_participants: 1
      };

      const { error } = await supabase
        .from('weekend_plans')
        .insert([planData]);

      if (error) throw error;

      // Reset form
      setNewPlan({
        title: "",
        description: "",
        activity_type: "",
        category: "",
        location: "",
        planned_date: "",
        duration_hours: 2,
        max_participants: 5,
        budget_estimate: ""
      });

      // Reload plans
      loadWeekendPlans();
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'sports': return '⚽';
      case 'arts': return '🎨';
      case 'social': return '👥';
      case 'adventure': return '🏔️';
      case 'learning': return '📚';
      default: return '🎯';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">Weekend Adventure Hub</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Discover exciting weekend plans and connect with like-minded friends
        </p>
      </div>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans">Available Plans</TabsTrigger>
          <TabsTrigger value="matches">Perfect Matches</TabsTrigger>
          <TabsTrigger value="create">Create Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {weekendPlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span>{getCategoryIcon(plan.category)}</span>
                        {plan.title}
                      </CardTitle>
                      <CardDescription>Organized by {plan.organizer}</CardDescription>
                    </div>
                    <Badge>{plan.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{plan.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {formatDate(plan.planned_date)}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {plan.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {plan.duration_hours}h
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {plan.current_participants}/{plan.max_participants}
                    </div>
                  </div>

                  {plan.budget_estimate && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      {plan.budget_estimate}
                    </div>
                  )}

                  <Button 
                    onClick={() => handleJoinPlan(plan.id)}
                    disabled={plan.hasJoined || plan.current_participants >= plan.max_participants}
                    className="w-full"
                  >
                    {plan.hasJoined ? 'Already Joined' : 
                     plan.current_participants >= plan.max_participants ? 'Full' : 'Join Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {weekendPlans.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No weekend plans available from your school yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Be the first to create one!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="matches" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {weekendMatches.map((match) => (
              <Card key={match.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {match.name}
                  </CardTitle>
                  <CardDescription>
                    Grade {match.grade} • {match.compatibilityScore}% compatible
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      Shared Interests
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {match.sharedActivities.map((activity, index) => (
                        <Badge key={index} variant="secondary">{activity}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Energy Level:</span>
                      <p className="text-muted-foreground">{match.energyLevel}</p>
                    </div>
                    <div>
                      <span className="font-medium">Budget Range:</span>
                      <p className="text-muted-foreground">{match.budgetRange}</p>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleConnectMatch(match.id)}
                    disabled={connectionRequests.has(match.id)}
                    className="w-full"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {connectionRequests.has(match.id) ? 'Request Sent' : 'Connect'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {weekendMatches.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No compatible matches found yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your weekend preferences in onboarding.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card className="p-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <PartyPopper className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Plan Something Epic!</h3>
                <p className="text-muted-foreground text-lg">
                  Create unforgettable weekend experiences and connect with awesome people
                </p>
              </div>
              
              <CreateWeekendPlanModal onCreatePlan={handleCreatePlan}>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg transition-all duration-300 text-lg px-8 py-4"
                >
                  <PartyPopper className="h-5 w-5 mr-2" />
                  Plan Adventure
                </Button>
              </CreateWeekendPlanModal>
              
              <p className="text-sm text-muted-foreground">
                Join the weekend adventure community!
              </p>
            </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Plan Title</Label>
                  <Input
                    id="title"
                    value={newPlan.title}
                    onChange={(e) => setNewPlan({...newPlan, title: e.target.value})}
                    placeholder="e.g., Basketball at the Park"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => setNewPlan({...newPlan, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="arts">Arts & Creativity</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="adventure">Adventure</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                  placeholder="Describe your weekend plan..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newPlan.location}
                    onChange={(e) => setNewPlan({...newPlan, location: e.target.value})}
                    placeholder="Where will this happen?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planned_date">Date & Time</Label>
                  <Input
                    id="planned_date"
                    type="datetime-local"
                    value={newPlan.planned_date}
                    onChange={(e) => setNewPlan({...newPlan, planned_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="12"
                    value={newPlan.duration_hours}
                    onChange={(e) => setNewPlan({...newPlan, duration_hours: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_participants">Max People</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    min="2"
                    max="20"
                    value={newPlan.max_participants}
                    onChange={(e) => setNewPlan({...newPlan, max_participants: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget Estimate</Label>
                  <Select onValueChange={(value) => setNewPlan({...newPlan, budget_estimate: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Free">Free</SelectItem>
                      <SelectItem value="$1-10">$1-10</SelectItem>
                      <SelectItem value="$10-25">$10-25</SelectItem>
                      <SelectItem value="$25-50">$25-50</SelectItem>
                      <SelectItem value="$50+">$50+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealWeekendDiscovery;