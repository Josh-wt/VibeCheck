import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Layout/Header";
import AIStudyPartnerResults from "@/components/StudyHelp/AIStudyPartnerResults";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  if (!hasOnboardingData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="min-h-screen flex items-center justify-center px-6 py-20">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mx-auto mb-4">
              <AlertTriangle className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Complete Your Profile First</h1>
            <p className="text-lg text-muted-foreground">
              To find complementary study partners with AI-powered matching, complete your friendship quiz first. 
              Our AI will analyze your academic strengths and weaknesses to match you with the perfect study partners.
            </p>
            <Button size="lg" onClick={() => navigate('/onboarding/friends')} className="mt-6">
              Take Friendship Quiz
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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