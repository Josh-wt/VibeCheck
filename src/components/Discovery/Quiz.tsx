import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface QuizProps {
  onComplete: () => void;
}

const Quiz = ({ onComplete }: QuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const questions = [
    {
      question: "What activities make you completely lose track of time?",
      options: [
        "Reading books or writing stories",
        "Playing video games or board games", 
        "Creating art or crafts",
        "Playing sports or being active",
        "Learning new tech skills or coding",
        "Performing music or theater"
      ]
    },
    {
      question: "How do you prefer to spend time with friends?",
      options: [
        "One-on-one deep conversations",
        "Group gaming sessions",
        "Working on creative projects together",
        "Outdoor adventures and activities",
        "Collaborative learning or studying",
        "Large social gatherings"
      ]
    },
    {
      question: "What kind of environment helps you feel most comfortable?",
      options: [
        "Quiet libraries or cozy spaces",
        "Gaming lounges or tech spaces",
        "Art studios or maker spaces",
        "Outdoor natural settings",
        "Science labs or workshops",
        "Performance stages or social venues"
      ]
    },
    {
      question: "When you have free time after school, what do you typically choose to do?",
      options: [
        "Read, write, or explore stories",
        "Game with friends online or offline",
        "Create art or work on crafts",
        "Go outside and be active",
        "Explore technology or coding",
        "Practice performing arts"
      ]
    },
    {
      question: "What motivates you most when working on school projects?",
      options: [
        "Expressing ideas through writing",
        "Solving problems strategically",
        "Creating something beautiful",
        "Active hands-on involvement",
        "Learning new technical skills",
        "Presenting to an audience"
      ]
    }
  ];

  const handleAnswer = async (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      await handleSubmit(newAnswers);
    }
  };

  const handleSubmit = async (finalAnswers: string[]) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      console.log('Saving quiz responses:', finalAnswers);
      console.log('User ID:', user.id);
      
      const { data, error } = await supabase
        .from("profiles")
        .update({ quiz_responses: finalAnswers })
        .eq("user_id", user.id)
        .select();

      console.log('Quiz save result:', { data, error });

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Failed to save quiz responses - no profile found');
      }

      toast({
        title: "Quiz Complete!",
        description: "Your responses have been saved.",
      });
      
      onComplete();
    } catch (error: any) {
      console.error('Quiz save error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAnswers(answers.slice(0, -1));
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-8">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="p-8 border-4 border-green-300 bg-green-50 shadow-lg">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-foreground leading-relaxed">
              {questions[currentQuestion].question}
            </h2>

            <div className="grid gap-4">
              {questions[currentQuestion].options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="p-6 h-auto text-left justify-start bg-white hover:bg-green-100 hover:border-green-400 text-foreground transition-all duration-200 border-2"
                  onClick={() => handleAnswer(option)}
                  disabled={isSubmitting}
                >
                  <div className="flex items-center space-x-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-green-400 bg-white flex items-center justify-center text-sm font-bold text-green-600">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-base leading-relaxed">{option}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={goBack}
            disabled={currentQuestion === 0}
            className="space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <span className="text-sm text-muted-foreground self-center">
            Select an answer to continue
          </span>
        </div>
      </div>
    </div>
  );
};

export default Quiz;