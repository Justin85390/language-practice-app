import { NextResponse } from 'next/server';
import { getChatResponse } from '@/utils/openai';

export async function POST(request: Request) {
  try {
    const { message, context } = await request.json();

    if (!message || !context || !context.conversationType || !context.level) {
      return NextResponse.json(
        { error: 'Message, conversation type, and level are required' },
        { status: 400 }
      );
    }

    // Validate required fields based on conversation type
    if (context.conversationType === 'skill' && (!context.skill || !context.moduleId || !context.courseId)) {
      return NextResponse.json(
        { error: 'Skill, module, and course are required for Skill Express conversation' },
        { status: 400 }
      );
    } else if (context.conversationType === 'open' && (!context.taskObjective || !context.industry)) {
      return NextResponse.json(
        { error: 'Task/Objective and Industry are required for Open conversation' },
        { status: 400 }
      );
    }

    // Validate custom fields when "Other" is selected
    if (context.taskObjective === 'Other' && !context.customTaskObjective) {
      return NextResponse.json(
        { error: 'Custom Task/Objective is required when "Other" is selected' },
        { status: 400 }
      );
    }
    if (context.industry === 'Other' && !context.customIndustry) {
      return NextResponse.json(
        { error: 'Custom Industry is required when "Other" is selected' },
        { status: 400 }
      );
    }
    if (context.jobTitle === 'Other' && !context.customJobTitle) {
      return NextResponse.json(
        { error: 'Custom Job Title is required when "Other" is selected' },
        { status: 400 }
      );
    }

    const response = await getChatResponse(message, context);
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
} 