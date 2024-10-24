import { NextResponse } from "next/server";
import { generateCompletions, prepareSystemPrompt } from "@utils/openai";

export async function POST(request: Request) {
  try {
    const { input } = await request.json();

    if (!input) {
      return NextResponse.json({ error: "Input is required." }, { status: 400 });
    }

    const systemPrompt = await prepareSystemPrompt();
    const completions = await generateCompletions(input, systemPrompt, 1);

    const processedText = completions[0];

    console.log(input, processedText);

    return NextResponse.json({ processedText });
  } catch (error: any) {
    console.error("Error processing input:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
