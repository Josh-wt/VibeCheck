import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Users, BookOpen, Heart, Gamepad2, ChevronDown, Smile } from "lucide-react";
import { Link } from "react-router-dom";
const HeroSection = () => {
  const navigate = useNavigate();
  const studentCards = [{
    id: "01",
    title: "Emma Chen",
    description: "Grade 11 • Loves creative writing, photography, and indie music",
    borderColor: "border-green-400",
    bgColor: "bg-green-50",
    icon: BookOpen,
    illustration: "📸"
  }, {
    id: "02",
    title: "Alex Rivera",
    description: "Grade 10 • Into gaming, coding, and robotics club",
    borderColor: "border-pink-400",
    bgColor: "bg-pink-50",
    icon: Gamepad2,
    illustration: "🎮"
  }, {
    id: "03",
    title: "Maya Patel",
    description: "Grade 12 • Study buddy for math, science, and debate team",
    borderColor: "border-blue-400",
    bgColor: "bg-blue-50",
    icon: Users,
    illustration: "📚"
  }, {
    id: "04",
    title: "Jordan Kim",
    description: "Grade 11 • Volunteer work, environmental club, and hiking",
    borderColor: "border-purple-400",
    bgColor: "bg-purple-50",
    icon: Heart,
    illustration: "🌱"
  }];
  return <section className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto w-full">
        {/* Main Container with Outline */}
        <div className="relative bg-amber-50 border-4 border-amber-200 rounded-2xl sm:rounded-3xl p-6 sm:p-12 lg:p-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* Left Side - Hero Content */}
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Welcome to
                  <span className="block text-foreground">
                    VibeCheck!
                  </span>
                </h1>
                
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-base sm:text-lg text-foreground font-medium">
                    Finding genuine friendships at school
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md mx-auto lg:mx-0">Connect with students that pass your VibeCheck</p>
                </div>
              </div>

              <div className="pt-2 sm:pt-4">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="rounded-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-purple-200 text-purple-800 hover:bg-purple-300 border-2 border-purple-300 w-full sm:w-auto" 
                  onClick={() => navigate("/auth")}
                >
                  Get Started Finding Friends
                </Button>
              </div>
            </div>

            {/* Right Side - Cards Display */}
            <div className="relative mt-8 lg:mt-0">
              {/* "Potential Buddies" text with arrow */}
              <div className="text-center mb-6 sm:mb-8">
                <p className="text-base sm:text-lg font-medium text-foreground mb-2">Potential Buddies</p>
                <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground mx-auto" />
              </div>

              {/* Cards Grid for Mobile, Stack for Desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6 lg:relative">
                {studentCards.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <Card 
                      key={card.id} 
                      className={`
                        p-4 sm:p-6 border-4 ${card.borderColor} ${card.bgColor}
                        shadow-lg hover:shadow-xl transition-all duration-300
                        hover:-translate-y-1
                        lg:absolute lg:w-80 lg:h-64
                      `} 
                      style={{
                        ...(window.innerWidth >= 1024 ? {
                          top: `${index * 40}px`,
                          left: `${index * 30}px`,
                          zIndex: studentCards.length - index,
                          transform: `rotate(${(index - 1.5) * 3}deg)`
                        } : {})
                      }}
                    >
                      <div className="space-y-3 sm:space-y-4 h-full flex flex-col">
                        {/* Card Number */}
                        <div className="flex justify-between items-start">
                          <span className="text-xl sm:text-2xl font-bold text-foreground">{card.id}</span>
                          <div className="text-3xl sm:text-4xl">{card.illustration}</div>
                        </div>

                        {/* Card Content */}
                        <div className="flex-1 space-y-2 sm:space-y-4">
                          <div className="space-y-1 sm:space-y-2">
                            <h3 className="text-lg sm:text-xl font-bold text-foreground">
                              {card.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                              {card.description}
                            </p>
                          </div>
                        </div>

                        {/* Bottom circle element */}
                        <div className="flex justify-end">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-foreground/20"></div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Smiley Face - Hidden on mobile */}
              <div className="hidden lg:block absolute -top-4 -right-16 w-20 h-20 rounded-full border-4 border-foreground bg-background items-center justify-center transform rotate-12">
                <div className="flex items-center justify-center w-full h-full">
                  <Smile className="h-8 w-8 text-foreground" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;