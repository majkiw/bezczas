import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  
  try {
    const { input, output } = await request.json();

    if (!input || !output) {
      return NextResponse.json(
        { error: 'Both input and output are required.' },
        { status: 400 }
      );
    }

    const updatedExample = await prisma.example.update({
      where: { id: parseInt(id) },
      data: { input, output },
    });

    return NextResponse.json({ example: updatedExample });
  } catch (error: any) {
    console.error('Error updating example:', error);
    return NextResponse.json(
      { error: 'Failed to update example.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const deletedExample = await prisma.example.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ example: deletedExample });
  } catch (error: any) {
    console.error('Error deleting example:', error);
    return NextResponse.json(
      { error: 'Failed to delete example.' },
      { status: 500 }
    );
  }
}
