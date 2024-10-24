import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCompletions(input: string, systemPrompt: string, n: number = 1): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input },
      ],
      max_tokens: 1000,
      temperature: 0.8,
      n,
    });

    return completion.choices.map(choice => choice.message?.content!!.trim());
  } catch (error: any) {
    console.error("Error generating completions:", error);
    throw new Error("An error occurred while generating completions.");
  }
}

export async function prepareSystemPrompt(): Promise<string> {
  // Fetch the latest system prompt from the database
  const latestPrompt = await prisma.systemPrompt.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!latestPrompt) {
    throw new Error("System prompt not configured.");
  }

  // Fetch all examples from the database
  const examples = await prisma.example.findMany({
    orderBy: { createdAt: "asc" },
  });

  // Append examples to the system prompt
  if (examples.length > 0) {
    latestPrompt.content += "\n\n## Przykłady:\n";
    examples.forEach((ex) => {
      latestPrompt.content += `### Wypowiedź użytkownika:\n${ex.input}\n### Język Bezczasowy:\n${ex.output}\n\n`;
    });
  }

  return latestPrompt.content;
}
