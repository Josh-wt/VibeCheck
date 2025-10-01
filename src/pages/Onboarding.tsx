import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Quiz from "@/components/Discovery/Quiz";
import AcademicAssessment from "@/components/StudyHelp/AcademicAssessment";
import ActivityOnboarding from "@/components/Activities/ActivityOnboarding";
import WeekendAssessment from "@/components/WeekendPlans/WeekendAssessment";
import { 
  Users, 
  BookOpen, 
  Trophy, 
  Calendar,
  CheckCircle2,
  ArrowRight,
  SkipForward,
  Info,
  Heart,
  Brain,
  Target,
  Play
} from "lucide-react";

const Onboarding = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<boolean[]>([false, false, false, false]);
  const [onboardingProgress, setOnboardingProgress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSectionModal, setShowSectionModal] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const sections = [
    {
      id: 'friendship_discovery',
      title: 'Find Your Perfect Friends',
      description: 'Answer questions about your personality, interests, and social preferences to get matched with compatible classmates.',
      benefits: ['Get matched with friends who share your interests', 'Find people with compatible personalities', 'Discover conversation starters and common ground'],
      icon: Users,
      color: 'green',
      route: '/discovery'
    },
    {
      id: 'academic_assessment',
      title: 'Study Partner Matching',
      description: 'Share your academic strengths and subjects where you need help to connect with the perfect study partners.',
      benefits: ['Find study partners for subjects you struggle with', 'Help others in subjects you excel at', 'Create balanced study groups'],
      icon: BookOpen,
      color: 'blue',
      route: '/study-help'
    },
    {
      id: 'activity_onboarding',
      title: 'School Activities & Clubs',
      description: 'Tell us about your interests and availability to get personalized recommendations for clubs and activities.',
      benefits: ['Discover clubs that match your interests', 'Find activities that fit your schedule', 'Connect with like-minded students'],
      icon: Trophy,
      color: 'purple',
      route: '/activities'
    },
    {
      id: 'weekend_assessment',
      title: 'Weekend Social Life',
      description: 'Share your weekend preferences to get matched with fun activities and social groups outside of school.',
      benefits: ['Get personalized weekend activity suggestions', 'Find groups for movies, games, and hangouts', 'Plan amazing weekends with new friends'],
      icon: Calendar,
      color: 'orange',
      route: '/weekend-plans'
    }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadOnboardingProgress();
  }, [user, navigate]);

  useEffect(() => {
    // Handle URL-based section navigation
    if (location.pathname.startsWith('/onboarding/')) {
      const pathSection = location.pathname.split('/')[2];
      let sectionIndex = -1;
      
      switch (pathSection) {
        case 'friends':
          sectionIndex = 0;
          break;
        case 'studybuddies':
          sectionIndex = 1;
          break;
        case 'activities':
          sectionIndex = 2;
          break;
        case 'weekend':
          sectionIndex = 3;
          break;
      }
      
      if (sectionIndex !== -1 && !isLoading) {
        setCurrentSection(sectionIndex);
        setShowSectionModal(true);
      }
    }
  }, [location.pathname, isLoading]);

  const loadOnboardingProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setOnboardingProgress(data);
        setCompletedSections([
          data.friendship_discovery_completed,
          data.academic_assessment_completed,
          data.activity_onboarding_completed,
          data.weekend_assessment_completed
        ]);
      } else {
        // Create initial onboarding progress record
        const { data: newProgress, error: createError } = await supabase
          .from('onboarding_progress')
          .insert([{ user_id: user.id }])
          .select()
          .single();

        if (createError) throw createError;
        setOnboardingProgress(newProgress);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOnboardingProgress = async (sectionId: string) => {
    if (!user) return;

    try {
      const updateData = {
        [`${sectionId}_completed`]: true
      };

      const { error } = await supabase
        .from('onboarding_progress')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      const sectionIndex = sections.findIndex(s => s.id === sectionId);
      if (sectionIndex !== -1) {
        const newCompletedSections = [...completedSections];
        newCompletedSections[sectionIndex] = true;
        setCompletedSections(newCompletedSections);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSectionComplete = async (sectionIndex: number) => {
    const section = sections[sectionIndex];
    await updateOnboardingProgress(section.id);
    
    toast({
      title: "Section Complete!",
      description: `${section.title} setup is complete.`,
    });

    // Trigger AI analysis after friendship discovery (section 0)
    if (sectionIndex === 0) {
      console.log('🎯 Friendship discovery complete - triggering AI analysis');
      await analyzeSocialGroup();
    }

    // Check if this is the last section
    const newCompletedSections = [...completedSections];
    newCompletedSections[sectionIndex] = true;

    // Show completion options
    setCurrentSection(-1); // Go to completion view
  };

  const analyzeSocialGroup = async () => {
    if (!user) return;

    try {
      console.log('=== Starting AI social group analysis ===');
      console.log('User ID:', user.id);
      
      toast({
        title: "Analyzing Your Profile",
        description: "Our AI is determining your social group based on your responses...",
      });

      const { data, error } = await supabase.functions.invoke('analyze-social-group', {
        body: { userId: user.id }
      });

      console.log('=== AI analysis response ===');
      console.log('Data:', data);
      console.log('Error:', error);

      if (error) {
        console.error('Backend function error:', error);
        throw error;
      }

      if (data?.success) {
        console.log('✅ AI analysis successful!');
        console.log('Assigned group:', data.socialGroup);
        toast({
          title: "Analysis Complete!",
          description: `You've been matched to the ${data.socialGroup} group!`,
        });
      } else {
        console.error('❌ AI analysis failed:', data?.error);
        throw new Error(data?.error || 'Analysis failed');
      }
    } catch (error: any) {
      console.error('=== Social group analysis error ===');
      console.error(error);
      toast({
        title: "Analysis Error",
        description: "We'll analyze your profile in the background. You can continue using VibeCheck!",
        variant: "destructive",
      });
    }
  };

  const handleSkipToPage = (route: string) => {
    navigate(route);
  };

  const handleContinueOnboarding = () => {
    // Find next incomplete section
    const nextIncompleteIndex = completedSections.findIndex((completed, index) => 
      !completed && index > currentSection
    );
    
    if (nextIncompleteIndex !== -1) {
      setCurrentSection(nextIncompleteIndex);
    } else {
      // All sections complete, go to dashboard
      navigate('/discovery');
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      green: 'border-green-300 bg-green-50 text-green-600',
      blue: 'border-blue-300 bg-blue-50 text-blue-600',
      purple: 'border-purple-300 bg-purple-50 text-purple-600',
      orange: 'border-orange-300 bg-orange-50 text-orange-600'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.green;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  // Show section completion options
  if (currentSection === -1) {
    const completedCount = completedSections.filter(Boolean).length;
    const allCompleted = completedSections.every(Boolean);
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 text-center">
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 border-4 border-green-300 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {allCompleted ? 'Onboarding Complete!' : 'Great Progress!'}
              </h2>
              <p className="text-muted-foreground">
                You've completed {completedCount} of {sections.length} sections.
                {allCompleted ? ' Our AI has analyzed your responses and determined your social group!' : ' What would you like to do next?'}
              </p>
            </div>

            {allCompleted ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <Brain className="h-6 w-6 text-purple-600" />
                    <h3 className="font-semibold text-purple-800">AI Analysis Complete</h3>
                  </div>
                  <p className="text-purple-700 text-sm">
                    Based on your personality, interests, and preferences, our AI has determined your social group. 
                    This will help us provide better matches and recommendations!
                  </p>
                </div>
                
                <Button
                  onClick={() => navigate('/discovery')}
                  className="w-full flex items-center space-x-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>See Your Social Group & Start Using VibeCheck</span>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/discovery')}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>Start Using VibeCheck</span>
                </Button>
                
                <Button
                  onClick={handleContinueOnboarding}
                  className="flex items-center space-x-2"
                >
                  <span>Continue Setup</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Show section overview
  if (currentSection < sections.length && currentSection >= 0) {
    const section = sections[currentSection];
    const Icon = section.icon;
    const isCompleted = completedSections[currentSection];

    const getSectionModalContent = () => {
      switch (currentSection) {
        case 0:
          return {
            title: "Find Your Perfect Friends",
            description: "Let's discover who you'd click with!",
            content: (
              <>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Heart className="h-6 w-6 text-green-600" />
                    <h3 className="font-semibold text-green-800 text-lg">What happens next?</h3>
                  </div>
                  <p className="text-green-700 mb-3">
                    We'll ask you about your personality, interests, and what you're looking for in friendships. 
                    Think of it like a personality quiz that helps us understand your vibe!
                  </p>
                  <div className="bg-white/70 rounded-lg p-3">
                    <p className="text-green-800 font-medium text-sm">
                      <strong>The magic:</strong> We match you with classmates who share your interests and have compatible personalities!
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">You'll discover people who:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Share your hobbies</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Match your energy</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Want similar friendships</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Have lots to talk about</span>
                    </div>
                  </div>
                </div>
              </>
            )
          };
        case 1:
          return {
            title: "Find Study Partners",
            description: "Let's build your dream study team!",
            content: (
              <>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Brain className="h-6 w-6 text-blue-600" />
                    <h3 className="font-semibold text-blue-800 text-lg">What happens next?</h3>
                  </div>
                  <p className="text-blue-700 mb-3">
                    Tell us which subjects you're awesome at and which ones make you want to hide under a blanket. 
                    We'll create the perfect study squad for you!
                  </p>
                  <div className="bg-white/70 rounded-lg p-3">
                    <p className="text-blue-800 font-medium text-sm">
                      <strong>Smart matching:</strong> You help others in your strong subjects, they help you in theirs!
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">You'll connect with students who:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Excel where you struggle</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Need help in your strengths</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Share your study style</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Want group study sessions</span>
                    </div>
                  </div>
                </div>
              </>
            )
          };
        case 2:
          return {
            title: "Discover School Activities",
            description: "Find clubs and activities you'll love!",
            content: (
              <>
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-6 mb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Target className="h-6 w-6 text-purple-600" />
                    <h3 className="font-semibold text-purple-800 text-lg">What happens next?</h3>
                  </div>
                  <p className="text-purple-700 mb-3">
                    We'll learn about your interests, schedule, and what kind of activities sound fun to you. 
                    Then we'll recommend clubs and activities that are perfect matches!
                  </p>
                  <div className="bg-white/70 rounded-lg p-3">
                    <p className="text-purple-800 font-medium text-sm">
                      🌟 <strong>Perfect fit:</strong> Only activities that match your interests AND your available time!
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">You'll discover:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Clubs for your passions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Activities in your free time</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Leadership opportunities</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>New things to try</span>
                    </div>
                  </div>
                </div>
              </>
            )
          };
        case 3:
          return {
            title: "Plan Amazing Weekends",
            description: "Let's make your weekends awesome!",
            content: (
              <>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6 mb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Calendar className="h-6 w-6 text-orange-600" />
                    <h3 className="font-semibold text-orange-800 text-lg">What happens next?</h3>
                  </div>
                  <p className="text-orange-700 mb-3">
                    Tell us what you love doing for fun, your budget, and your weekend vibe. 
                    We'll match you with groups and activities that make weekends something to look forward to!
                  </p>
                  <div className="bg-white/70 rounded-lg p-3">
                    <p className="text-orange-800 font-medium text-sm">
                      🎊 <strong>Weekend magic:</strong> From movie nights to adventures - we'll find your people!
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">You'll get matched for:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Movie & game nights</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Budget-friendly fun</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Your energy level</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Epic weekend plans</span>
                    </div>
                  </div>
                </div>
              </>
            )
          };
        default:
          return { title: "", description: "", content: null };
      }
    };

    const modalContent = getSectionModalContent();
    
    return (
      <div className="min-h-screen bg-background">
        {/* Section Introduction Modal */}
        <Dialog open={showSectionModal} onOpenChange={setShowSectionModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3 text-xl">
                <div className={`p-2 rounded-full ${getColorClasses(section.color)}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span>{modalContent.title}</span>
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {modalContent.description}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              {modalContent.content}
            </div>
            <div className="flex space-x-3 mt-6">
              <Button 
                onClick={() => setShowSectionModal(false)}
                className="flex-1 flex items-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>Let's Start!</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setCurrentSection(-1)}
                className="flex items-center space-x-2"
              >
                <SkipForward className="h-4 w-4" />
                <span>Skip</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="container mx-auto px-4 py-8">
          {/* Progress */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Section {currentSection + 1} of {sections.length}</span>
              <span>{completedSections.filter(Boolean).length} completed</span>
            </div>
            <Progress value={((currentSection + 1) / sections.length) * 100} className="h-2" />
          </div>

          {/* Section Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-4 mb-4 ${getColorClasses(section.color)}`}>
              <Icon className="h-8 w-8" />
            </div>
            <div className="flex items-center justify-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{section.title}</h1>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowSectionModal(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Info className="h-4 w-4 mr-2" />
                What's this for?
              </Button>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">{section.description}</p>
          </div>

          {/* Section Content */}
          <div className="max-w-4xl mx-auto">
            {currentSection === 0 && (
              <Quiz onComplete={() => handleSectionComplete(0)} />
            )}
            {currentSection === 1 && (
              <AcademicAssessment onComplete={() => handleSectionComplete(1)} />
            )}
            {currentSection === 2 && (
              <ActivityOnboarding onComplete={() => handleSectionComplete(2)} />
            )}
            {currentSection === 3 && (
              <WeekendAssessment onComplete={() => handleSectionComplete(3)} />
            )}
          </div>

          {/* Skip Option */}
          <div className="text-center mt-8">
            <Button
              variant="ghost"
              onClick={() => setCurrentSection(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip this section for now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show onboarding overview
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <h1 className="text-4xl font-bold text-foreground">Welcome to VibeCheck!</h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Info className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-primary" />
                    <span>What is VibeCheck?</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    VibeCheck is like a smart matchmaker for students! Think of it as your personal helper that connects you with the right people at school.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Brain className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Smart Matching</p>
                        <p className="text-sm text-muted-foreground">We use AI to find people who match your personality and interests</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Target className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Find Your People</p>
                        <p className="text-sm text-muted-foreground">Connect with friends, study buddies, activity partners, and weekend hangout groups</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Safe & Easy</p>
                        <p className="text-sm text-muted-foreground">Start conversations with people who already share your interests</p>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Let's set up your personalized profile to help you connect with the right people and activities. 
            Each section creates a unique matching system just for you!
          </p>
          <div className="bg-muted/50 rounded-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-foreground mb-3">How VibeCheck Works:</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p><strong>Answer questions</strong> about your interests, personality, and preferences</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p><strong>Get matched</strong> with compatible classmates using AI-powered algorithms</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p><strong>Receive personalized recommendations</strong> for friends, study groups, and activities</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p><strong>Connect safely</strong> with people who share your vibes and interests</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isCompleted = completedSections[index];
            
            return (
              <Card 
                key={section.id}
                className={`p-6 cursor-pointer transition-all duration-200 border-2 ${
                  isCompleted 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => isCompleted ? handleSkipToPage(section.route) : setCurrentSection(index)}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                      isCompleted 
                        ? 'border-green-300 bg-green-100' 
                        : getColorClasses(section.color)
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground p-1">
                          <Info className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <Icon className="h-5 w-5 text-primary" />
                            <span>{section.title} - Explained Simply</span>
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {section.id === 'friendship_discovery' && (
                            <>
                              <p className="text-muted-foreground">
                                This section is like creating your perfect friend profile! We ask about your personality, hobbies, and what kind of people you like to hang out with.
                              </p>
                              <div className="bg-muted/50 rounded-lg p-4">
                                <p className="font-medium mb-2">What happens:</p>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  <li>• Answer fun questions about yourself</li>
                                  <li>• Tell us your interests and hobbies</li>
                                  <li>• Share what you look for in friends</li>
                                  <li>• Get matched with compatible classmates</li>
                                </ul>
                              </div>
                            </>
                          )}
                          {section.id === 'academic_assessment' && (
                            <>
                              <p className="text-muted-foreground">
                                This helps you find study buddies! Tell us which subjects you're good at and which ones you need help with.
                              </p>
                              <div className="bg-muted/50 rounded-lg p-4">
                                <p className="font-medium mb-2">What happens:</p>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  <li>• Pick subjects you excel at</li>
                                  <li>• Choose subjects you need help with</li>
                                  <li>• Get matched with study partners</li>
                                  <li>• Help others while getting help yourself</li>
                                </ul>
                              </div>
                            </>
                          )}
                          {section.id === 'activity_onboarding' && (
                            <>
                              <p className="text-muted-foreground">
                                Discover clubs and activities perfect for you! We'll recommend groups based on your interests and schedule.
                              </p>
                              <div className="bg-muted/50 rounded-lg p-4">
                                <p className="font-medium mb-2">What happens:</p>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  <li>• Tell us what activities interest you</li>
                                  <li>• Share your available time</li>
                                  <li>• Get personalized club recommendations</li>
                                  <li>• Find activities that fit your schedule</li>
                                </ul>
                              </div>
                            </>
                          )}
                          {section.id === 'weekend_assessment' && (
                            <>
                              <p className="text-muted-foreground">
                                Make your weekends awesome! Find groups to hang out with for movies, games, shopping, or just chilling.
                              </p>
                              <div className="bg-muted/50 rounded-lg p-4">
                                <p className="font-medium mb-2">What happens:</p>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  <li>• Share your weekend preferences</li>
                                  <li>• Tell us your favorite activities</li>
                                  <li>• Get matched with weekend groups</li>
                                  <li>• Plan fun activities with new friends</li>
                                </ul>
                              </div>
                            </>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                      {section.title}
                      {isCompleted && (
                        <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                          Complete
                        </span>
                      )}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3">{section.description}</p>
                    
                    <div className="bg-muted/30 rounded p-3 mb-4">
                      <p className="text-xs font-medium text-foreground mb-2">What you'll get:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {section.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button
                      variant={isCompleted ? "outline" : "default"}
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <span>{isCompleted ? 'Go to Feature' : 'Start Setup'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Skip All */}
        <div className="text-center mt-12">
          <Button
            variant="ghost"
            onClick={() => navigate('/discovery')}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip setup and explore VibeCheck
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;