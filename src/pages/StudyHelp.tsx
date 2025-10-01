import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Layout/Header";
import FixedStudyPartnerResults from "@/components/StudyHelp/FixedStudyPartnerResults";
import OnboardingRedirectModal from "@/components/OnboardingRedirectModal";

const StudyHelp = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
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
      // Check if user has completed academic assessment onboarding
      const { data: progressData, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('academic_assessment_completed')
        .eq('user_id', user.id)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        throw progressError;
      }

      if (progressData?.academic_assessment_completed) {
        setHasOnboardingData(true);
        
        // Load the academic profile
        const { data: profileData, error: profileError } = await supabase
          .from("academic_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }

        if (profileData) {
          setUserProfile(profileData);
        }
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
        requiredSection="academic_assessment"
        sectionTitle="Complete Your Academic Profile"
        sectionDescription="Share your academic strengths and subjects where you need help to connect with perfect study partners."
        onboardingRoute="/onboarding/studybuddies"
        pageTitle="Study Help"
      />
      <Header />
      
      <section className="min-h-screen bg-background px-6 py-20">
        <div className="max-w-6xl mx-auto w-full">
          <div className="relative bg-amber-50 border-4 border-amber-200 rounded-3xl p-12 lg:p-16">
            <FixedStudyPartnerResults userProfile={userProfile} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudyHelp;