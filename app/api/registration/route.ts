import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vardas, pavarde, vaikoVardas, pamokos, email, slaptazodis, role } = body;

    // Validate required fields
    if (!email || !slaptazodis || !vardas || !pavarde || !pamokos || !Array.isArray(pamokos) || pamokos.length === 0 || !role) {
      return NextResponse.json({ message: "Užpildykite visus privalomus laukus." }, { status: 400 });
    }

    // vaikoVardas required if role is NOT tutor
    if (role !== "tutor" && (!vaikoVardas || typeof vaikoVardas !== "string" || vaikoVardas.trim() === "")) {
      return NextResponse.json({ message: "Vaiko vardas yra privalomas klientui." }, { status: 400 });
    }

    // Check if user with email already exists (avoid duplicates)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Vartotojas su tokiu el. paštu jau egzistuoja." }, { status: 400 });
    }

    const hashedPassword = await hash(slaptazodis, 10);

    const user = await prisma.user.create({
      data: {
        name: `${vardas} ${pavarde}`,
        vaikoVardas: role !== "tutor" ? vaikoVardas : undefined,
        pamokos,
        email,
        password: hashedPassword,
        role,
      },
    });

    return NextResponse.json({ message: "Registracija sėkminga", userId: user.id });
  } catch (err: any) {
    console.error("Registration error:", err);

    // Return more specific error if Prisma validation error
    if (err?.code === 'P2002') {
      return NextResponse.json({ message: "El. paštas jau užimtas." }, { status: 400 });
    }

    return NextResponse.json({ message: "Serverio klaida", error: err.message }, { status: 500 });
  }
}
