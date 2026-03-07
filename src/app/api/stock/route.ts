import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateAlerts } from "@/lib/alertEvaluator";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!dbUser) return NextResponse.json({ error: "Session invalid" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = search
        ? {
            product: {
                OR: [
                    { name: { contains: search } },
                    { brand: { contains: search } },
                    { barcode: { contains: search } },
                ],
            },
        }
        : {};

    const [items, total] = await Promise.all([
        prisma.stock.findMany({
            where,
            include: { product: true, alerts: { where: { resolved: false } } },
            orderBy: { updatedAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.stock.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, limit });
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!dbUser) return NextResponse.json({ error: "Session invalid" }, { status: 401 });


    const body = await request.json();
    const { barcode, name, brand, category, imageUrl, quantity, unit, location, alertThreshold, notes } = body;

    if (!barcode || !name) {
        return NextResponse.json({ error: "barcode ve name zorunludur" }, { status: 422 });
    }

    if (typeof quantity !== "number" || quantity < 0) {
        return NextResponse.json({ error: "Miktar sıfır veya pozitif olmalıdır" }, { status: 422 });
    }

    // Consolidate: Check if stock already exists for this barcode
    const existingStock = await prisma.stock.findFirst({
        where: { product: { barcode } }
    });

    if (existingStock) {
        return NextResponse.json({ error: "Bu barkoda ait bir stok kaydı zaten mevcut. Lütfen güncelleme yapın." }, { status: 400 });
    }

    // 3. Atomik İşlem (Transaction)
    const stock = await prisma.$transaction(async (tx) => {
        // Upsert product
        const product = await tx.product.upsert({
            where: { barcode },
            update: { name, brand, category, imageUrl },
            create: { barcode, name, brand, category, imageUrl },
        });

        const newStock = await tx.stock.create({
            data: {
                productId: product.id,
                quantity,
                unit: unit || "adet",
                location,
                alertThreshold: alertThreshold ?? 5,
                notes,
            },
            include: { product: true },
        });

        // İşlem Kaydı (Log) Oluştur
        await tx.stockLog.create({
            data: {
                productId: product.id,
                userId: dbUser.id,
                type: "INCREASE",
                amount: quantity,
                prevQty: 0,
                newQty: quantity,
            }
        });

        return newStock;
    });

    // Async alert evaluation (non-blocking)
    evaluateAlerts(stock.id).catch(console.error);

    return NextResponse.json(stock, { status: 201 });
}
