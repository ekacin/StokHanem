import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const { rows } = body; // Array of objects from UI parsing

        if (!Array.isArray(rows)) {
            return NextResponse.json({ error: "Geçersiz veri formatı" }, { status: 400 });
        }

        const previewData = await Promise.all(rows.map(async (row: any) => {
            const barcode = String(row.barcode || row.Barkod || "").trim();
            if (!barcode) return { ...row, status: "ERROR", message: "Barkod eksik" };

            const product = await prisma.product.findUnique({
                where: { barcode },
                include: { stocks: true }
            });

            const currentQty = product?.stocks[0]?.quantity ?? 0;
            const newQty = parseInt(row.quantity || row.Miktar || "0");

            return {
                barcode,
                name: row.name || row["Urun Adi"] || product?.name || "Bilinmiyor",
                currentQty,
                newQty,
                status: product ? "UPDATE" : "NEW",
                isValid: !isNaN(newQty) && newQty >= 0
            };
        }));

        return NextResponse.json({ previewData });

    } catch (err: any) {
        console.error("CSV Preview error:", err);
        return NextResponse.json({ error: "Önizleme oluşturulamadı" }, { status: 500 });
    }
}
