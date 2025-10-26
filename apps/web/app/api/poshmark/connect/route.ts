import { prisma, encryptSecret } from "db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../lib/auth";

const connectSchema = z.object({
  label: z.string().min(2).max(64),
  username: z.string().min(2),
  password: z.string().min(8),
  sessionCookie: z.string().optional()
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = connectSchema.parse(await request.json());
    const payload = {
      username: data.username,
      password: data.password,
      sessionCookie: data.sessionCookie ?? null
    };

    const encrypted = await encryptSecret(JSON.stringify(payload));

    const account = await prisma.poshmarkAccount.create({
      data: {
        userId: session.user.id,
        label: data.label,
        encryptedSecret: encrypted.ciphertext,
        nonce: encrypted.nonce
      }
    });

    return NextResponse.json({ id: account.id }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    if (typeof error === "object" && error && "code" in error && (error as { code?: string }).code === "P2002") {
      return NextResponse.json({ message: "Account label already in use" }, { status: 409 });
    }

    const description = error instanceof Error ? error.message : "Failed to connect account";
    return NextResponse.json({ message: description }, { status: 500 });
  }
}
