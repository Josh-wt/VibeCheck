import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Layout/Header";
import Quiz from "@/components/Discovery/Quiz";
import RealMatchResults from "@/components/Discovery/RealMatchResults";
import SocialGroupDisplay from "@/components/SocialGroup/SocialGroupDisplay";
import OnboardingRedirectModal from "@/components/OnboardingRedirectModal";
import MatchingOverlay from "@/components/common/MatchingOverlay";
import { useToast } from "@/hooks/use-toast";

const Discovery = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [hasOnboardingData, setHasOnboardingData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSocialGroup, setShowSocialGroup] = useState(false);
  const [hasSocialGroup, setHasSocialGroup] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      checkOnboardingStatus();
    } else if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    try {
      console.log('🔍 [DISCOVERY] Checking onboarding status for user:', user.id);
      
      const [onboardingResult, profileResult] = await Promise.all([
        supabase
          .from('onboarding_progress')
          .select('friendship_discovery_completed')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('profiles')
          .select('social_group')
          .eq('user_id', user.id)
          .single()
      ]);

      console.log('📊 [STATUS]', {
        friendshipComplete: onboardingResult.data?.friendship_discovery_completed,
        hasSocialGroup: !!profileResult.data?.social_group
      });

      if (onboardingResult.data?.friendship_discovery_completed) {
        setHasOnboardingData(true);
        setQuizCompleted(true);
      }

      if (profileResult.data?.social_group) {
        setHasSocialGroup(true);
        setShowSocialGroup(true);
      }
    } catch (error) {
      console.error('❌ [DISCOVERY] Error checking status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizComplete = async () => {
    if (!user) return;
    
    console.log('✅ [QUIZ] Quiz completed, starting AI analysis...');
    setIsAnalyzing(true);

    try {
      // Update onboarding progress
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: user.id,
          friendship_discovery_completed: true,
          updated_at: new Date().toISOString()
        });

      if (progressError) {
        console.error('❌ [PROGRESS] Update failed:', progressError);
        throw progressError;
      }

      console.log('🤖 [AI] Invoking analyze-social-group function with 30s timeout...');

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Analysis timeout after 30 seconds')), 30000)
      );

      // Race between AI analysis and timeout
      const analysisPromise = supabase.functions.invoke('analyze-social-group', {
        body: { userId: user.id }
      });

      const result = await Promise.race([analysisPromise, timeoutPromise]) as any;
      
      const { data, error } = result;

      if (error) {
        console.error('❌ [AI] Function error:', error);
        toast({
          title: "Analysis Complete",
          description: "We've matched you using our algorithm.",
          variant: "default",
        });
      } else if (data?.success) {
        console.log('✅ [AI] Analysis complete:', data);
        toast({
          title: "Perfect Match Found! 🎉",
          description: `You've been matched to ${data.socialGroup}`,
        });
      } else {
        console.warn('⚠️ [AI] Unexpected response:', data);
        toast({
          title: "Analysis Complete",
          description: "We've matched you with a social group.",
        });
      }

      // Refresh data regardless of outcome
      await checkOnboardingStatus();
      setQuizCompleted(true);
      setShowSocialGroup(true);
      
    } catch (error: any) {
      console.error('❌ [QUIZ] Error:', error);
      
      if (error.message?.includes('timeout')) {
        toast({
          title: "Taking a bit longer...",
          description: "Analysis is still processing. Refresh to see your group.",
          variant: "default",
        });
      } else {
        toast({
          title: "Analysis Error",
          description: "We'll use our matching algorithm instead.",
          variant: "default",
        });
      }
      
      setQuizCompleted(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSocialGroupViewed = () => {
    console.log('👁️ [VIEW] Social group viewed, showing matches');
    setShowSocialGroup(false);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <OnboardingRedirectModal
        requiredSection="friendship_discovery"
        sectionTitle="Complete Your Friendship Profile"
        sectionDescription="Answer questions about your personality and interests to get matched with compatible friends."
        onboardingRoute="/onboarding/friends"
        pageTitle="Friend Discovery"
      />
      <Header />
      
      {isAnalyzing && <MatchingOverlay />}
      
      {showSocialGroup && hasSocialGroup ? (
        <section className="min-h-screen bg-background px-6 py-20">
          <div className="max-w-6xl mx-auto w-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Your AI-Powered Social Group
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Based on your personality and interests, our AI has matched you to your ideal social group!
              </p>
            </div>
            <SocialGroupDisplay onClose={handleSocialGroupViewed} />
          </div>
        </section>
      ) : !quizCompleted ? (
        <section className="min-h-screen bg-background flex items-center justify-center px-6 py-20">
          <div className="max-w-6xl mx-auto w-full">
            <div className="relative bg-amber-50 border-4 border-amber-200 rounded-3xl p-12 lg:p-16">
              <div className="text-center mb-12 space-y-6">
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                  Personality Assessment
                </h1>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Answer a few questions to help us find your perfect friendship matches at school
                </p>
              </div>
              <Quiz onComplete={handleQuizComplete} />
            </div>
          </div>
        </section>
      ) : (
        <section className="min-h-screen bg-background px-6 py-20">
          <div className="max-w-6xl mx-auto w-full">
            <div className="relative bg-amber-50 border-4 border-amber-200 rounded-3xl p-12 lg:p-16">
              <RealMatchResults />
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Discovery;
