import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateAlerts } from "@/lib/alertEvaluator";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ensure user still exists in DB (avoids crash if DB was reset)
    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!dbUser) return NextResponse.json({ error: "Session invalid. Please login again." }, { status: 401 });

    const body = await request.json();
    const { barcode, amount, name, brand, category, imageUrl } = body;

    // 1. Girdi Doğrulaması
    const barcodeStr = barcode ? String(barcode).trim() : "";
    if (!barcodeStr || typeof amount !== "number" || !Number.isInteger(amount)) {
        return NextResponse.json({ error: "Barkod ve geçerli bir tam sayı (miktar) zorunludur." }, { status: 422 });
    }

    if (amount === 0) {
        return NextResponse.json({ error: "Değişim miktarı 0 olamaz." }, { status: 400 });
    }

    try {
        // 2. Ürün Kayıt Kontrolü
        const existingProduct = await prisma.product.findUnique({
            where: { barcode: barcodeStr }
        });

        if (!existingProduct) {
            return NextResponse.json({
                error: "DİKKAT: Ürün sistemde kayıtlı değil. Lütfen önce ürünü kaydedin.",
                barcode: barcodeStr,
                instruction: "Stok arttırmadan önce ürünü 'Yeni Ürün' kısmından eklemelisiniz."
            }, { status: 404 });
        }

        // 3. Atomik İşlem (Transaction)
        const result = await prisma.$transaction(async (tx) => {
            // A. Ürün Bilgilerini Güncelle (Sadece veri gönderilmişse)
            const metadata: any = {};
            if (name) metadata.name = name;
            if (brand) metadata.brand = brand;
            if (category) metadata.category = category;
            if (imageUrl) metadata.imageUrl = imageUrl;

            let targetProductId = existingProduct.id;

            if (Object.keys(metadata).length > 0) {
                const updated = await tx.product.update({
                    where: { id: existingProduct.id },
                    data: metadata
                });
                targetProductId = updated.id;
            }

            // B. Mevcut stok seviyesini al
            const currentStock = await tx.stock.findUnique({
                where: { productId: targetProductId }
            });

            const prevQty = currentStock?.quantity || 0;
            const newQty = prevQty + amount;

            // C. Güvenlik Doğrulaması
            if (newQty < 0) {
                throw new Error(`Yetersiz stok. Mevcut: ${prevQty}, Düşülmek istenen: ${Math.abs(amount)}`);
            }

            // D. Stok Kaydını Güncelle/Oluştur
            const stock = await tx.stock.upsert({
                where: { productId: targetProductId },
                update: { quantity: { increment: amount } },
                create: { productId: targetProductId, quantity: amount },
                include: { product: true }
            });

            // E. İşlem Kaydı (Log) Oluştur
            await tx.stockLog.create({
                data: {
                    product: { connect: { id: targetProductId } },
                    user: { connect: { id: dbUser.id } },
                    type: amount >= 0 ? "INCREASE" : "DECREASE",
                    amount: Math.abs(amount),
                    prevQty,
                    newQty: stock.quantity,
                }
            });

            return { stock, prevQty };
        });

        // 4. İşlem Sonrası Görevler (Arka Planda Alert Kontrolü)
        evaluateAlerts(result.stock.id).catch(err => {
            console.error("Alert kontrolü hatası:", err);
        });

        return NextResponse.json({
            success: true,
            quantity: result.stock.quantity,
            prevQty: result.prevQty,
            product: result.stock.product
        });

    } catch (err: any) {
        console.error("Stok işlem hatası:", err);
        const errorMessage = err?.message || "Bilinmeyen bir hata oluştu";
        const isStockError = errorMessage.includes("Yetersiz stok");
        return NextResponse.json({
            error: isStockError ? errorMessage : "İşlem sırasında sunucu hatası oluştu: " + errorMessage
        }, { status: isStockError ? 400 : 500 });
    }
}
