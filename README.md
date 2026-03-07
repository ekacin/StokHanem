# StokHanem - Envanter Yönetim Sistemi / Inventory Management System

# VİDEO
https://youtu.be/rpmi9HAsOiU

# Türkçe

StokHanem, pahalı ve sabit barkod okuyucu sistemlerine alternatif olarak geliştirilmiş açık kaynaklı bir stok yönetim uygulamasıdır. Kamerası olan herhangi bir cihaz (PC, telefon, tablet) ile çalışabilir ve stok takibini hızlı bir şekilde yapmanı sağlar.

**Özellikler**

-Barkod okutarak ürün ekleme
-Open Food Facts API ile ürün bilgilerini otomatik çekme
-Eğer API çalışmaz veya ürün API üzerinden bulunmazsa manuel giriş yapabilme
-Excel veya CSV formatında stok verilerini içe ve dışa aktarım
-Tüm stok hareketleri için detaylı log sistemi (kim, ne zaman, ne kadar değiştirdi)
-Düşük stok uyarıları ile kritik ürünleri takip etme
-Basit ve anlaşılır analiz ekranı
-Kullanıcı giriş sistemi ile güvenli oturum yönetimi
-Web tabanlı, responsive tasarım sayesinde PC, tablet ve telefonlarda çalışabilme
-Kolayca .exe veya .apk formatına dönüştürülebilir yapı

**Kullanılan Teknoloji**

-Framework: Next.js (App Router)
-Dil: TypeScript
-Veritabanı: SQLite & Prisma ORM
-Kimlik Doğrulama: NextAuth.js
-Stil: Özel CSS (Modüler & Responsive)
-Barkod Motoru: Zbar WASM

**Kurulum**

```bash
# Bağımlılıkları yükleyin
npm install

# .env dosyasını yapılandırın (DATABASE_URL, NEXTAUTH_SECRET)

# Veritabanı şemasını oluşturun
npx prisma db push

# Demo verilerini yükleyin
npm run seed

# Geliştirme sunucusunu başlatın
npm run dev
```

**Demo Hesap Bilgileri**

Email: demo@stok.app
Şifre: demo123

**Notlar**
Bu proje bir hobi projesi olarak geliştirilmiştir ve aktif geliştirme süreci bırakılmıştır. Ama proje tamamen çalışır durumdadır ve fikir paylaşımı amacıyla kullanılabilir. İsteyen alabilir, değiştirebilir veya kendi versiyonunu oluşturabilir.

# English

StokHanem is an open-source inventory management application developed as an alternative to expensive and fixed barcode scanner systems. It works with any device that has a camera (PC, phone, tablet) and allows you to manage your inventory quickly and easily.  

**Features**

- Add products by scanning barcodes  
- Automatically fetch product information using the Open Food Facts API  
- Manual entry if the API doesn’t work or the product isn’t found  
- Import and export inventory data in Excel or CSV format  
- Detailed log system for all inventory movements (who, when, how much)  
- Low stock alerts to track critical items  
- Simple and clear analysis dashboard  
- Secure login system for user authentication  
- Web-based, responsive design works on PC, tablet, and phone  
- Easily convertible to .exe or .apk formats  

**Technologies Used**

- Framework: Next.js (App Router)  
- Language: TypeScript  
- Database: SQLite & Prisma ORM  
- Authentication: NextAuth.js  
- Styling: Custom CSS (Modular & Responsive)  
- Barcode Engine: Zbar WASM  

**Setup**

```bash
# Install dependencies
npm install

# Configure the .env file (DATABASE_URL, NEXTAUTH_SECRET)

# Push database schema
npx prisma db push

# Load demo data (adds sample products and test data)
npm run seed

# Start development server
npm run dev
```

**Demo Account**

Email: demo@stok.app
Password: demo123

**Notes**

This project was developed as a hobby and is no longer actively maintained. It is fully functional and can be used to share ideas. Anyone can take it, modify it, or create their own version.
