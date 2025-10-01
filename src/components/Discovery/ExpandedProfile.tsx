import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Gamepad2, 
  Palette, 
  Mountain, 
  Laptop, 
  Music,
  Heart,
  Users,
  Lightbulb,
  Trophy,
  Smile,
  Eye,
  Hammer,
  Crown,
  Coffee,
  Zap,
  Target,
  Book,
  MessageCircle,
  Clock,
  MapPin,
  Star
} from "lucide-react";

interface ExpandedProfileProps {
  student: {
    id: string;
    name: string;
    grade: string;
    group: string;
    compatibility: string;
    reason: string;
    interests: string[];
    mutualClasses: string[];
    icon: any;
    email?: string;
    personalityFactors: string[];
    conversationStarters: string[];
    mutualConnections: string[];
    scheduleCompatibility: string;
    meetingSpots: string[];
  };
  onConnect: (studentId: string) => void;
  onRequestMeeting: (studentId: string) => void;
  isConnected: boolean;
  isEmailShared: boolean;
}

const ExpandedProfile = ({ 
  student, 
  onConnect, 
  onRequestMeeting, 
  isConnected, 
  isEmailShared 
}: ExpandedProfileProps) => {
  const Icon = student.icon;

  return (
    <div className="space-y-6 mt-6 p-6 bg-white rounded-xl border-2 border-blue-300">
      {/* Personality Compatibility */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <h4 className="font-semibold text-foreground">Personality Compatibility</h4>
        </div>
        <div className="grid gap-2">
          {student.personalityFactors.map((factor, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <span className="text-sm text-foreground">{factor}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Additional Shared Interests */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-pink-500" />
          <h4 className="font-semibold text-foreground">More Shared Interests</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {[...student.interests, "Study Groups", "Movie Nights", "Coffee Meetups", "Weekend Projects"].map((interest, index) => (
            <Badge key={index} variant="outline" className="bg-pink-50 border-pink-200 text-pink-700">
              {interest}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Mutual Connections */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-blue-500" />
          <h4 className="font-semibold text-foreground">Mutual Connections</h4>
        </div>
        <div className="space-y-2">
          {student.mutualConnections.map((connection, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm text-foreground">{connection}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Classes & Schedule */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-green-500" />
          <h4 className="font-semibold text-foreground">Schedule Compatibility</h4>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-foreground mb-2">{student.scheduleCompatibility}</p>
          <div className="flex flex-wrap gap-2">
            {student.mutualClasses.map((className, index) => (
              <Badge key={index} variant="secondary" className="bg-green-100 text-green-700">
                {className}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* Conversation Starters */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-purple-500" />
          <h4 className="font-semibold text-foreground">Conversation Starters</h4>
        </div>
        <div className="grid gap-2">
          {student.conversationStarters.map((starter, index) => (
            <div key={index} className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-300">
              <p className="text-sm text-foreground italic">"{starter}"</p>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Meeting Spots */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-orange-500" />
          <h4 className="font-semibold text-foreground">Suggested Meeting Spots</h4>
        </div>
        <div className="grid gap-2">
          {student.meetingSpots.map((spot, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-foreground">{spot}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        {!isConnected ? (
          <Button
            onClick={() => onConnect(student.id)}
            className="flex-1 bg-blue-500 hover:bg-blue-600"
          >
            Send Connection Request
          </Button>
        ) : !isEmailShared ? (
          <Button
            onClick={() => onRequestMeeting(student.id)}
            className="flex-1 bg-green-500 hover:bg-green-600"
          >
            Request to Meet
          </Button>
        ) : (
          <div className="flex-1 p-3 bg-green-100 rounded-lg text-center">
            <p className="text-sm font-medium text-green-700">
              📧 Email shared: {student.email}
            </p>
            <p className="text-xs text-green-600 mt-1">
              You can now coordinate meeting times!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpandedProfile;