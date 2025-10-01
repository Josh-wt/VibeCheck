import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Zap, 
  Clock,
  Shield,
  Film,
  Coffee,
  ShoppingBag,
  Gamepad2,
  Mountain,
  Paintbrush,
  Music,
  BookOpen
} from "lucide-react";

interface WeekendAssessmentProps {
  onComplete: () => void;
}

const WeekendAssessment = ({ onComplete }: WeekendAssessmentProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({
    favoriteActivities: [] as string[],
    energyLevel: '',
    preferredGroupSize: '',
    budgetRange: '',
    preferredTimings: [] as string[],
    parentPermissionLevel: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const activityOptions = [
    { value: 'movies_entertainment', label: 'Movies & Entertainment', icon: Film },
    { value: 'coffee_cafes', label: 'Coffee & Cafes', icon: Coffee },
    { value: 'shopping_malls', label: 'Shopping & Malls', icon: ShoppingBag },
    { value: 'gaming_arcades', label: 'Gaming & Arcades', icon: Gamepad2 },
    { value: 'outdoor_activities', label: 'Outdoor Activities', icon: Mountain },
    { value: 'creative_arts', label: 'Creative & Arts', icon: Paintbrush },
    { value: 'music_concerts', label: 'Music & Concerts', icon: Music },
    { value: 'study_hangouts', label: 'Study Hangouts', icon: BookOpen },
    { value: 'sports_recreation', label: 'Sports & Recreation', icon: Zap },
    { value: 'food_restaurants', label: 'Food & Restaurants', icon: Coffee }
  ];

  const energyOptions = [
    { value: 'high_energy', label: 'High Energy', desc: 'Active, adventurous activities' },
    { value: 'balanced', label: 'Balanced', desc: 'Mix of active and relaxed' },
    { value: 'low_key', label: 'Low Key', desc: 'Chill, relaxed hangouts' }
  ];

  const groupSizeOptions = [
    { value: 'one_on_one', label: '1-on-1 Hangouts', desc: 'Just you and one friend' },
    { value: 'small_group', label: 'Small Groups', desc: '3-4 close friends' },
    { value: 'larger_group', label: 'Larger Groups', desc: '5+ people, more social' },
    { value: 'flexible', label: 'Flexible', desc: 'Any group size works' }
  ];

  const budgetOptions = [
    { value: 'free', label: 'Free Activities', desc: '$0 - Parks, hanging out' },
    { value: 'low_budget', label: 'Low Budget', desc: '$5-15 - Snacks, coffee' },
    { value: 'medium_budget', label: 'Medium Budget', desc: '$15-30 - Movies, meals' },
    { value: 'high_budget', label: 'Higher Budget', desc: '$30+ - Events, experiences' }
  ];

  const timingOptions = [
    'Friday Evening',
    'Friday Night',
    'Saturday Morning',
    'Saturday Afternoon',
    'Saturday Evening',
    'Sunday Morning',
    'Sunday Afternoon',
    'Sunday Evening'
  ];

  const parentPermissionOptions = [
    { value: 'strict', label: 'Advance Planning Required', desc: 'Need several days notice' },
    { value: 'advance_notice', label: 'Some Planning Needed', desc: 'Day before is usually okay' },
    { value: 'spontaneous', label: 'Pretty Flexible', desc: 'Same-day plans are fine' }
  ];

  const steps = [
    {
      title: "What are your favorite weekend activities?",
      subtitle: "Select up to 5 activities you love doing",
      icon: Calendar,
      maxSelections: 5
    },
    {
      title: "What's your energy level for weekends?",
      subtitle: "How do you like to spend your free time?",
      icon: Zap,
      isRadio: true
    },
    {
      title: "What group size do you prefer?",
      subtitle: "How many people make the perfect hangout?",
      icon: Users,
      isRadio: true
    },
    {
      title: "What's your typical weekend budget?",
      subtitle: "How much are you comfortable spending?",
      icon: DollarSign,
      isRadio: true
    },
    {
      title: "When do you prefer weekend activities?",
      subtitle: "Select your favorite times (choose multiple)",
      icon: Clock,
      maxSelections: 4
    },
    {
      title: "How flexible are your parents with plans?",
      subtitle: "This helps us suggest appropriate timing",
      icon: Shield,
      isRadio: true
    }
  ];

  const currentStepData = steps[currentStep];

  const handleActivityToggle = (activity: string) => {
    if (responses.favoriteActivities.includes(activity)) {
      setResponses(prev => ({
        ...prev,
        favoriteActivities: prev.favoriteActivities.filter(a => a !== activity)
      }));
    } else if (responses.favoriteActivities.length < 5) {
      setResponses(prev => ({
        ...prev,
        favoriteActivities: [...prev.favoriteActivities, activity]
      }));
    }
  };

  const handleTimingToggle = (timing: string) => {
    if (responses.preferredTimings.includes(timing)) {
      setResponses(prev => ({
        ...prev,
        preferredTimings: prev.preferredTimings.filter(t => t !== timing)
      }));
    } else if (responses.preferredTimings.length < 4) {
      setResponses(prev => ({
        ...prev,
        preferredTimings: [...prev.preferredTimings, timing]
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
        .from("weekend_interests")
        .upsert({
          user_id: user.id,
          favorite_activities: responses.favoriteActivities,
          energy_level: responses.energyLevel,
          preferred_group_size: responses.preferredGroupSize,
          budget_range: responses.budgetRange,
          preferred_timings: responses.preferredTimings,
          parent_permission_level: responses.parentPermissionLevel,
          assessment_completed: true
        });

      if (error) throw error;

      toast({
        title: "Weekend Profile Complete!",
        description: "Great! We're finding perfect weekend opportunities for you.",
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
      case 0: return responses.favoriteActivities.length > 0;
      case 1: return responses.energyLevel !== '';
      case 2: return responses.preferredGroupSize !== '';
      case 3: return responses.budgetRange !== '';
      case 4: return responses.preferredTimings.length > 0;
      case 5: return responses.parentPermissionLevel !== '';
      default: return false;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const Icon = currentStepData.icon;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activityOptions.map((activity) => {
                const isSelected = responses.favoriteActivities.includes(activity.value);
                const isDisabled = !isSelected && responses.favoriteActivities.length >= 5;
                const ActivityIcon = activity.icon;
                
                return (
                  <div
                    key={activity.value}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? 'border-blue-400 bg-blue-100 shadow-md' 
                        : isDisabled 
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50'
                      }
                    `}
                    onClick={() => !isDisabled && handleActivityToggle(activity.value)}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={isSelected}
                        disabled={isDisabled}
                        className="pointer-events-none"
                      />
                      <ActivityIcon className={`h-5 w-5 ${isDisabled ? 'text-gray-400' : 'text-blue-500'}`} />
                      <span className={`font-medium ${isDisabled ? 'text-gray-400' : 'text-foreground'}`}>
                        {activity.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {responses.favoriteActivities.length} of 5 selected
              </p>
            </div>
          </div>
        );

      case 1:
        return (
          <RadioGroup 
            value={responses.energyLevel}
            onValueChange={(value) => setResponses(prev => ({ ...prev, energyLevel: value }))}
            className="space-y-4"
          >
            {energyOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  <div className="font-medium text-foreground">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.desc}</div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 2:
        return (
          <RadioGroup 
            value={responses.preferredGroupSize}
            onValueChange={(value) => setResponses(prev => ({ ...prev, preferredGroupSize: value }))}
            className="space-y-4"
          >
            {groupSizeOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300">
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
            value={responses.budgetRange}
            onValueChange={(value) => setResponses(prev => ({ ...prev, budgetRange: value }))}
            className="space-y-4"
          >
            {budgetOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  <div className="font-medium text-foreground">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.desc}</div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-3">
              {timingOptions.map((timing) => {
                const isSelected = responses.preferredTimings.includes(timing);
                const isDisabled = !isSelected && responses.preferredTimings.length >= 4;
                
                return (
                  <div
                    key={timing}
                    className={`
                      p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 text-center
                      ${isSelected 
                        ? 'border-blue-400 bg-blue-100 shadow-md' 
                        : isDisabled 
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50'
                      }
                    `}
                    onClick={() => !isDisabled && handleTimingToggle(timing)}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      className="pointer-events-none mb-2"
                    />
                    <span className={`text-sm font-medium block ${isDisabled ? 'text-gray-400' : 'text-foreground'}`}>
                      {timing}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {responses.preferredTimings.length} of 4 selected
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <RadioGroup 
            value={responses.parentPermissionLevel}
            onValueChange={(value) => setResponses(prev => ({ ...prev, parentPermissionLevel: value }))}
            className="space-y-4"
          >
            {parentPermissionOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  <div className="font-medium text-foreground">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.desc}</div>
                </Label>
              </div>
            ))}
          </RadioGroup>
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
            className="bg-blue-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="p-8 border-4 border-blue-300 bg-blue-50 shadow-lg">
        <div className="space-y-8">
          {/* Question Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-200 border-4 border-blue-300">
              <Icon className="h-8 w-8 text-blue-600" />
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
          className="bg-blue-500 hover:bg-blue-600 flex items-center space-x-2"
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

export default WeekendAssessment;