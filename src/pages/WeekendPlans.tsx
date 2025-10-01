import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Layout/Header";
import RealWeekendDiscovery from "@/components/WeekendPlans/RealWeekendDiscovery";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WeekendPlans = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [weekendInterests, setWeekendInterests] = useState<any>(null);
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
      // Check if user has completed weekend assessment onboarding
      const { data: progressData, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('weekend_assessment_completed')
        .eq('user_id', user.id)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        throw progressError;
      }

      if (progressData?.weekend_assessment_completed) {
        setHasOnboardingData(true);
        
        // Load the weekend interests
        const { data: interestsData, error: interestsError } = await supabase
          .from('weekend_interests')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (interestsError && interestsError.code !== 'PGRST116') {
          throw interestsError;
        }

        if (interestsData) {
          setWeekendInterests(interestsData);
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

  if (!hasOnboardingData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="min-h-screen flex items-center justify-center px-6 py-20">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 mx-auto mb-4">
              <AlertTriangle className="h-10 w-10 text-orange-600" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Complete Your Weekend Profile</h1>
            <p className="text-lg text-muted-foreground">
              Share your weekend preferences, energy levels, and budget to get matched with fun activities 
              and social groups that fit your lifestyle outside of school.
            </p>
            <Button size="lg" onClick={() => navigate('/onboarding/weekend')} className="mt-6">
              Setup Weekend Profile
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
          <div className="relative bg-orange-50 border-4 border-orange-200 rounded-3xl p-12 lg:p-16">
            <RealWeekendDiscovery userProfile={weekendInterests} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default WeekendPlans;