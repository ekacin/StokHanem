import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest) {
    const session = await auth();
    if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!dbUser) return NextResponse.json({ error: "Session invalid" }, { status: 401 });


    const alerts = await prisma.alert.findMany({
        where: { resolved: false },
        include: {
            stock: { include: { product: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(alerts);
}

export async function PATCH(request: NextRequest) {
    const session = await auth();
    if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!dbUser) return NextResponse.json({ error: "Session invalid" }, { status: 401 });


    const body = await request.json();
    const { id } = body;

    if (!id) return NextResponse.json({ error: "id zorunludur" }, { status: 422 });

    const alert = await prisma.alert.update({
        where: { id },
        data: { resolved: true, resolvedAt: new Date() },
    });

    return NextResponse.json(alert);
}
