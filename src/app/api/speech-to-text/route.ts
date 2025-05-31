import { NextResponse } from 'next/server';
import { speechToText } from '@/utils/openai';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    const text = await speechToText(audioFile);
    return NextResponse.json({ text });
  } catch (error) {
    console.error('Speech-to-text API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process audio' },
      { status: 500 }
    );
  }
} 