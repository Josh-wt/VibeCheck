import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Trophy, 
  Users, 
  BookOpen, 
  Palette, 
  Heart, 
  Gamepad2,
  Target,
  Star
} from "lucide-react";

interface ActivityOnboardingProps {
  onComplete: () => void;
}

const ActivityOnboarding = ({ onComplete }: ActivityOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({
    currentActivities: [] as string[],
    interestedActivities: [] as string[],
    timeCommitment: '',
    leadershipInterest: '',
    activityGoals: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const predefinedActivities = [
    // Sports
    'Basketball', 'Soccer', 'Track & Field', 'Swimming', 'Tennis', 'Volleyball', 'Football', 'Baseball',
    // Academic
    'Debate Team', 'Science Olympiad', 'Math Club', 'Model UN', 'Academic Decathlon', 'Chess Club',
    // Arts
    'Drama Club', 'Art Club', 'Music Ensemble', 'Creative Writing', 'Photography', 'Dance Team',
    // Technology
    'Robotics', 'Computer Science', 'Game Development', 'Coding Club', 'Tech Support',
    // Service & Leadership
    'Student Government', 'National Honor Society', 'Volunteer Club', 'Environmental Club', 'Peer Tutoring',
    // Special Interest
    'Language Club', 'Cultural Club', 'Film Club', 'Cooking Club', 'Outdoor Adventure'
  ];

  const timeOptions = [
    { value: '1-2 hrs', label: '1-2 hours per week', desc: 'Light participation' },
    { value: '3-5 hrs', label: '3-5 hours per week', desc: 'Regular commitment' },
    { value: '6-10 hrs', label: '6-10 hours per week', desc: 'Serious involvement' },
    { value: '10+ hrs', label: '10+ hours per week', desc: 'Major dedication' }
  ];

  const leadershipOptions = [
    { value: 'love_organizing', label: 'Love organizing & leading', icon: Star },
    { value: 'maybe', label: 'Maybe, if needed', icon: Users },
    { value: 'prefer_participating', label: 'Prefer just participating', icon: Heart }
  ];

  const goalOptions = [
    { value: 'make_friends', label: 'Make new friends', icon: Users },
    { value: 'prep_for_college', label: 'Prepare for college', icon: BookOpen },
    { value: 'build_skills', label: 'Build new skills', icon: Target },
    { value: 'have_fun', label: 'Have fun & relax', icon: Gamepad2 },
    { value: 'help_community', label: 'Help the community', icon: Heart },
    { value: 'compete', label: 'Compete & win', icon: Trophy }
  ];

  const steps = [
    {
      title: "What activities do you currently participate in?",
      subtitle: "Select up to 5 activities you're already doing",
      icon: Trophy,
      maxSelections: 5
    },
    {
      title: "What activities would you like to try?",
      subtitle: "Select up to 5 activities that interest you",
      icon: Star,
      maxSelections: 5
    },
    {
      title: "How much time can you commit per week?",
      subtitle: "Choose the time commitment that works best for you",
      icon: Target,
      isRadio: true
    },
    {
      title: "What's your interest in leadership roles?",
      subtitle: "How do you prefer to participate in activities?",
      icon: Users,
      isRadio: true
    },
    {
      title: "What are your main goals for activities?",
      subtitle: "Choose up to 3 goals that motivate you most",
      icon: Palette,
      maxSelections: 3
    }
  ];

  const currentStepData = steps[currentStep];

  const handleActivityToggle = (activity: string, field: 'currentActivities' | 'interestedActivities') => {
    const currentSelections = responses[field];
    const maxSelections = currentStepData.maxSelections || 0;
    
    if (currentSelections.includes(activity)) {
      setResponses(prev => ({
        ...prev,
        [field]: prev[field].filter(a => a !== activity)
      }));
    } else if (currentSelections.length < maxSelections) {
      setResponses(prev => ({
        ...prev,
        [field]: [...prev[field], activity]
      }));
    }
  };

  const handleGoalToggle = (goal: string) => {
    if (responses.activityGoals.includes(goal)) {
      setResponses(prev => ({
        ...prev,
        activityGoals: prev.activityGoals.filter(g => g !== goal)
      }));
    } else if (responses.activityGoals.length < 3) {
      setResponses(prev => ({
        ...prev,
        activityGoals: [...prev.activityGoals, goal]
      }));
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("activity_profiles")
        .upsert({
          user_id: user.id,
          current_activities: responses.currentActivities,
          interested_activities: responses.interestedActivities,
          time_commitment: responses.timeCommitment,
          leadership_interest: responses.leadershipInterest,
          activity_goals: responses.activityGoals,
          onboarding_completed: true
        });

      if (error) throw error;

      toast({
        title: "Activity Profile Complete!",
        description: "Great! We're generating personalized activity recommendations for you.",
      });
      
      onComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return responses.currentActivities.length > 0;
      case 1: return responses.interestedActivities.length > 0;
      case 2: return responses.timeCommitment !== '';
      case 3: return responses.leadershipInterest !== '';
      case 4: return responses.activityGoals.length > 0;
      default: return false;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const Icon = currentStepData.icon;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
      case 1:
        const field = currentStep === 0 ? 'currentActivities' : 'interestedActivities';
        const selections = responses[field];
        
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
              {predefinedActivities.map((activity) => {
                const isSelected = selections.includes(activity);
                const isDisabled = !isSelected && selections.length >= (currentStepData.maxSelections || 0);
                
                return (
                  <div
                    key={activity}
                    className={`
                      p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 text-center
                      ${isSelected 
                        ? 'border-purple-400 bg-purple-100 shadow-md' 
                        : isDisabled 
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50'
                      }
                    `}
                    onClick={() => !isDisabled && handleActivityToggle(activity, field)}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      className="pointer-events-none mb-2"
                    />
                    <span className={`text-sm font-medium block ${isDisabled ? 'text-gray-400' : 'text-foreground'}`}>
                      {activity}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {selections.length} of {currentStepData.maxSelections} selected
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <RadioGroup 
            value={responses.timeCommitment}
            onValueChange={(value) => setResponses(prev => ({ ...prev, timeCommitment: value }))}
            className="space-y-4"
          >
            {timeOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  <div className="font-medium text-foreground">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.desc}</div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 3:
        return (
          <RadioGroup 
            value={responses.leadershipInterest}
            onValueChange={(value) => setResponses(prev => ({ ...prev, leadershipInterest: value }))}
            className="space-y-4"
          >
            {leadershipOptions.map((option) => {
              const OptionIcon = option.icon;
              return (
                <div key={option.value} className="flex items-center space-x-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <OptionIcon className="h-5 w-5 text-purple-500" />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer font-medium text-foreground">
                    {option.label}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goalOptions.map((goal) => {
                const isSelected = responses.activityGoals.includes(goal.value);
                const isDisabled = !isSelected && responses.activityGoals.length >= 3;
                const GoalIcon = goal.icon;
                
                return (
                  <div
                    key={goal.value}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? 'border-purple-400 bg-purple-100 shadow-md' 
                        : isDisabled 
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50'
                      }
                    `}
                    onClick={() => !isDisabled && handleGoalToggle(goal.value)}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={isSelected}
                        disabled={isDisabled}
                        className="pointer-events-none"
                      />
                      <GoalIcon className={`h-5 w-5 ${isDisabled ? 'text-gray-400' : 'text-purple-500'}`} />
                      <span className={`font-medium ${isDisabled ? 'text-gray-400' : 'text-foreground'}`}>
                        {goal.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {responses.activityGoals.length} of 3 selected
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-purple-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="p-8 border-4 border-purple-300 bg-purple-50 shadow-lg">
        <div className="space-y-8">
          {/* Question Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-200 border-4 border-purple-300">
              <Icon className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {currentStepData.title}
              </h2>
              <p className="text-muted-foreground">
                {currentStepData.subtitle}
              </p>
            </div>
          </div>

          {/* Step Content */}
          {renderStepContent()}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center space-x-2"
        >
          <span>Previous</span>
        </Button>

        <div className="text-center">
          {!canProceed() && (
            <p className="text-sm text-muted-foreground">
              Please make a selection to continue
            </p>
          )}
        </div>

        <Button
          onClick={handleNext}
          disabled={!canProceed() || isSubmitting}
          className="bg-purple-500 hover:bg-purple-600 flex items-center space-x-2"
        >
          <span>
            {currentStep === steps.length - 1 
              ? (isSubmitting ? 'Saving...' : 'Complete Setup')
              : 'Next'
            }
          </span>
        </Button>
      </div>
    </div>
  );
};

export default ActivityOnboarding;