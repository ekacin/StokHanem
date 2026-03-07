# StokHanem - Envanter Yönetim Sistemi / Inventory Management System

[TR] **StokHanem**, küçük ve orta ölçekli operasyonlar için geliştirilmiş, hız ve verimlilik odaklı bir stok yönetim çözümüdür. Modern web teknolojileri ile inşa edilen sistem, barkod tarama desteği ve anlık analitik verileriyle envanter takibini dijitalize eder.

[EN] **StokHanem** is a speed and efficiency-oriented inventory management solution developed for small to medium-sized operations. Built with modern web technologies, the system digitalizes inventory tracking with barcode scanning support and real-time analytical data.

Fotoğraflar / Screnshot
<img width="1919" height="1017" alt="Image" src="https://github.com/user-attachments/assets/e9ff5019-c773-4da5-97c0-1d7180c26ee6" />
                                                                                                                                                                   <img width="1919" height="1018" alt="Image" src="https://github.com/user-attachments/assets/7d7beab6-4439-4e94-8a39-33a31c0ee777" />

<img width="1919" height="1016" alt="Image" src="https://github.com/user-attachments/assets/3363276f-1c0e-4d15-8f66-6a835e8e62a2" />
<img width="1919" height="1014" alt="Image" src="https://github.com/user-attachments/assets/874da8c6-121b-4087-bdfd-f79c3be13928" />
<img width="1919" height="1016" alt="Image" src="https://github.com/user-attachments/assets/fe0b380a-593b-4155-9fc3-7df487ae84f8" />
<img width="1915" height="1015" alt="Image" src="https://github.com/user-attachments/assets/8bf8a208-ea2f-48e4-8737-2fe4c83c7246" />
<img width="1919" height="1016" alt="Image" src="https://github.com/user-attachments/assets/381d8072-b676-4557-9f5a-4ae94bd9b455" />
<img width="1919" height="1015" alt="Image" src="https://github.com/user-attachments/assets/5717b81e-a0be-4796-b8d1-82355cc3bbc4" />


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
