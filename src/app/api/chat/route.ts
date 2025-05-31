import { NextResponse } from 'next/server';
import { getChatResponse } from '@/utils/openai';

export async function POST(request: Request) {
  try {
    const { message, context } = await request.json();

    if (!message || !context) {
      return NextResponse.json(
        { error: 'Message and context are required' },
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