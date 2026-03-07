import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_request: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // 1. Fastest Moving (Most Decreased)
        const fastestMoving = await prisma.stockLog.groupBy({
            by: ["productId"],
            where: { type: "DECREASE", createdAt: { gte: thirtyDaysAgo } },
            _sum: { amount: true },
            orderBy: { _sum: { amount: "desc" } },
            take: 5,
        });

        const fastestProducts = await Promise.all(
            fastestMoving.map(async (item) => {
                const product = await prisma.product.findUnique({ where: { id: item.productId } });
                return { ...product, totalAmount: item._sum.amount };
            })
        );

        // 2. Top Stocked (Most Increased)
        const topStocked = await prisma.stockLog.groupBy({
            by: ["productId"],
            where: { type: "INCREASE", createdAt: { gte: thirtyDaysAgo } },
            _sum: { amount: true },
            orderBy: { _sum: { amount: "desc" } },
            take: 5,
        });

        const topProducts = await Promise.all(
            topStocked.map(async (item) => {
                const product = await prisma.product.findUnique({ where: { id: item.productId } });
                return { ...product, totalAmount: item._sum.amount };
            })
        );

        // 3. 30-Day Movement Graph Data
        const logs = await prisma.stockLog.findMany({
            where: { createdAt: { gte: thirtyDaysAgo } },
            select: { type: true, amount: true, createdAt: true },
        });

        const dailyStats: Record<string, { inc: number, dec: number }> = {};
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
            dailyStats[d] = { inc: 0, dec: 0 };
        }

        logs.forEach(log => {
            const date = log.createdAt.toISOString().split("T")[0];
            if (dailyStats[date]) {
                if (log.type === "INCREASE") dailyStats[date].inc += log.amount;
                else dailyStats[date].dec += log.amount;
            }
        });

        const graphData = Object.entries(dailyStats).map(([date, val]) => ({ date, ...val }));

        // 4. Depletion Prediction
        // Simple heuristic: Total decrease in last 30 days / 30 = Daily Avg
        const predictions = await Promise.all(
            (await prisma.stock.findMany({ include: { product: true } })).map(async (stock) => {
                const totalDec = await prisma.stockLog.aggregate({
                    where: { productId: stock.productId, type: "DECREASE", createdAt: { gte: thirtyDaysAgo } },
                    _sum: { amount: true }
                });

                const avgDaily = (totalDec._sum.amount || 0) / 30;
                const daysLeft = avgDaily > 0 ? Math.floor(stock.quantity / avgDaily) : null;

                return {
                    name: stock.product.name,
                    quantity: stock.quantity,
                    daysLeft
                };
            })
        );

        return NextResponse.json({
            fastestProducts,
            topProducts,
            graphData,
            predictions: predictions
                .filter(p => p.daysLeft !== null)
                .sort((a, b) => (a.daysLeft || 0) - (b.daysLeft || 0))
                .slice(0, 5)
        });


    } catch (err: any) {
        console.error("Analytics error:", err);
        return NextResponse.json({ error: "Analizler yüklenirken hata oluştu" }, { status: 500 });
    }
}
