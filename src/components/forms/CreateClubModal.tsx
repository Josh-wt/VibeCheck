import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  Users, 
  Lightbulb, 
  Plus, 
  Star, 
  Trophy, 
  BookOpen, 
  Heart, 
  MapPin, 
  Clock,
  Sparkles,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateClubModalProps {
  onCreateClub: (clubData: any) => Promise<void>;
  children: React.ReactNode;
}

const clubCategories = [
  { value: 'academic', label: 'Academic', icon: BookOpen, color: 'from-blue-500 to-blue-600' },
  { value: 'sports', label: 'Sports', icon: Trophy, color: 'from-green-500 to-green-600' },
  { value: 'arts', label: 'Arts & Creative', icon: Star, color: 'from-purple-500 to-purple-600' },
  { value: 'technology', label: 'Technology', icon: Lightbulb, color: 'from-yellow-500 to-orange-500' },
  { value: 'service', label: 'Community Service', icon: Heart, color: 'from-red-500 to-pink-500' },
  { value: 'leadership', label: 'Leadership', icon: Users, color: 'from-indigo-500 to-indigo-600' },
];

export const CreateClubModal = ({ onCreateClub, children }: CreateClubModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    meetingTimes: '',
    location: '',
    minMembers: 5
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.description) return;
    
    setIsSubmitting(true);
    try {
      await onCreateClub(formData);
      setIsOpen(false);
      setCurrentStep(1);
      setFormData({
        name: '',
        category: '',
        description: '',
        meetingTimes: '',
        location: '',
        minMembers: 5
      });
    } catch (error) {
      console.error('Error creating club:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = clubCategories.find(cat => cat.value === formData.category);

  const isStepValid = (step: number) => {
    switch (step) {
      case 1: return formData.name && formData.category;
      case 2: return formData.description;
      case 3: return true; // Optional details
      default: return false;
    }
  };

  return (
    <FancyDialog open={isOpen} onOpenChange={setIsOpen}>
      <FancyDialogTrigger asChild>
        {children}
      </FancyDialogTrigger>
      <FancyDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <FancyDialogHeader>
          <FancyDialogTitle>Create Your Dream Club</FancyDialogTitle>
          <FancyDialogDescription>
            Turn your passion into a community. Let's create something amazing together!
          </FancyDialogDescription>
        </FancyDialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300",
                currentStep >= step 
                  ? "bg-gradient-to-br from-primary to-secondary text-white shadow-lg" 
                  : "bg-muted text-muted-foreground"
              )}>
                {currentStep > step ? <Sparkles className="h-5 w-5" /> : step}
              </div>
              {step < 3 && (
                <div className={cn(
                  "h-1 w-20 mx-4 rounded-full transition-colors duration-300",
                  currentStep > step ? "bg-gradient-to-r from-primary to-secondary" : "bg-muted"
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
                <Target className="h-12 w-12 mx-auto text-primary mb-3" />
                <h3 className="text-xl font-semibold mb-2">Let's Start with the Basics</h3>
                <p className="text-muted-foreground">What's your club called and what's it about?</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="club-name" className="text-base font-medium">Club Name</Label>
                  <Input
                    id="club-name"
                    placeholder="Enter an exciting club name..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="text-lg p-4 border-2 focus:border-primary transition-all duration-300"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">Choose Your Category</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {clubCategories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <Card 
                          key={category.value}
                          className={cn(
                            "cursor-pointer transition-all duration-300 hover:scale-105 border-2",
                            formData.category === category.value 
                              ? "border-primary bg-primary-soft shadow-lg" 
                              : "border-border hover:border-primary/50"
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

          {/* Step 2: Description */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <Lightbulb className="h-12 w-12 mx-auto text-secondary mb-3" />
                <h3 className="text-xl font-semibold mb-2">Tell Your Story</h3>
                <p className="text-muted-foreground">What makes your club special? What will members do?</p>
              </div>

              {selectedCategory && (
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Badge className="bg-gradient-to-r from-primary to-secondary text-white text-lg px-4 py-2">
                    {selectedCategory.label}
                  </Badge>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-medium">Club Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your club's mission, activities, and what members can expect. Be inspiring!"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="text-base p-4 border-2 focus:border-secondary transition-all duration-300 resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  {formData.description.length}/500 characters
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <Star className="h-12 w-12 mx-auto text-yellow-500 mb-3" />
                <h3 className="text-xl font-semibold mb-2">Final Details</h3>
                <p className="text-muted-foreground">Almost there! Let's add some practical information.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="meeting-times" className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Meeting Times</span>
                  </Label>
                  <Input
                    id="meeting-times"
                    placeholder="e.g., Wednesdays 3:30-4:30 PM"
                    value={formData.meetingTimes}
                    onChange={(e) => setFormData({ ...formData, meetingTimes: e.target.value })}
                    className="border-2 focus:border-yellow-400 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Location</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., Room 201, Library, Online"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="border-2 focus:border-yellow-400 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="min-members" className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Minimum Members to Start</span>
                  </Label>
                  <Select
                    value={formData.minMembers.toString()}
                    onValueChange={(value) => setFormData({ ...formData, minMembers: parseInt(value) })}
                  >
                    <SelectTrigger className="border-2 focus:border-yellow-400 transition-all duration-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} members
                        </SelectItem>
                      ))}
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
                  className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-300"
                >
                  Next Step
                  <Sparkles className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isStepValid(currentStep)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>Creating Club...</>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      Create Club
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