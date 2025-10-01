import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Calculator, FlaskConical, Globe, Code, Palette } from "lucide-react";

interface AcademicAssessmentProps {
  onComplete: () => void;
}

const AcademicAssessment = ({ onComplete }: AcademicAssessmentProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{
    favoriteSubjects: string[];
    struggleSubjects: string[];
    teachingSubjects: string[];
    helpNeededSubjects: string[];
  }>({
    favoriteSubjects: [],
    struggleSubjects: [],
    teachingSubjects: [],
    helpNeededSubjects: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const subjects = [
    "Mathematics/Algebra",
    "English/Literature", 
    "Biology",
    "Chemistry",
    "Physics",
    "History",
    "Spanish/French/Foreign Language",
    "Computer Science",
    "Art/Visual Arts",
    "Music",
    "Geography",
    "Psychology",
    "Economics",
    "Physical Education",
    "Government/Civics"
  ];

  const questions = [
    {
      title: "What are your favorite subjects?",
      subtitle: "Select up to 3 subjects you enjoy most",
      key: "favoriteSubjects" as keyof typeof answers,
      maxSelections: 3,
      icon: BookOpen
    },
    {
      title: "What subjects do you struggle with most?",
      subtitle: "Select up to 3 subjects you find challenging", 
      key: "struggleSubjects" as keyof typeof answers,
      maxSelections: 3,
      icon: FlaskConical
    },
    {
      title: "Which subjects can you easily explain to others?",
      subtitle: "Select up to 3 subjects you feel confident teaching",
      key: "teachingSubjects" as keyof typeof answers,
      maxSelections: 3,
      icon: Calculator
    },
    {
      title: "Which subjects do you need help understanding?",
      subtitle: "Select up to 3 subjects where you'd welcome tutoring",
      key: "helpNeededSubjects" as keyof typeof answers,
      maxSelections: 3,
      icon: Globe
    }
  ];

  const currentQuestionData = questions[currentQuestion];

  const handleSubjectToggle = (subject: string) => {
    const questionKey = currentQuestionData.key;
    const currentSelections = answers[questionKey];
    
    if (currentSelections.includes(subject)) {
      setAnswers(prev => ({
        ...prev,
        [questionKey]: prev[questionKey].filter(s => s !== subject)
      }));
    } else if (currentSelections.length < currentQuestionData.maxSelections) {
      setAnswers(prev => ({
        ...prev,
        [questionKey]: [...prev[questionKey], subject]
      }));
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      console.log('Saving academic profile:', answers);
      
      const { data, error } = await supabase
        .from("academic_profiles")
        .upsert({
          user_id: user.id,
          favorite_subjects: answers.favoriteSubjects,
          struggle_subjects: answers.struggleSubjects,
          teaching_subjects: answers.teachingSubjects,
          help_needed_subjects: answers.helpNeededSubjects,
          assessment_completed: true
        })
        .select();

      console.log('Academic save result:', { data, error });

      if (error) throw error;

      toast({
        title: "Assessment Complete!",
        description: "Your academic profile has been saved. Finding study partners...",
      });
      
      onComplete();
    } catch (error: any) {
      console.error('Academic save error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const canProceed = answers[currentQuestionData.key].length > 0;
  const Icon = currentQuestionData.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="p-8 border-4 border-green-300 bg-green-50 shadow-lg">
        <div className="space-y-6">
          {/* Question Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-200 border-4 border-green-300">
              <Icon className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {currentQuestionData.title}
              </h2>
              <p className="text-muted-foreground">
                {currentQuestionData.subtitle}
              </p>
            </div>
          </div>

          {/* Subject Selection */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => {
              const isSelected = answers[currentQuestionData.key].includes(subject);
              const isDisabled = !isSelected && 
                answers[currentQuestionData.key].length >= currentQuestionData.maxSelections;
              
              return (
                <div
                  key={subject}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                    ${isSelected 
                      ? 'border-green-400 bg-green-100 shadow-md' 
                      : isDisabled 
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-300 bg-white hover:border-green-300 hover:bg-green-50'
                    }
                  `}
                  onClick={() => !isDisabled && handleSubjectToggle(subject)}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      className="pointer-events-none"
                    />
                    <span className={`text-sm font-medium ${isDisabled ? 'text-gray-400' : 'text-foreground'}`}>
                      {subject}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selection Counter */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {answers[currentQuestionData.key].length} of {currentQuestionData.maxSelections} selected
            </p>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="flex items-center space-x-2"
        >
          <span>Previous</span>
        </Button>

        <div className="text-center">
          {!canProceed && (
            <p className="text-sm text-muted-foreground">
              Please select at least one subject to continue
            </p>
          )}
        </div>

        <Button
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
          className="bg-green-500 hover:bg-green-600 flex items-center space-x-2"
        >
          <span>
            {currentQuestion === questions.length - 1 
              ? (isSubmitting ? 'Saving...' : 'Complete Assessment')
              : 'Next'
            }
          </span>
        </Button>
      </div>
    </div>
  );
};

export default AcademicAssessment;