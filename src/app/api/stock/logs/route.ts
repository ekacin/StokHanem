import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_request: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const logs = await prisma.stockLog.findMany({
            take: 50,
            orderBy: { createdAt: "desc" },
            include: {
                product: {
                    select: {
                        name: true,
                        barcode: true,
                        brand: true,
                        imageUrl: true,
                    }
                },
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }

            }
        });

        return NextResponse.json(logs);
    } catch (err: any) {
        console.error("Fetch logs error:", err);
        return NextResponse.json({ error: "Günlükler alınırken bir hata oluştu" }, { status: 500 });
    }
}
