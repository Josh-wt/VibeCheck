import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
const backendUrl = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Enhanced fallback keyword-based classifier optimized for friendship quiz responses
function fallbackClassifier(userProfile: any): { socialGroup: string; confidence: number; reasoning: string; keyFactors: string[]; academicStrengths: string[]; academicWeaknesses: string[] } {
  const quizText = (userProfile.personalityAnswers || []).join(' ').toLowerCase();
  const profileText = JSON.stringify({
    academic: userProfile.academic,
    activities: userProfile.activities,
    weekend: userProfile.weekend
  }).toLowerCase();
  const allText = quizText + ' ' + profileText;
  
  // Personality-focused scoring for all groups
  const scores: Record<string, number> = {
    'Academic Achievers': 0,
    'Social Connectors': 0,
    'Creative Innovators': 0,
    'Athletic Competitors': 0,
    'Tech Enthusiasts': 0,
    'Balanced Explorers': 0,
    'Environmental Advocates': 0,
    'Entrepreneurial Minds': 0
  };

  // Enhanced keywords with personality traits from friendship quiz
  const keywords = {
    'Academic Achievers': ['study', 'academic', 'learning', 'grades', 'school', 'books', 'knowledge', 'research', 'homework', 'library', 'quiet', 'focused', 'organized', 'plan', 'goals', 'intellectual', 'deep conversations', 'ideas'],
    'Social Connectors': ['friends', 'social', 'party', 'events', 'networking', 'people', 'outgoing', 'talking', 'meeting', 'group', 'organize', 'community', 'team', 'together', 'helping others', 'energizing', 'gatherings'],
    'Creative Innovators': ['art', 'creative', 'music', 'design', 'imagination', 'artistic', 'innovative', 'original', 'drawing', 'express', 'unique', 'performing', 'theater', 'writing', 'crafts', 'outside the box'],
    'Athletic Competitors': ['sports', 'athletic', 'fitness', 'competition', 'team', 'exercise', 'physical', 'games', 'winning', 'active', 'outdoors', 'energy', 'push limits', 'training', 'workout'],
    'Tech Enthusiasts': ['gaming', 'technology', 'coding', 'computer', 'digital', 'tech', 'programming', 'online', 'video games', 'build', 'problem-solving', 'logic', 'innovation', 'projects', 'app'],
    'Balanced Explorers': ['balanced', 'variety', 'diverse', 'different', 'explore', 'multiple', 'various', 'flexible', 'everything', 'adapt', 'versatile', 'well-rounded', 'many interests', 'trying new'],
    'Environmental Advocates': ['environment', 'nature', 'sustainability', 'climate', 'eco', 'conservation', 'green', 'recycling', 'planet', 'earth', 'outdoors', 'hiking', 'caring', 'making difference'],
    'Entrepreneurial Minds': ['business', 'entrepreneur', 'leadership', 'startup', 'innovation', 'money', 'investing', 'leading', 'strategy', 'ambitious', 'opportunities', 'initiative', 'creating value']
  };

  // Score based on keyword matches with increased weight for personality indicators
  for (const [group, words] of Object.entries(keywords)) {
    let score = 0;
    for (const word of words) {
      if (allText.includes(word)) {
        // Give extra weight if keyword appears in quiz responses (personality data)
        if (quizText.includes(word)) {
          score += 2; // Double weight for quiz responses
        } else {
          score += 1; // Normal weight for profile data
        }
      }
    }
    scores[group] = score;
  }

  // Personality pattern matching for quiz-only scenarios
  if (userProfile.personalityAnswers && userProfile.personalityAnswers.length > 0) {
    const patterns = {
      'Academic Achievers': /quiet|focus|learn|study|knowledge|intellectual|plan/gi,
      'Social Connectors': /social|friends|people|outgoing|group|together|community/gi,
      'Creative Innovators': /creative|art|music|express|imagination|unique|original/gi,
      'Athletic Competitors': /active|sports|physical|competition|team|energy|outdoors/gi,
      'Tech Enthusiasts': /tech|gaming|coding|digital|computer|problem|logic/gi,
      'Balanced Explorers': /variety|diverse|multiple|explore|adapt|versatile|different/gi,
      'Environmental Advocates': /nature|environment|sustainability|planet|conservation|green/gi,
      'Entrepreneurial Minds': /leadership|business|ambitious|strategy|initiative|opportunities/gi
    };

    for (const [group, pattern] of Object.entries(patterns)) {
      const matches = quizText.match(pattern);
      if (matches) {
        scores[group] += matches.length * 3; // High weight for pattern matches
      }
    }
  }

  // Find highest scoring group
  const sortedGroups = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topGroup = sortedGroups[0];
  
  // More lenient confidence calculation - always assign a group
  let confidence = 0.65; // Base confidence
  if (topGroup[1] > 10) confidence = 0.85;
  else if (topGroup[1] > 5) confidence = 0.75;
  else if (topGroup[1] > 0) confidence = 0.70;

  // Analyze academic strengths and weaknesses from profile data
  const academicStrengths: string[] = [];
  const academicWeaknesses: string[] = [];
  
  if (userProfile.academic) {
    if (userProfile.academic.favoriteSubjects) academicStrengths.push(...userProfile.academic.favoriteSubjects);
    if (userProfile.academic.teachingSubjects) academicStrengths.push(...userProfile.academic.teachingSubjects);
    if (userProfile.academic.struggleSubjects) academicWeaknesses.push(...userProfile.academic.struggleSubjects);
    if (userProfile.academic.helpNeeded) academicWeaknesses.push(...userProfile.academic.helpNeeded);
  }

  return {
    socialGroup: topGroup[0],
    confidence,
    reasoning: `Personality analysis identified ${topGroup[1]} strong indicators for ${topGroup[0]} based on your responses`,
    keyFactors: sortedGroups.slice(0, 3).map(([group, score]) => `${group}: ${score} indicators`),
    academicStrengths: [...new Set(academicStrengths)], // Remove duplicates
    academicWeaknesses: [...new Set(academicWeaknesses)]
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

    const supabase = createClient(backendUrl, serviceKey);

    // Fetch user data from backend
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

    // Get user grade and school context from backend
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

    // Fetch social groups from backend
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
              content: `You are an expert at analyzing high school student personalities, matching them to social groups, and identifying their academic strengths and weaknesses.

Available Social Groups:
${socialGroups.map(g => `- ${g.name}: ${g.description}`).join('\n')}

Instructions for Social Group Assignment:
- Focus PRIMARILY on personality indicators from quiz responses - these reveal core traits
- When available, use academic, activity, and weekend data for refinement
- Look for key personality patterns: social vs. solitary, active vs. reflective, creative vs. analytical, structured vs. flexible
- Even with minimal data, identify the dominant personality theme
- Choose the group that best matches their personality profile
- ALWAYS recommend a group - every personality has a best-fit social group

Instructions for Academic Analysis:
- Analyze favorite subjects, teaching subjects, and interests to identify STRENGTHS (subjects they excel at)
- Analyze struggle subjects and help needed to identify WEAKNESSES (subjects they need help with)
- Use common subject names: Math, Science, English, History, Art, Music, Physical Education, Computer Science, etc.
- If academic data is limited, infer from personality: Tech Enthusiasts → Computer Science strength, Academic Achievers → multiple academic strengths
- ALWAYS provide at least 1-2 subjects for both strengths and weaknesses based on available data and personality type`
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
              name: "assign_student_profile",
              description: "Assign social group and academic strengths/weaknesses to the student",
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
                  },
                  academicStrengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "Subjects the student is strong at (e.g., 'Math', 'Science', 'English', 'History')"
                  },
                  academicWeaknesses: {
                    type: "array",
                    items: { type: "string" },
                    description: "Subjects the student needs help with (e.g., 'Math', 'Science', 'English', 'History')"
                  }
                },
                required: ["socialGroup", "confidence", "reasoning", "keyFactors", "academicStrengths", "academicWeaknesses"],
                additionalProperties: false
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "assign_student_profile" } }
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

    // Update profile in backend with social group and academic tags
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        social_group: analysis.socialGroup,
        social_group_analysis: analysis,
        social_group_updated_at: new Date().toISOString(),
        academic_strengths: analysis.academicStrengths || [],
        academic_weaknesses: analysis.academicWeaknesses || [],
        ai_analysis_completed: true
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
