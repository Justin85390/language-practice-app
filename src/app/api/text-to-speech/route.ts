import { NextResponse } from 'next/server';
import { textToSpeech } from '@/utils/openai';

export async function POST(request: Request) {
  try {
    const { text, level } = await request.json();

    if (!text || !level) {
      return NextResponse.json(
        { error: 'Text and level are required' },
        { status: 400 }
      );
    }

    const audioBuffer = await textToSpeech(text, level);
    
    // Convert ArrayBuffer to Buffer for response
    const buffer = Buffer.from(audioBuffer);
    
    // Return audio file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Text-to-speech API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
} 