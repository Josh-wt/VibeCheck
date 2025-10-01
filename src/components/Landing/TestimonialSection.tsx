import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";
const TestimonialSection = () => {
  const testimonials = [{
    name: "Sarah M.",
    grade: "Grade 11",
    quote: "Found my writing buddy through VibeCheck! We're literally working on our first novel together now",
    group: "Creative Squad",
    illustration: "✍️",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-300"
  }, {
    name: "Marcus T.",
    grade: "Grade 10",
    quote: "I was super shy about joining clubs, but this app helped me find my gaming crew. Now we hang out every day!",
    group: "Gaming Legends",
    illustration: "🎮",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300"
  }, {
    name: "Emma L.",
    grade: "Grade 12",
    quote: "Never thought I'd find people as passionate about saving the planet as me. Now we volunteer every weekend!",
    group: "Eco Warriors",
    illustration: "🌱",
    bgColor: "bg-green-50",
    borderColor: "border-green-300"
  }, {
    name: "David R.",
    grade: "Grade 9",
    quote: "Moving schools was terrifying, but VibeCheck helped me find friends who actually get my coding obsession!",
    group: "Code Crew",
    illustration: "💻",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300"
  }];
  return <section className="py-20 px-6 bg-amber-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            Real Student Stories
          </h2>
          <p className="text-lg text-foreground font-medium max-w-2xl mx-auto">
            See how VibeCheck is changing friendships at schools everywhere!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => <Card key={index} className={`p-8 border-4 ${testimonial.borderColor} ${testimonial.bgColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group rounded-2xl relative overflow-hidden`}>
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-3 h-3 rounded-full border-2 border-foreground/20"></div>
              <div className="absolute top-4 right-10 w-2 h-2 rounded-full bg-foreground/10"></div>

              <div className="space-y-6 relative">
                {/* Illustration and quote */}
                <div className="flex items-start justify-between">
                  <Quote className="h-8 w-8 text-foreground/30 flex-shrink-0" />
                  
                </div>

                <blockquote className="text-foreground leading-relaxed font-medium">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <p className="font-bold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.grade}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-3 py-2 bg-background text-foreground rounded-full border-2 border-foreground/20 font-medium">
                      {testimonial.group}
                    </span>
                  </div>
                </div>

                {/* Bottom decorative element */}
                <div className="flex justify-center pt-2">
                  <div className="w-8 h-1 bg-foreground/20 rounded-full"></div>
                </div>
              </div>
            </Card>)}
        </div>
      </div>
    </section>;
};
export default TestimonialSection;