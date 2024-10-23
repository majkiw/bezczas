import { NextResponse } from 'next/server';
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const examples = await prisma.example.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ examples });
  } catch (error: any) {
    console.error('Error fetching examples:', error);
    return NextResponse.json(
      { error: 'Failed to fetch examples.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { input, output } = await request.json();

    if (!input || !output) {
      return NextResponse.json(
        { error: 'Both input and output are required.' },
        { status: 400 }
      );
    }

    const newExample = await prisma.example.create({
      data: { input, output },
    });

    return NextResponse.json({ example: newExample });
  } catch (error: any) {
    console.error('Error creating example:', error);
    return NextResponse.json(
      { error: 'Failed to create example.' },
      { status: 500 }
    );
  }
}
