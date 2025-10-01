import { Card } from "@/components/ui/card";
import { Shield, Lock, Users, CheckCircle } from "lucide-react";
const TrustSection = () => {
  const features = [{
    icon: Shield,
    title: "School Email Required",
    description: "Only verified students from your school can join - no randos allowed!",
    illustration: "🛡️",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300"
  }, {
    icon: Lock,
    title: "Privacy First",
    description: "We only share your first name and interests - your personal info stays locked down",
    illustration: "🔒",
    bgColor: "bg-green-50",
    borderColor: "border-green-300"
  }, {
    icon: Users,
    title: "School Supervised",
    description: "Your school's admin team keeps an eye on things to make sure everything stays cool",
    illustration: "👥",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300"
  }, {
    icon: CheckCircle,
    title: "Good Vibes Only",
    description: "Our smart matching reduces drama and focuses on genuine compatibility",
    illustration: "✨",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300"
  }];
  return <section className="py-20 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Main container with outline like hero */}
        <div className="bg-amber-50 border-4 border-amber-200 rounded-3xl p-12 lg:p-16">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Safe & Trusted by Schools
            </h2>
            <p className="text-lg text-foreground font-medium max-w-2xl mx-auto">
              Your safety and privacy matter - that's why we've built VibeCheck with you in mind
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
            const Icon = feature.icon;
            return <Card key={index} className={`p-8 border-4 ${feature.borderColor} ${feature.bgColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group rounded-2xl relative`}>
                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-3 h-3 rounded-full border-2 border-foreground/20"></div>
                  
                  <div className="space-y-6">
                    {/* Icon and illustration */}
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-background border-2 border-foreground/20 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-6 w-6 text-foreground" />
                      </div>
                      
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="font-bold text-foreground text-lg">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    {/* Bottom decorative circle */}
                    <div className="flex justify-end pt-2">
                      <div className="w-6 h-6 rounded-full border-2 border-foreground/20"></div>
                    </div>
                  </div>
                </Card>;
          })}
          </div>
        </div>
      </div>
    </section>;
};
export default TrustSection;