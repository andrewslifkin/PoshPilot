import { hash } from "bcryptjs";
import { prisma } from "db";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
  name: z.string().min(2)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ message: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await hash(data.password, 12);

    await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash
      }
    });

    return NextResponse.json({ message: "Account created" });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const issue = error.issues[0];
      if (issue?.path[0] === "password") {
        return NextResponse.json(
          {
            message: "Passwords must include upper, lower, and numeric characters."
          },
          { status: 400 }
        );
      }
      return NextResponse.json({ message: issue?.message ?? "Invalid payload" }, { status: 400 });
    }

    return NextResponse.json({ message: "Unable to create account" }, { status: 500 });
  }
}
