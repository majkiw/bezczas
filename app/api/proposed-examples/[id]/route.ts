import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    await prisma.proposedExample.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({ message: "Proposed example deleted successfully." });
  } catch (error: any) {
    console.error("Error deleting proposed example:", error);
    return NextResponse.json(
      { error: "Failed to delete proposed example." },
      { status: 500 }
    );
  }
}
