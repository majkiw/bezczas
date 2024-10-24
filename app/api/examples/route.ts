import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

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
      return NextResponse.json({ error: "Input and output are required." }, { status: 400 });
    }

    // Save the example to the database
    const example = await prisma.example.create({
      data: {
        input,
        output,
      },
    });

    return NextResponse.json({ example });
  } catch (error: any) {
    console.error("Error saving example:", error);
    return NextResponse.json(
      { error: "An error occurred while saving the example." },
      { status: 500 }
    );
  }
}
