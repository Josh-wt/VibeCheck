import { Card } from "@/components/ui/card";
import { ClipboardList, Users, Heart } from "lucide-react";
const ProcessSection = () => {
  const steps = [{
    number: "01",
    title: "Take the VibeCheck",
    description: "Tell us about your interests, study habits, and what makes you tick!",
    icon: ClipboardList,
    illustration: "📝",
    bgColor: "bg-green-50",
    borderColor: "border-green-300"
  }, {
    number: "02",
    title: "Find Your People",
    description: "We'll match you with classmates who share your vibe and interests",
    icon: Users,
    illustration: "🤝",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300"
  }, {
    number: "03",
    title: "Start Connecting",
    description: "Chat, study together, and build real friendships that last beyond graduation",
    icon: Heart,
    illustration: "💫",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-300"
  }];
  return <section className="py-20 px-6 bg-amber-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            How VibeCheck Works
          </h2>
          <p className="text-lg text-foreground font-medium max-w-2xl mx-auto">
            Three simple steps to finding your school squad
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
          const Icon = step.icon;
          return <Card key={step.number} className={`p-8 text-center border-4 ${step.borderColor} ${step.bgColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group rounded-2xl relative overflow-hidden`}>
                {/* Decorative dots */}
                <div className="absolute top-4 right-4 w-3 h-3 rounded-full border-2 border-foreground/20"></div>
                <div className="absolute top-4 right-10 w-2 h-2 rounded-full bg-foreground/10"></div>
                
                <div className="space-y-6">
                  {/* Step number and illustration */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-bold text-foreground">{step.number}</span>
                    
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Bottom decorative element */}
                  <div className="flex justify-center pt-4">
                    <div className="w-8 h-8 rounded-full border-2 border-foreground/20 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-foreground/60" />
                    </div>
                  </div>
                </div>
              </Card>;
        })}
        </div>
      </div>
    </section>;
};
export default ProcessSection;