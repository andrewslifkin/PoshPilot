import { prisma } from "db";
import { NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.poshmarkAccount.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      label: true,
      status: true,
      lastValidatedAt: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(accounts);
}
