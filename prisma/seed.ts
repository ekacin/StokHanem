import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash("admin123", 12);

    const admin = await prisma.user.upsert({
        where: { email: "admin@stok.app" },
        update: {},
        create: {
            email: "admin@stok.app",
            password: hashedPassword,
            name: "Admin",
            role: "ADMIN",
        },
    });

    console.log("✅ Admin kullanıcı oluşturuldu:", admin.email);

    // Demo ürünler
    const product1 = await prisma.product.upsert({
        where: { barcode: "8690526423138" },
        update: {},
        create: {
            barcode: "8690526423138",
            name: "Çay 500g",
            brand: "Çaykur",
            category: "Gıda",
        },
    });

    const product2 = await prisma.product.upsert({
        where: { barcode: "8001620024849" },
        update: {},
        create: {
            barcode: "8001620024849",
            name: "Espresso Kapsül",
            brand: "Nespresso",
            category: "İçecek",
        },
    });

    await prisma.stock.upsert({
        where: { id: "seed-stock-1" },
        update: {},
        create: {
            id: "seed-stock-1",
            productId: product1.id,
            quantity: 25,
            unit: "paket",
            location: "Raf A1",
            alertThreshold: 5,
        },
    });

    await prisma.stock.upsert({
        where: { id: "seed-stock-2" },
        update: {},
        create: {
            id: "seed-stock-2",
            productId: product2.id,
            quantity: 3,
            unit: "kutu",
            location: "Raf B2",
            alertThreshold: 10,
            notes: "Düşük stok - acil sipariş gerekli",
        },
    });

    console.log("✅ Demo ürünler ve stoklar oluşturuldu");
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
