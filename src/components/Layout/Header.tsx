import { Button } from "@/components/ui/button";
import { Users, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const navLinks = [
    { to: "/discovery", label: "Find Friends" },
    { to: "/study-help", label: "Study Help" },
    { to: "/activities", label: "Activities" },
    { to: "/weekend-plans", label: "Weekend Plans" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
              <Users className="h-5 w-5 text-background" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground">VibeCheck</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button 
                  variant="outline" 
                  className={`rounded-full px-4 xl:px-6 py-2 text-sm font-medium border-2 ${
                    location.pathname === link.to
                      ? 'border-primary bg-primary text-primary-foreground' 
                      : 'border-border hover:border-primary'
                  }`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            <Button 
              variant="outline" 
              className="rounded-full px-4 xl:px-6 py-2 text-sm font-medium border-2 border-border hover:border-primary"
            >
              Profile
            </Button>
            <Button 
              variant="outline" 
              className="rounded-full px-4 xl:px-6 py-2 text-sm font-medium border-2 border-border hover:border-primary"
            >
              Sign out
            </Button>
          </nav>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)}>
                    <Button 
                      variant={location.pathname === link.to ? "default" : "ghost"}
                      className="w-full justify-start text-base"
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
                <div className="pt-4 border-t space-y-2">
                  <Button variant="ghost" className="w-full justify-start text-base">
                    Profile
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-base">
                    Sign out
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;