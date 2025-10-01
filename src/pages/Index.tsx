import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Layout/Header";
import HeroSection from "@/components/Landing/HeroSection";
import ProcessSection from "@/components/Landing/ProcessSection";
import TrustSection from "@/components/Landing/TrustSection";
import TestimonialSection from "@/components/Landing/TestimonialSection";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ProcessSection />
        <TrustSection />
        <TestimonialSection />
      </main>
    </div>
  );
};

export default Index;
