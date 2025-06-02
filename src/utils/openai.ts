import OpenAI from 'openai';
import { WELCOMING_VISITORS_B1, Module, Course, TargetLanguage } from './courseData';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function speechToText(audioBlob: Blob): Promise<string> {
  // Convert Blob to File with required properties
  const audioFile = new File([audioBlob], 'audio.webm', {
    type: audioBlob.type,
    lastModified: Date.now(),
  });

  const response = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
  });

  return response.text;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function getChatResponse(
  message: string, 
  context: { 
    skill?: string; 
    level: string; 
    moduleId?: string;
    courseId?: string;
    isFullModule?: boolean;
    moduleTitle?: string;
    conversationType: 'skill' | 'open';
    jobTitle?: string;
    customJobTitle?: string;
    taskObjective?: string;
    customTaskObjective?: string;
    audience?: string;
    formality?: string;
    industry?: string;
    customIndustry?: string;
    feedbackStyle?: string;
    timeLimit?: string;
  }
): Promise<string> {
  let systemPrompt = '';

  if (context.conversationType === 'skill') {
    // Get the target language expressions for the selected module/course
    const module = WELCOMING_VISITORS_B1.modules.find((m: Module) => m.id === context.moduleId);
    let selectedCourse: Course | undefined;
    
    let targetLanguage: TargetLanguage[] = [];
    
    if (context.isFullModule && module) {
      // For full module practice, combine target language from all courses
      targetLanguage = module.courses.reduce((acc: TargetLanguage[], course: Course) => {
        if (course.targetLanguage) {
          course.targetLanguage.forEach((category: TargetLanguage) => {
            const existingCategory = acc.find(c => c.category === category.category);
            if (existingCategory) {
              // Add new expressions to existing category
              existingCategory.expressions = [...existingCategory.expressions, ...category.expressions];
            } else {
              // Add new category
              acc.push({...category});
            }
          });
        }
        return acc;
      }, []);
    } else {
      // For single course practice, get target language from the selected course
      selectedCourse = module?.courses.find((c: Course) => c.id === context.courseId);
      targetLanguage = selectedCourse?.targetLanguage || [];
    }

    const targetLanguageInfo = targetLanguage.length > 0 
      ? targetLanguage.map((category: TargetLanguage) => 
          `${category.category}:\n${category.expressions.join('\n')}`
        ).join('\n\n')
      : 'No specific target language expressions available.';

    systemPrompt = `
You are a conversation partner helping a learner practice "${context.skill}" at CEFR level ${context.level}${context.isFullModule 
  ? ` in the full module "${context.moduleTitle}"`
  : ` in the course "${selectedCourse?.title || 'selected course'}"`}.

Here are the target language expressions to practice and incorporate naturally:

${targetLanguageInfo}

Your goal is to create natural conversation opportunities where these expressions can be used. Start with a simple relevant situation and stay with it unless the learner specifically requests a change.

Key behaviors:
- When giving feedback, stay in the current scenario - don't start a new one
- After feedback, continue the conversation naturally from where you left off
- Only introduce a new scenario if the learner requests it or the current one is clearly finished
- When the learner uses (or could have used) target expressions, acknowledge it in your response

${context.isFullModule 
  ? `Since we're practicing the full module, feel free to incorporate expressions from all three courses naturally throughout the conversation.`
  : ''}`;
  } else {
    // Open conversation mode
    const taskObjective = context.taskObjective === 'Other' ? context.customTaskObjective : context.taskObjective;
    const industry = context.industry === 'Other' ? context.customIndustry : context.industry;
    const jobTitle = context.jobTitle === 'Other' ? context.customJobTitle : context.jobTitle;

    systemPrompt = `
You are a conversation partner for ${jobTitle ? `a ${jobTitle}` : 'a professional'} practicing business English at CEFR level ${context.level}.

Context:
- Task/Objective: ${taskObjective}
- Industry/Sector: ${industry}
${context.audience ? `- Target Audience: ${context.audience}` : ''}
${context.formality ? `- Communication Style: ${context.formality}` : ''}

Your goal is to engage in a natural conversation that helps the learner practice English in their professional context. Adapt your responses to their level (${context.level}) while maintaining authenticity and relevance to their field.

${context.feedbackStyle ? `Feedback Style: ${
  context.feedbackStyle === 'frequent' ? 'Provide frequent corrections and suggestions for improvement.'
  : context.feedbackStyle === 'minimal' ? 'Focus on maintaining conversation flow, only correct major errors.'
  : 'Rephrase learner responses to demonstrate more natural or professional ways of expressing the same ideas.'
}` : ''}

${context.timeLimit ? `Time Management: Keep responses concise to allow for a ${context.timeLimit}-minute conversation.` : ''}

Key behaviors:
- Stay focused on the specified task/objective
- Use language appropriate for the industry and audience
- Maintain the specified level of formality
- Provide feedback according to the selected style
- Keep the conversation relevant to the learner's professional context`;
  }

  systemPrompt += `

Be natural, helpful, and adjust your language complexity to the learner's level:
- A1-A2: Keep it simple and clear
- B1-B2: Natural conversation flow
- C1-C2: Complex situations, idiomatic usage

Remember: 
- Stay in the current conversation flow
- Provide examples when asked
- Switch roles if requested
- Keep feedback brief and relevant to what was just said`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message }
  ];

  const completion = await openai.chat.completions.create({
    messages,
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    max_tokens: 150,
  });

  return completion.choices[0].message.content || '';
}

export async function textToSpeech(text: string, level: string): Promise<ArrayBuffer> {
  // Adjust speech model parameters based on CEFR level
  const speed = level.startsWith('A') ? 0.8 : // Slower for beginners
               level.startsWith('B') ? 1.0 : // Normal speed
               1.2; // Faster for advanced

  const mp3 = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'alloy',
    input: text,
    speed,
  });

  return mp3.arrayBuffer();
} 