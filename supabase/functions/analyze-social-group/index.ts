import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Enhanced fallback keyword-based classifier
function fallbackClassifier(userProfile: any): { socialGroup: string; confidence: number; reasoning: string; keyFactors: string[] } {
  const quizText = (userProfile.personalityAnswers || []).join(' ').toLowerCase();
  const profileText = JSON.stringify({
    academic: userProfile.academic,
    activities: userProfile.activities,
    weekend: userProfile.weekend
  }).toLowerCase();
  const allText = quizText + ' ' + profileText;
  
  // Expanded score tracking for all 14 groups
  const scores: Record<string, number> = {
    'Academic Achievers': 0,
    'Social Connectors': 0,
    'Creative Innovators': 0,
    'Athletic Competitors': 0,
    'Tech Enthusiasts': 0,
    'Balanced Explorers': 0,
    'Environmental Advocates': 0,
    'Entrepreneurial Minds': 0,
    'Cultural Explorers': 0,
    'Health & Wellness': 0,
    'Community Volunteers': 0,
    'STEM Innovators': 0,
    'Media & Communication': 0,
    'Outdoor Adventurers': 0
  };

  // Keyword matching
  const keywords = {
    'Academic Achievers': ['study', 'academic', 'learning', 'grades', 'school', 'books', 'knowledge', 'research', 'homework'],
    'Social Connectors': ['friends', 'social', 'party', 'events', 'networking', 'people', 'outgoing', 'talking', 'meeting'],
    'Creative Innovators': ['art', 'creative', 'music', 'design', 'imagination', 'artistic', 'innovative', 'original', 'drawing'],
    'Athletic Competitors': ['sports', 'athletic', 'fitness', 'competition', 'team', 'exercise', 'physical', 'games', 'winning'],
    'Tech Enthusiasts': ['gaming', 'technology', 'coding', 'computer', 'digital', 'tech', 'programming', 'online', 'video games'],
    'Balanced Explorers': ['balanced', 'variety', 'diverse', 'different', 'explore', 'multiple', 'various', 'flexible', 'everything'],
    'Environmental Advocates': ['environment', 'nature', 'sustainability', 'climate', 'eco', 'conservation', 'green', 'recycling'],
    'Entrepreneurial Minds': ['business', 'entrepreneur', 'leadership', 'startup', 'innovation', 'money', 'investing', 'leading'],
    'Cultural Explorers': ['culture', 'language', 'travel', 'international', 'diversity', 'world', 'foreign', 'global'],
    'Health & Wellness': ['health', 'wellness', 'fitness', 'nutrition', 'mindfulness', 'yoga', 'meditation', 'wellbeing'],
    'Community Volunteers': ['volunteer', 'charity', 'helping', 'community', 'service', 'giving', 'support', 'kindness'],
    'STEM Innovators': ['science', 'math', 'engineering', 'stem', 'robotics', 'physics', 'chemistry', 'experiments'],
    'Media & Communication': ['media', 'journalism', 'writing', 'broadcasting', 'podcast', 'communication', 'news', 'storytelling'],
    'Outdoor Adventurers': ['hiking', 'camping', 'outdoor', 'adventure', 'nature', 'trail', 'exploring', 'wilderness']
  };

  for (const [group, words] of Object.entries(keywords)) {
    scores[group] = words.filter(word => allText.includes(word)).length;
  }

  // Find highest scoring group
  const sortedGroups = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topGroup = sortedGroups[0];
  const confidence = Math.min(0.85, 0.55 + (topGroup[1] * 0.05));

  return {
    socialGroup: topGroup[0],
    confidence,
    reasoning: `Keyword analysis identified ${topGroup[1]} relevant indicators for ${topGroup[0]} group`,
    keyFactors: sortedGroups.slice(0, 3).map(([group, score]) => `${group}: ${score} matches`)
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    if (!userId) throw new Error('User ID is required');

    console.log('🎯 [ANALYZE] Starting for user:', userId);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch user data
    const [profileResult, academicResult, activityResult, weekendResult] = await Promise.all([
      supabase.from('profiles').select('quiz_responses').eq('user_id', userId).maybeSingle(),
      supabase.from('academic_profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('activity_profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('weekend_interests').select('*').eq('user_id', userId).maybeSingle()
    ]);

    console.log('📊 [DATA]', {
      hasProfile: !!profileResult.data,
      quizCount: profileResult.data?.quiz_responses?.length || 0,
      hasAcademic: !!academicResult.data,
      hasActivity: !!activityResult.data,
      hasWeekend: !!weekendResult.data
    });

    if (profileResult.error && profileResult.error.code !== 'PGRST116') throw profileResult.error;

    const quizResponses = profileResult.data?.quiz_responses || [];
    if (quizResponses.length === 0 && !academicResult.data && !activityResult.data && !weekendResult.data) {
      throw new Error('Insufficient data to determine social group');
    }

    // Get user grade and school for context
    const { data: profileData } = await supabase
      .from('profiles')
      .select('grade, school_name')
      .eq('user_id', userId)
      .single();

    const userProfile = {
      personalityAnswers: quizResponses,
      grade: profileData?.grade,
      schoolName: profileData?.school_name,
      academic: academicResult.data ? {
        favoriteSubjects: academicResult.data.favorite_subjects,
        struggleSubjects: academicResult.data.struggle_subjects,
        helpNeeded: academicResult.data.help_needed_subjects,
        teachingSubjects: academicResult.data.teaching_subjects
      } : null,
      activities: activityResult.data ? {
        interestedActivities: activityResult.data.interested_activities,
        currentActivities: activityResult.data.current_activities,
        activityGoals: activityResult.data.activity_goals,
        timeCommitment: activityResult.data.time_commitment,
        leadershipInterest: activityResult.data.leadership_interest
      } : null,
      weekend: weekendResult.data ? {
        favoriteActivities: weekendResult.data.favorite_activities,
        energyLevel: weekendResult.data.energy_level,
        preferredGroupSize: weekendResult.data.preferred_group_size,
        budgetRange: weekendResult.data.budget_range,
        preferredTimings: weekendResult.data.preferred_timings,
        parentPermissionLevel: weekendResult.data.parent_permission_level
      } : null
    };

    // Fetch social groups
    const { data: socialGroups, error: groupsError } = await supabase.from('social_groups').select('*');
    if (groupsError) throw groupsError;
    if (!socialGroups || socialGroups.length === 0) throw new Error('No social groups available');

    console.log('🎭 [GROUPS] Available:', socialGroups.map(g => g.name).join(', '));

    let analysis: any;
    let usedFallback = false;

    // Try Lovable AI first
    try {
      console.log('🤖 [AI] Calling Lovable AI Gateway with tool calling...');
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: `You are an expert at analyzing high school student personalities and matching them to social groups.

Available Social Groups:
${socialGroups.map(g => `- ${g.name}: ${g.description}`).join('\n')}

Instructions:
- Analyze ALL available data: quiz responses, academic profile, activity interests, and weekend preferences
- Look for patterns and consistency across different data points
- Consider both explicit statements and implicit indicators
- Choose the group that best represents their PRIMARY interests and personality
- Provide confidence score (0-1) based on data clarity and consistency
- Only recommend a group if confidence is above 0.6`
            },
            {
              role: 'user',
              content: `Analyze this student profile and determine their best-fit social group:

Quiz Responses: ${JSON.stringify(userProfile.personalityAnswers || [])}
Grade: ${userProfile.grade || 'Unknown'}
School: ${userProfile.schoolName || 'Unknown'}
Academic Profile: ${JSON.stringify(userProfile.academic || {})}
Activity Interests: ${JSON.stringify(userProfile.activities || {})}
Weekend Preferences: ${JSON.stringify(userProfile.weekend || {})}

Provide the best-fit social group with detailed reasoning based on the data above.`
            }
          ],
          tools: [{
            type: "function",
            function: {
              name: "choose_social_group",
              description: "Select the best-fit social group for this student",
              parameters: {
                type: "object",
                properties: {
                  socialGroup: {
                    type: "string",
                    enum: socialGroups.map(g => g.name),
                    description: "The exact name of the social group"
                  },
                  confidence: {
                    type: "number",
                    description: "Confidence score between 0 and 1"
                  },
                  reasoning: {
                    type: "string",
                    description: "Brief explanation of why this group fits"
                  },
                  keyFactors: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key factors that influenced the decision"
                  }
                },
                required: ["socialGroup", "confidence", "reasoning", "keyFactors"],
                additionalProperties: false
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "choose_social_group" } }
        }),
      });

      if (response.status === 429) {
        console.warn('⚠️ [AI] Rate limit hit, using fallback');
        analysis = fallbackClassifier(userProfile);
        usedFallback = true;
      } else if (response.status === 402) {
        console.warn('⚠️ [AI] Credits exhausted, using fallback');
        analysis = fallbackClassifier(userProfile);
        usedFallback = true;
      } else if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [AI] Error:', response.status, errorText);
        throw new Error(`AI Gateway error: ${response.status}`);
      } else {
        const data = await response.json();
        const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
        
        if (toolCall?.function?.arguments) {
          analysis = JSON.parse(toolCall.function.arguments);
          console.log('✅ [AI] Tool call result:', analysis.socialGroup, `(${analysis.confidence})`);
        } else {
          console.warn('⚠️ [AI] No tool call in response, using fallback');
          analysis = fallbackClassifier(userProfile);
          usedFallback = true;
        }
      }
    } catch (aiError) {
      console.error('❌ [AI] Failed:', aiError);
      console.log('🔄 [FALLBACK] Using keyword classifier');
      analysis = fallbackClassifier(userProfile);
      usedFallback = true;
    }

    // Validate group exists
    const selectedGroup = socialGroups.find(g => g.name === analysis.socialGroup);
    if (!selectedGroup) {
      console.error('❌ [VALIDATION] Invalid group selected:', analysis.socialGroup);
      analysis = fallbackClassifier(userProfile);
      usedFallback = true;
    }

    console.log('🎯 [RESULT]', {
      group: analysis.socialGroup,
      confidence: analysis.confidence,
      usedFallback
    });

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        social_group: analysis.socialGroup,
        social_group_analysis: analysis,
        social_group_updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ [UPDATE] Failed:', updateError);
      throw updateError;
    }

    console.log('✅ [SUCCESS] Profile updated');

    return new Response(JSON.stringify({
      success: true,
      socialGroup: analysis.socialGroup,
      analysis: analysis,
      usedFallback
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ [ERROR]', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
