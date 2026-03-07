import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { evaluateAlerts } from "@/lib/alertEvaluator";

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ensure user still exists in DB
    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!dbUser) return NextResponse.json({ error: "Session invalid. Please login again." }, { status: 401 });

    try {
        const body = await request.json();
        const { data } = body;

        if (!Array.isArray(data)) return NextResponse.json({ error: "Veri hatası" }, { status: 400 });

        const results = { updated: 0, created: 0, errors: 0 };

        for (const item of data) {
            try {
                // Upsert Product
                const product = await prisma.product.upsert({
                    where: { barcode: item.barcode },
                    update: { name: item.name },
                    create: { barcode: item.barcode, name: item.name }
                });

                // Get current stock for logging
                const currentStock = await prisma.stock.findUnique({
                    where: { productId: product.id }
                });
                const prevQty = currentStock?.quantity || 0;

                // Upsert Stock
                const stock = await prisma.stock.upsert({
                    where: { productId: product.id },
                    update: { quantity: item.newQty },
                    create: { productId: product.id, quantity: item.newQty },
                });

                // Log the bulk update if quantity changed
                if (prevQty !== item.newQty) {
                    await prisma.stockLog.create({
                        data: {
                            productId: product.id,
                            userId: session.user.id,
                            type: item.newQty > prevQty ? "INCREASE" : "DECREASE",
                            amount: Math.abs(item.newQty - prevQty),
                            prevQty,
                            newQty: item.newQty
                        }
                    });
                    evaluateAlerts(stock.id).catch(console.error);
                }

                if (currentStock) results.updated++;
                else results.created++;

            } catch (err) {
                console.error("Bulk import item error:", err);
                results.errors++;
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (err: any) {
        return NextResponse.json({ error: "İçe aktarım başarısız" }, { status: 500 });
    }
}
