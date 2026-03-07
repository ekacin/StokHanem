import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const OPEN_FOOD_FACTS_URL = "https://world.openfoodfacts.org/api/v0/product";

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!dbUser) return NextResponse.json({ error: "Session invalid" }, { status: 401 });

    const barcode = new URL(request.url).searchParams.get("barcode");
    if (!barcode) return NextResponse.json({ error: "barcode parametre zorunludur" }, { status: 422 });

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(`${OPEN_FOOD_FACTS_URL}/${barcode}.json`, {
            signal: controller.signal,
            headers: { "User-Agent": "StokApp/1.0" },
        });
        clearTimeout(timeout);

        if (!res.ok) return NextResponse.json({ found: false });

        const data = await res.json();
        if (data.status !== 1 || !data.product) return NextResponse.json({ found: false });

        const p = data.product;
        return NextResponse.json({
            found: true,
            product: {
                barcode,
                name: p.product_name || p.product_name_tr || "Bilinmeyen Ürün",
                brand: p.brands || null,
                category: p.categories_tags?.[0]?.replace("en:", "") || null,
                imageUrl: p.image_url || p.image_front_url || null,
            },
        });
    } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
            return NextResponse.json({ found: false, reason: "timeout" });
        }
        return NextResponse.json({ found: false });
    }
}
