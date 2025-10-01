import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, ArrowRight, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingRedirectModalProps {
  requiredSection: 'friendship_discovery' | 'academic_assessment' | 'activity_onboarding' | 'weekend_assessment';
  sectionTitle: string;
  sectionDescription: string;
  onboardingRoute: string;
  pageTitle: string;
}

const OnboardingRedirectModal = ({ 
  requiredSection, 
  sectionTitle, 
  sectionDescription, 
  onboardingRoute,
  pageTitle 
}: OnboardingRedirectModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select(requiredSection + '_completed')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking onboarding status:', error);
        setIsLoading(false);
        return;
      }

      // If no data or section not completed, show modal
      if (!data || !data[requiredSection + '_completed']) {
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteOnboarding = () => {
    navigate(onboardingRoute);
  };

  const handleSkipOnboarding = () => {
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">Setup Required</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Complete your profile to access {pageTitle}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkipOnboarding}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <div className="space-y-3">
            <h3 className="font-medium text-orange-900">{sectionTitle}</h3>
            <p className="text-sm text-orange-800">{sectionDescription}</p>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                onClick={handleCompleteOnboarding}
                className="flex items-center space-x-2 flex-1"
                size="sm"
              >
                <span>Complete Setup</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSkipOnboarding}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Skip for now
              </Button>
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingRedirectModal;