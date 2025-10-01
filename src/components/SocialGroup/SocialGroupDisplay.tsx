import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Brain, Sparkles } from 'lucide-react';

interface SocialGroupDisplayProps {
  onClose?: () => void;
}

const SocialGroupDisplay = ({ onClose }: SocialGroupDisplayProps) => {
  const [socialGroupData, setSocialGroupData] = useState<any>(null);
  const [groupDetails, setGroupDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadSocialGroupData();
  }, [user]);

  const loadSocialGroupData = async () => {
    if (!user) return;

    try {
      // Get user's social group from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('social_group, social_group_analysis')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.social_group) {
        setSocialGroupData(profile.social_group_analysis);

        // Get group details
        const { data: groupData, error: groupError } = await supabase
          .from('social_groups')
          .select('*')
          .eq('name', profile.social_group)
          .single();

        if (groupError) throw groupError;
        setGroupDetails(groupData);
      }
    } catch (error) {
      console.error('Error loading social group data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Loading your social group...</span>
        </div>
      </Card>
    );
  }

  if (!socialGroupData || !groupDetails) {
    return (
      <Card className="p-6 max-w-2xl mx-auto text-center">
        <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Social Group Analysis Pending</h3>
        <p className="text-muted-foreground">
          Complete all onboarding sections to discover your social group!
        </p>
      </Card>
    );
  }

  const getGroupIcon = (groupName: string) => {
    const icons: Record<string, string> = {
      'Academic Achievers': '📚',
      'Social Connectors': '🤝',
      'Creative Innovators': '🎨',
      'Athletic Competitors': '⚽',
      'Tech Enthusiasts': '💻',
      'Balanced Explorers': '🌟'
    };
    return icons[groupName] || '✨';
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">{getGroupIcon(groupDetails.name)}</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          You're a {groupDetails.name}!
        </h2>
        <p className="text-muted-foreground">{groupDetails.description}</p>
      </div>

      {/* Confidence Score */}
      {socialGroupData?.confidence && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">AI Confidence</span>
            <Badge variant="secondary">
              {Math.round(socialGroupData.confidence * 100)}% match
            </Badge>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${socialGroupData.confidence * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* AI Reasoning */}
      {socialGroupData?.reasoning && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <Brain className="h-4 w-4 mr-2" />
            Why this group fits you
          </h3>
          <p className="text-muted-foreground bg-muted p-4 rounded-lg">
            {socialGroupData.reasoning}
          </p>
        </div>
      )}

      {/* Key Factors */}
      {socialGroupData?.keyFactors && socialGroupData.keyFactors.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <Sparkles className="h-4 w-4 mr-2" />
            Key factors that led to this match
          </h3>
          <div className="flex flex-wrap gap-2">
            {socialGroupData.keyFactors.map((factor: string, index: number) => (
              <Badge key={index} variant="outline">
                {factor}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Group Characteristics */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full mb-4">
            <Users className="h-4 w-4 mr-2" />
            See what makes {groupDetails.name} special
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span className="text-2xl">{getGroupIcon(groupDetails.name)}</span>
              <span>{groupDetails.name} Traits</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {groupDetails.characteristics?.map((trait: string, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">{trait}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {onClose && (
        <Button onClick={onClose} className="w-full">
          Continue to VibeCheck
        </Button>
      )}
    </Card>
  );
};

export default SocialGroupDisplay;