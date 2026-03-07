# StokHanem - Envanter Yönetim Sistemi / Inventory Management System

[TR] **StokHanem**, küçük ve orta ölçekli operasyonlar için geliştirilmiş, hız ve verimlilik odaklı bir stok yönetim çözümüdür. Modern web teknolojileri ile inşa edilen sistem, barkod tarama desteği ve anlık analitik verileriyle envanter takibini dijitalize eder.

[EN] **StokHanem** is a speed and efficiency-oriented inventory management solution developed for small to medium-sized operations. Built with modern web technologies, the system digitalizes inventory tracking with barcode scanning support and real-time analytical data.


 🚀 Özellikler / Features

 [TR] Öne Çıkanlar
- Akıllı Barkod Tarayıcı: Web tarayıcı üzerinden kamera erişimi ile anlık barkod ve QR kod okuma.
- Kritik Stok Yönetimi: Belirlenen eşik değerinin altına düşen ürünler için otomatik uyarı sistemi.
- Veri Analitiği: Stok hareketlerinin ve toplam envanter değerinin görselleştirildiği dashboard.
- Esnek Veri Transferi: CSV formatında toplu ürün içe aktarma ve dışa aktarma yetenekleri.
- Güvenli Erişim: Rol tabanlı yetkilendirme (Admin/Kullanıcı) ve session yönetimi.

 [EN] Highlights
- Smart Barcode Scanner: Real-time barcode and QR code scanning via web browser camera access.
- Critical Stock Management: Automatic alert system for products falling below set threshold values.
- Data Analytics: Dashboard visualizing stock movements and total inventory value.
- Flexible Data Transfer: Bulk product import and export capabilities in CSV format.
- Secure Access: Role-based authorization (Admin/User) and session management.


 🛠️ Teknoloji Yığını / Tech Stack

- Framework: Next.js (App Router)
- Language: TypeScript
- Database: SQLite & Prisma ORM
- Auth: NextAuth.js
- Styling: Custom CSS (Modular & Responsive)
- Core Engine: Zbar WASM (Barcode Detection)


 ⚙️ Kurulum / Setup

 [TR] Adımlar
1. Bağımlılıkları yükleyin: `npm install`
2. `.env` dosyasını yapılandırın (DATABASE_URL, NEXTAUTH_SECRET).
3. Veritabanı şemasını oluşturun: `npx prisma db push`
4. Demo verilerini yükleyin: `npm run seed`
5. Geliştirme sunucusunu başlatın: `npm run dev`

 [EN] Steps
1. Install dependencies: `npm install`
2. Configure `.env` file (DATABASE_URL, NEXTAUTH_SECRET).
3. Create database schema: `npx prisma db push`
4. Load demo data: `npm run seed`
5. Start development server: `npm run dev`


 🔐 Erişim / Credentials
- Email: `admin@stok.app`
- Password: `admin123`

 📎 Notlar / Notes
[TR] Bu proje bir hobi projesi olarak geliştirilmiştir ve aktif geliştirme süreci tamamlanmıştır.
[EN] This project was developed as a hobby project and the active development process has been completed.
