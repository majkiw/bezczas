import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma'; // Adjust the path if necessary
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { input } = await request.json();

    if (!input) {
      return NextResponse.json({ error: 'Input is required.' }, { status: 400 });
    }

    // Fetch the latest system prompt from the database
    const latestPrompt = await prisma.systemPrompt.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Fetch all examples from the database
    const examples = await prisma.example.findMany({
      orderBy: { createdAt: 'asc' },
    });

    // Append examples to the system prompt
    if (examples.length > 0) {
      latestPrompt.content += '\n\n## Przykłady:\n';
      examples.forEach((ex) => {
        latestPrompt.content += `### Wejście:\n${ex.input}\n### Język Bezczasowy:\n${ex.output}\n`;
      });
    }

    const systemPrompt = latestPrompt.content;

    const prompt = `${input}`;

    console.log("systemPrompt", systemPrompt);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Use the latest model
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.8,
    });

    const processedText = completion.choices[0].message?.content!!.trim();

    return NextResponse.json({ processedText });
  } catch (error: any) {
    console.error('Error processing input:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request.' },
      { status: 500 }
    );
  }
}