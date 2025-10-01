import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
              <Users className="h-5 w-5 text-background" />
            </div>
            <span className="text-xl font-bold text-foreground">VibeCheck</span>
          </Link>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-3">
            <Link to="/discovery">
              <Button 
                variant="outline" 
                className={`rounded-full px-6 py-2 text-sm font-medium border-2 ${
                  location.pathname === '/discovery' 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : 'border-border hover:border-primary'
                }`}
              >
                Find Friends
              </Button>
            </Link>
            <Link to="/study-help">
              <Button 
                variant="outline" 
                className={`rounded-full px-6 py-2 text-sm font-medium border-2 ${
                  location.pathname === '/study-help' 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : 'border-border hover:border-primary'
                }`}
              >
                Study Help
              </Button>
            </Link>
            <Link to="/activities">
              <Button 
                variant="outline" 
                className={`rounded-full px-6 py-2 text-sm font-medium border-2 ${
                  location.pathname === '/activities' 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : 'border-border hover:border-primary'
                }`}
              >
                Activities
              </Button>
            </Link>
            <Link to="/weekend-plans">
              <Button 
                variant="outline" 
                className={`rounded-full px-6 py-2 text-sm font-medium border-2 ${
                  location.pathname === '/weekend-plans' 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : 'border-border hover:border-primary'
                }`}
              >
                Weekend Plans
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="rounded-full px-6 py-2 text-sm font-medium border-2 border-border hover:border-primary"
            >
              Profile
            </Button>
            <Button 
              variant="outline" 
              className="rounded-full px-6 py-2 text-sm font-medium border-2 border-border hover:border-primary"
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;