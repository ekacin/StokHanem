import { prisma } from "./prisma";

export async function evaluateAlerts(stockId: string): Promise<void> {
    try {
        const stock = await prisma.stock.findUnique({
            where: { id: stockId },
            include: { product: true },
        });

        if (!stock) return;

        if (stock.quantity < stock.alertThreshold) {
            // Check if active alert already exists
            const existing = await prisma.alert.findFirst({
                where: { stockId, resolved: false, type: "LOW_STOCK" },
            });

            if (!existing) {
                await prisma.alert.create({
                    data: {
                        stockId,
                        type: "LOW_STOCK",
                        message: `${stock.product.name} düşük stok uyarısı: ${stock.quantity} ${stock.unit} kaldı (eşik: ${stock.alertThreshold})`,
                    },
                });
            }
        } else {
            // Resolve any existing low stock alerts
            await prisma.alert.updateMany({
                where: { stockId, resolved: false, type: "LOW_STOCK" },
                data: { resolved: true, resolvedAt: new Date() },
            });
        }
    } catch (err) {
        // Non-blocking: log but do not throw
        console.error("[AlertEvaluator] Error:", err);
    }
}
