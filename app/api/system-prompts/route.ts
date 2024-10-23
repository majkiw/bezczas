import { NextResponse } from 'next/server';
import { prisma } from "../../../lib/prisma"; // Adjust the path if necessary

export async function GET() {
  try {
    const prompts = await prisma.systemPrompt.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json({ prompts });
  } catch (error: any) {
    console.error('Error fetching system prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system prompts.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required.' }, { status: 400 });
    }

    const newPrompt = await prisma.systemPrompt.create({
      data: {
        content,
      },
    });

    return NextResponse.json({ prompt: newPrompt });
  } catch (error: any) {
    console.error('Error creating system prompt:', error);
    return NextResponse.json(
      { error: 'Failed to create system prompt.' },
      { status: 500 }
    );
  }
}
