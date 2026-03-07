import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateAlerts } from "@/lib/alertEvaluator";
import { auth } from "@/lib/auth";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const stock = await prisma.stock.findUnique({
        where: { id },
        include: { product: true, alerts: { orderBy: { createdAt: "desc" } } },
    });

    if (!stock) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    return NextResponse.json(stock);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { quantity, unit, location, alertThreshold, notes } = body;

    if (typeof quantity !== "undefined" && quantity < 0) {
        return NextResponse.json({ error: "Miktar negatif olamaz" }, { status: 422 });
    }

    const result = await prisma.$transaction(async (tx) => {
        const currentStock = await tx.stock.findUnique({
            where: { id },
            select: { quantity: true, productId: true }
        });

        if (!currentStock) throw new Error("Stock not found");

        const prevQty = currentStock.quantity;
        const finalQuantity = typeof quantity === "number" ? quantity : prevQty;

        const updatedStock = await tx.stock.update({
            where: { id },
            data: {
                ...(typeof quantity === "number" && { quantity }),
                ...(unit && { unit }),
                ...(location !== undefined && { location }),
                ...(typeof alertThreshold === "number" && { alertThreshold }),
                ...(notes !== undefined && { notes }),
            },
            include: { product: true },
        });

        // Log if quantity changed
        if (typeof quantity === "number" && quantity !== prevQty) {
            // Ensure session user still exists
            const dbUser = await tx.user.findUnique({ where: { id: session.user?.id || "" } });
            if (dbUser) {
                await tx.stockLog.create({
                    data: {
                        productId: currentStock.productId,
                        userId: dbUser.id,
                        type: quantity > prevQty ? "INCREASE" : "DECREASE",
                        amount: Math.abs(quantity - prevQty),
                        prevQty,
                        newQty: quantity,
                    }
                });
            }
        }

        return updatedStock;
    });

    evaluateAlerts(result.id).catch(console.error);

    return NextResponse.json(result);
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.stock.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
