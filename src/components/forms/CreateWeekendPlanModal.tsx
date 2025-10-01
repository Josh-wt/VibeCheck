import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { 
  FancyDialog, 
  FancyDialogContent, 
  FancyDialogHeader, 
  FancyDialogTitle, 
  FancyDialogDescription,
  FancyDialogTrigger,
  FancyDialogFooter
} from "@/components/ui/fancy-dialog";
import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  Zap,
  Coffee,
  Mountain,
  Gamepad2,
  Music,
  Camera,
  Utensils,
  ShoppingBag,
  Sparkles,
  PartyPopper,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateWeekendPlanModalProps {
  onCreatePlan: (planData: any) => Promise<void>;
  children: React.ReactNode;
}

const planCategories = [
  { value: 'adventure', label: 'Adventure', icon: Mountain, color: 'from-green-500 to-emerald-600' },
  { value: 'social', label: 'Social', icon: Users, color: 'from-blue-500 to-cyan-600' },
  { value: 'entertainment', label: 'Entertainment', icon: Gamepad2, color: 'from-purple-500 to-violet-600' },
  { value: 'cultural', label: 'Cultural', icon: Music, color: 'from-pink-500 to-rose-600' },
  { value: 'food', label: 'Food & Dining', icon: Utensils, color: 'from-orange-500 to-amber-600' },
  { value: 'shopping', label: 'Shopping', icon: ShoppingBag, color: 'from-indigo-500 to-blue-600' },
];

const activityTypes = [
  'Outdoor Adventure', 'Indoor Fun', 'Creative Workshop', 'Sports Activity', 
  'Cultural Event', 'Food Experience', 'Social Gathering', 'Learning Session'
];

export const CreateWeekendPlanModal = ({ onCreatePlan, children }: CreateWeekendPlanModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activity_type: '',
    category: '',
    location: '',
    planned_date: '',
    duration_hours: 3,
    max_participants: 6,
    budget_estimate: ''
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.category || !formData.planned_date) return;
    
    setIsSubmitting(true);
    try {
      await onCreatePlan(formData);
      setIsOpen(false);
      setCurrentStep(1);
      setFormData({
        title: '',
        description: '',
        activity_type: '',
        category: '',
        location: '',
        planned_date: '',
        duration_hours: 3,
        max_participants: 6,
        budget_estimate: ''
      });
    } catch (error) {
      console.error('Error creating plan:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = planCategories.find(cat => cat.value === formData.category);

  const isStepValid = (step: number) => {
    switch (step) {
      case 1: return formData.title && formData.category;
      case 2: return formData.description && formData.planned_date;
      case 3: return true; // Optional details
      default: return false;
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <FancyDialog open={isOpen} onOpenChange={setIsOpen}>
      <FancyDialogTrigger asChild>
        {children}
      </FancyDialogTrigger>
      <FancyDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <FancyDialogHeader>
          <FancyDialogTitle>Plan Epic Weekend Adventures</FancyDialogTitle>
          <FancyDialogDescription>
            Create memorable experiences and bring people together for amazing weekend fun!
          </FancyDialogDescription>
        </FancyDialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300",
                currentStep >= step 
                  ? "bg-gradient-to-br from-secondary to-primary text-white shadow-lg" 
                  : "bg-muted text-muted-foreground"
              )}>
                {currentStep > step ? <PartyPopper className="h-5 w-5" /> : step}
              </div>
              {step < 3 && (
                <div className={cn(
                  "h-1 w-20 mx-4 rounded-full transition-colors duration-300",
                  currentStep > step ? "bg-gradient-to-r from-secondary to-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6 relative z-10">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <Target className="h-12 w-12 mx-auto text-secondary mb-3" />
                <h3 className="text-xl font-semibold mb-2">What's Your Adventure?</h3>
                <p className="text-muted-foreground">Give your weekend plan an exciting name and category!</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plan-title" className="text-base font-medium">Plan Title</Label>
                  <Input
                    id="plan-title"
                    placeholder="Give your adventure an awesome name..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="text-lg p-4 border-2 focus:border-secondary transition-all duration-300"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">Choose Your Vibe</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {planCategories.map((category) => {
                      return (
                        <Card 
                          key={category.value}
                          className={cn(
                            "cursor-pointer transition-all duration-300 hover:scale-105 border-2",
                            formData.category === category.value 
                              ? "border-secondary bg-secondary-soft shadow-lg" 
                              : "border-border hover:border-secondary/50"
                          )}
                          onClick={() => setFormData({ ...formData, category: category.value })}
                        >
                          <CardContent className="p-4 text-center">
                            <div className={cn(
                              "w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center bg-gradient-to-br",
                              category.color
                            )}>
                              <category.icon className="h-8 w-8 text-white" />
                            </div>
                            <p className="font-medium text-sm">{category.label}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Description & Date */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto text-primary mb-3" />
                <h3 className="text-xl font-semibold mb-2">Set the Scene</h3>
                <p className="text-muted-foreground">Describe your plan and when it's happening!</p>
              </div>

              {selectedCategory && (
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Badge className="bg-gradient-to-r from-secondary to-primary text-white text-lg px-4 py-2">
                    {selectedCategory.label}
                  </Badge>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-medium">Plan Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What will you do? Where will you go? Make it sound amazing!"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    className="text-base p-4 border-2 focus:border-primary transition-all duration-300 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="planned-date" className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>When?</span>
                    </Label>
                    <Input
                      id="planned-date"
                      type="datetime-local"
                      min={today}
                      value={formData.planned_date}
                      onChange={(e) => setFormData({ ...formData, planned_date: e.target.value })}
                      className="border-2 focus:border-primary transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activity-type" className="flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>Activity Type</span>
                    </Label>
                    <Select
                      value={formData.activity_type}
                      onValueChange={(value) => setFormData({ ...formData, activity_type: value })}
                    >
                      <SelectTrigger className="border-2 focus:border-primary transition-all duration-300">
                        <SelectValue placeholder="Pick an activity type" />
                      </SelectTrigger>
                      <SelectContent>
                        {activityTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <Sparkles className="h-12 w-12 mx-auto text-yellow-500 mb-3" />
                <h3 className="text-xl font-semibold mb-2">Perfect the Details</h3>
                <p className="text-muted-foreground">Let's fine-tune your amazing plan!</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Location</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="Where's this awesome plan happening?"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="border-2 focus:border-yellow-400 transition-all duration-300"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Duration: {formData.duration_hours} hours</span>
                    </Label>
                    <Slider
                      value={[formData.duration_hours]}
                      onValueChange={(value) => setFormData({ ...formData, duration_hours: value[0] })}
                      max={12}
                      min={1}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>1h</span>
                      <span>12h</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Max Participants: {formData.max_participants}</span>
                    </Label>
                    <Slider
                      value={[formData.max_participants]}
                      onValueChange={(value) => setFormData({ ...formData, max_participants: value[0] })}
                      max={20}
                      min={2}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>2 people</span>
                      <span>20 people</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget" className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Budget Estimate (Optional)</span>
                  </Label>
                  <Select
                    value={formData.budget_estimate}
                    onValueChange={(value) => setFormData({ ...formData, budget_estimate: value })}
                  >
                    <SelectTrigger className="border-2 focus:border-yellow-400 transition-all duration-300">
                      <SelectValue placeholder="What's the budget like?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Free">Free</SelectItem>
                      <SelectItem value="$1-10">$1-10</SelectItem>
                      <SelectItem value="$10-25">$10-25</SelectItem>
                      <SelectItem value="$25-50">$25-50</SelectItem>
                      <SelectItem value="$50+">$50+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        <FancyDialogFooter>
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="border-2"
            >
              Previous
            </Button>
            
            <div className="flex space-x-3">
              {currentStep < 3 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!isStepValid(currentStep)}
                  className="bg-gradient-to-r from-secondary to-primary hover:shadow-lg transition-all duration-300"
                >
                  Next Step
                  <PartyPopper className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isStepValid(currentStep)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>Creating Plan...</>
                  ) : (
                    <>
                      <PartyPopper className="h-4 w-4 mr-2" />
                      Create Plan
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </FancyDialogFooter>
      </FancyDialogContent>
    </FancyDialog>
  );
};