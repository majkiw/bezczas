import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCompletions, prepareSystemPrompt } from "@utils/openai";

export async function GET() {
  try {
    const proposedExamples = await prisma.proposedExample.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ proposedExamples });
  } catch (error: any) {
    console.error("Error fetching proposed examples:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposed examples." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { input } = await request.json();

    if (!input) {
      return NextResponse.json({ error: "Input is required." }, { status: 400 });
    }

    const systemPrompt = await prepareSystemPrompt();
    const completions = await generateCompletions(input, systemPrompt, 3);

    // Save the proposed example to the database
    const proposedExample = await prisma.proposedExample.create({
      data: {
        input,
        completions,
      },
    });

    return NextResponse.json({ proposedExample });
  } catch (error: any) {
    console.error("Error generating proposed examples:", error);
    return NextResponse.json(
      { error: "An error occurred while generating proposed examples." },
      { status: 500 }
    );
  }
}
