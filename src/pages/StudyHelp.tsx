import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Layout/Header";
import AIStudyPartnerResults from "@/components/StudyHelp/AIStudyPartnerResults";
import OnboardingRedirectModal from "@/components/OnboardingRedirectModal";

const StudyHelp = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [hasOnboardingData, setHasOnboardingData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      // Check if user has completed friendship discovery (which triggers AI analysis)
      const { data: progressData, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('friendship_discovery_completed')
        .eq('user_id', user.id)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        throw progressError;
      }

      if (progressData?.friendship_discovery_completed) {
        setHasOnboardingData(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <OnboardingRedirectModal
        requiredSection="friendship_discovery"
        sectionTitle="Complete Your Friendship Profile"
        sectionDescription="Answer the quiz so AI can analyze your profile and match you with complementary study partners."
        onboardingRoute="/onboarding/friends"
        pageTitle="Study Help"
      />
      <Header />
      
      <section className="min-h-screen bg-background px-6 py-20">
        <div className="max-w-6xl mx-auto w-full">
          <AIStudyPartnerResults />
        </div>
      </section>
    </div>
  );
};

export default StudyHelp;