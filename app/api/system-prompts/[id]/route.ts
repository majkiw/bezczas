import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const deletedPrompt = await prisma.systemPrompt.delete({
      where: {
        id: parseInt(id),
      },
    });
    return NextResponse.json({ prompt: deletedPrompt });
  } catch (error: any) {
    console.error('Error deleting system prompt:', error);
    return NextResponse.json(
      { error: 'Failed to delete system prompt.' },
      { status: 500 }
    );
  }
}
