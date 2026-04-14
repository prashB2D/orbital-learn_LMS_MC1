import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;

    const module = await prisma.module.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(module);
  } catch (error) {
    console.error("[MODULE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;
    const values = await req.json();

    const module = await prisma.module.update({
      where: { id },
      data: {
        ...values,
      },
    });

    return NextResponse.json(module);
  } catch (error) {
    console.error("[MODULE_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
