import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Plus, 
  Lightbulb, 
  Clock, 
  MapPin,
  Star,
  CheckCircle,
  TrendingUp,
  Heart,
  Trophy,
  BookOpen
} from "lucide-react";
import { CreateClubModal } from "@/components/forms/CreateClubModal";

interface FixedActivityDiscoveryProps {
  userProfile: any;
}

interface Activity {
  id: string;
  name: string;
  category: string;
  description: string;
  meetingTimes?: string;
  location?: string;
  currentMembers: number;
  maxMembers?: number;
  advisorContact?: string;
  isJoined?: boolean;
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
  proposerName?: string;
}

const FixedActivityDiscovery = ({ userProfile }: FixedActivityDiscoveryProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [clubProposals, setClubProposals] = useState<ClubProposal[]>([]);
  const [joinedActivities, setJoinedActivities] = useState<Set<string>>(new Set());
  const [interestedClubs, setInterestedClubs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [showNewProposal, setShowNewProposal] = useState(false);
  const [newProposal, setNewProposal] = useState({
    name: '',
    category: '',
    description: '',
    meetingTimes: '',
    location: '',
    minMembers: 5
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile && user) {
      loadUserProfile();
      loadActivities();
      loadClubProposals();
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

  const loadActivities = async () => {
    if (!user) return;

    try {
      // Get current user's school and grade for filtering
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('school_name, grade')
        .eq('user_id', user.id)
        .single();

      if (userError) throw userError;

      // Get club proposals that have been formed into activities
      const { data: proposals, error: proposalsError } = await supabase
        .from('club_proposals')
        .select('*')
        .eq('status', 'formed');

      if (proposalsError) throw proposalsError;

      // Get profile information for each proposal creator
      const proposalIds = proposals?.map(p => p.proposed_by) || [];
      const { data: proposerProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, school_name, grade')
        .in('user_id', proposalIds);

      if (profilesError) throw profilesError;

      // Filter by same school and similar grade
      const schoolActivities = proposals?.filter(proposal => {
        const proposerProfile = proposerProfiles?.find(p => p.user_id === proposal.proposed_by);
        const proposerGrade = parseInt(proposerProfile?.grade || '0');
        const userGrade = parseInt(userProfile.grade || '0');
        return proposerProfile && 
               proposerProfile.school_name === userProfile.school_name &&
               Math.abs(proposerGrade - userGrade) <= 1;
      }).map(proposal => ({
        id: proposal.id,
        name: proposal.name,
        category: proposal.category,
        description: proposal.description,
        meetingTimes: proposal.meeting_times || 'TBD',
        location: proposal.location || 'TBD',
        currentMembers: proposal.interest_count,
        maxMembers: proposal.max_members,
        advisorContact: 'Contact via app',
        isJoined: false
      })) || [];

      // Check which activities user has joined
      const { data: participations } = await supabase
        .from('club_interest')
        .select('proposal_id')
        .eq('user_id', user.id);

      const joinedIds = new Set(participations?.map(p => p.proposal_id) || []);
      setJoinedActivities(joinedIds);

      setActivities(schoolActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClubProposals = async () => {
    if (!user) return;

    try {
      // Get current user's school and grade
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('school_name, grade')
        .eq('user_id', user.id)
        .single();

      if (userError) throw userError;

      // Get proposals that are gathering interest or ready to form
      const { data: proposals, error } = await supabase
        .from('club_proposals')
        .select('*')
        .in('status', ['gathering_interest', 'ready_to_form']);

      if (error) throw error;

      // Get profile information for each proposal creator
      const proposalIds = proposals?.map(p => p.proposed_by) || [];
      const { data: proposerProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, school_name, grade')
        .in('user_id', proposalIds);

      if (profilesError) throw profilesError;

      // Get user's club interests
      const { data: interests, error: interestsError } = await supabase
        .from('club_interest')
        .select('proposal_id')
        .eq('user_id', user.id);

      if (interestsError) throw interestsError;

      // Filter by same school and similar grade
      const schoolProposals = proposals?.filter(proposal => {
        const proposerProfile = proposerProfiles?.find(p => p.user_id === proposal.proposed_by);
        const proposerGrade = parseInt(proposerProfile?.grade || '0');
        const userGrade = parseInt(userProfile.grade || '0');
        return proposerProfile && 
               proposerProfile.school_name === userProfile.school_name &&
               Math.abs(proposerGrade - userGrade) <= 1;
      }).map(proposal => {
        const proposerProfile = proposerProfiles?.find(p => p.user_id === proposal.proposed_by);
        return {
          id: proposal.id,
          name: proposal.name,
          category: proposal.category,
          description: proposal.description,
          status: proposal.status,
          interestCount: proposal.interest_count,
          minMembers: proposal.min_members,
          proposedBy: proposal.proposed_by,
          proposerName: proposerProfile ? `${proposerProfile.first_name} ${proposerProfile.last_name}`.trim() : 'Unknown',
          isUserInterested: interests?.some(interest => interest.proposal_id === proposal.id) || false
        };
      }) || [];

      setClubProposals(schoolProposals);

      // Set interested clubs
      const interestedIds = new Set(
        schoolProposals
          .filter(p => p.isUserInterested)
          .map(p => p.id)
      );
      setInterestedClubs(interestedIds);
    } catch (error) {
      console.error('Error loading club proposals:', error);
    }
  };

  const handleJoinActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from("club_interest")
        .insert({
          user_id: user?.id,
          proposal_id: activityId,
          interest_level: "interested"
        });

      if (error) throw error;

      setJoinedActivities(prev => new Set([...prev, activityId]));
      toast({
        title: "Joined Activity!",
        description: "You've joined this activity. Other members will be able to see you're interested.",
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

  const handleCreateProposal = async () => {
    if (!user || !currentUserProfile) return;

    try {
      const { error } = await supabase
        .from('club_proposals')
        .insert({
          name: newProposal.name,
          category: newProposal.category,
          description: newProposal.description,
          meeting_times: newProposal.meetingTimes,
          location: newProposal.location,
          min_members: newProposal.minMembers,
          proposed_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Proposal Created!",
        description: "Your club proposal has been created. Other students can now express interest.",
      });

      setShowNewProposal(false);
      setNewProposal({
        name: '',
        category: '',
        description: '',
        meetingTimes: '',
        location: '',
        minMembers: 5
      });
      
      loadClubProposals();
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
      case 'sports': return Trophy;
      case 'academic': return BookOpen;
      case 'arts': return Star;
      case 'technology': return Lightbulb;
      case 'service': return Heart;
      case 'leadership': return Users;
      default: return Lightbulb;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading activities from your school...</p>
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
            Activities at {currentUserProfile?.school_name}
          </h1>
          <p className="text-lg text-muted-foreground">
            Join existing activities or propose new ones for your school
          </p>
        </div>
      </div>

      {/* Activity Tabs */}
      <Tabs defaultValue="existing" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-purple-100">
          <TabsTrigger value="existing" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Existing Activities</span>
          </TabsTrigger>
          <TabsTrigger value="proposals" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Forming Soon</span>
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Propose New</span>
          </TabsTrigger>
        </TabsList>

        {/* Existing Activities */}
        <TabsContent value="existing" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Join Existing Activities</h2>
            <p className="text-muted-foreground">Activities formed by students at your school</p>
          </div>
          
          {activities.length === 0 ? (
            <Card className="p-8 text-center">
              <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No activities yet</h3>
              <p className="text-muted-foreground">
                Be the first to propose an activity at your school! 
                Check the "Propose New" tab to get started.
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {activities.map((activity) => {
                const Icon = getCategoryIcon(activity.category);
                const isJoined = joinedActivities.has(activity.id);
                
                return (
                  <Card key={activity.id} className="p-6 border-4 border-blue-200 bg-blue-50 hover:border-blue-400 transition-all">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-blue-200 border-2 border-blue-300 flex items-center justify-center">
                            <Icon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{activity.name}</h3>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">{activity.category}</Badge>
                          </div>
                        </div>
                        <Badge className="bg-green-200 text-green-800">
                          {activity.currentMembers} members
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      
                      {activity.meetingTimes && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{activity.meetingTimes}</span>
                        </div>
                      )}
                      
                      {activity.location && (
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{activity.location}</span>
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
                            onClick={() => handleJoinActivity(activity.id)}
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
          )}
        </TabsContent>

        {/* Club Proposals */}
        <TabsContent value="proposals" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Activities Forming Soon</h2>
            <p className="text-muted-foreground">Show interest to help these activities get started</p>
          </div>

          {clubProposals.length === 0 ? (
            <Card className="p-8 text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No proposals yet</h3>
              <p className="text-muted-foreground">
                No one has proposed any new activities yet. Be the first!
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubProposals.map((proposal) => {
                const Icon = getCategoryIcon(proposal.category);
                const isInterested = interestedClubs.has(proposal.id);
                
                return (
                  <Card key={proposal.id} className="p-6 border-4 border-orange-200 bg-orange-50 hover:border-orange-400 transition-all">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-orange-200 border-2 border-orange-300 flex items-center justify-center">
                          <Icon className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{proposal.name}</h3>
                          <p className="text-sm text-muted-foreground">by {proposal.proposerName}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{proposal.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={proposal.status === 'ready_to_form' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                          {proposal.status === 'ready_to_form' ? 'Ready to Form!' : 'Gathering Interest'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {proposal.interestCount}/{proposal.minMembers} interested
                        </span>
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
                            className="w-full bg-orange-500 hover:bg-orange-600"
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
          )}
        </TabsContent>

        {/* Create New Proposal */}
        <TabsContent value="create" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Propose a New Activity</h2>
            <p className="text-muted-foreground">Start something new at your school</p>
          </div>

          <Card className="p-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Lightbulb className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Got an Amazing Idea?</h3>
                <p className="text-muted-foreground text-lg">
                  Turn your passion into a thriving club that brings students together!
                </p>
              </div>
              
              <CreateClubModal onCreateClub={handleCreateProposal}>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-lg transition-all duration-300 text-lg px-8 py-4"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your Club
                </Button>
              </CreateClubModal>
              
              <p className="text-sm text-muted-foreground">
                Join thousands of students creating amazing communities
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FixedActivityDiscovery;
