import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_request: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const stocks = await prisma.stock.findMany({
            include: { product: true }
        });

        const headers = "Barkod,Urun Adi,Marka,Kategori,Miktar,Birim,Lokasyon,Uyari Esigi\n";
        const rows = stocks.map(s => {
            const p = s.product;
            return [
                p.barcode,
                p.name.replace(/,/g, " "),
                (p.brand || "").replace(/,/g, " "),
                (p.category || "").replace(/,/g, " "),
                s.quantity,
                s.unit,
                (s.location || "").replace(/,/g, " "),
                s.alertThreshold
            ].join(",");
        }).join("\n");

        const csv = headers + rows;

        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="stok_listesi_${new Date().toISOString().split("T")[0]}.csv"`
            }
        });

    } catch (err: any) {
        console.error("CSV Export error:", err);
        return NextResponse.json({ error: "Dışa aktarma hatası" }, { status: 500 });
    }
}
