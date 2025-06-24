import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vardas, pavarde, vaikoVardas, pamokos, email, slaptazodis, role } = body;

    // Validate required fields here if needed

    const hashedPassword = await hash(slaptazodis, 10);

    const user = await prisma.user.create({
      data: {
        name: `${vardas} ${pavarde}`,
        vaikoVardas,
        pamokos,  // should be string[]
        email,
        password: hashedPassword,
        role: role || "client",
      },
    });

    return NextResponse.json({ message: "User created", user }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Serverio klaida" }, { status: 500 });
  }
}
