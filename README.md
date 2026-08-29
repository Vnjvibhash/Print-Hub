# SUVIR Printing — Web-to-Print E-Commerce & Online Studio

A full-stack, enterprise-grade online printing, book binding, and custom merchandise platform engineered with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **Firebase**.

Inspired by industry leaders like [Printster.in](https://printster.in/), SUVIR Printing offers real-time pricing calculation, automated spine thickness estimators, document upload pipelines with automatic post-delivery file deletion for user privacy, and an admin management control center.

---

## 🚀 Key Features

### 🧮 1. Advanced Online Price Calculator (`/pricecalculator`)
- **Document Presets**: Quick switchers for *Document Printing*, *Book & Novel (Perfect Bound)*, *Thesis & Dissertation (Hardbound)*, *Brochure & Booklet (Stapled)*, and *Certificates (300 GSM)*.
- **Paper Sizing**: A4 Standard (210×297 mm), A3 Large (297×420 mm), A5 Book Form (148×210 mm), and B5 Executive (176×250 mm).
- **Ink & Color Modes**: B&W Laser, Partial Color (Text + Headings), and Vibrant Full Color CMYK.
- **9 Paper GSM Weights (70 to 350 GSM)**: Standard Copier (70 GSM), Premium B2B (75 GSM), Executive Bond (85 GSM), Super Smooth (100 GSM), Gloss Art (130 GSM), Matte Art (170 GSM), Cardstock (250 GSM), Velvet Card (300 GSM), and Royal Velvet Board (350 GSM).
- **9 Binding Finishes**:
  - Loose Sheets / No Binding
  - Corner Staple & Double Edge Stapling
  - Center Staple Saddle-Stitch Booklet
  - 360° Plastic Coil Spiral Binding (with Clear PVC front + dark back cover)
  - Twin-Loop Metal Wiro Binding (with Frosted crystal cover)
  - Softcover Perfect Book Binding (Glued Spine with 300 GSM Wrap Cover)
  - Academic Thesis Hardcover (Rigid Leatherette with Custom Gold Foil Letter Embossing)
  - All-Page 125-Micron Thermal Lamination
- **Dynamic Spine Thickness Estimator**: Real-time spine thickness (mm) calculation algorithm factoring sheet leaf count, paper GSM caliper thickness, and cover allowance with visual width indicators.
- **Instant Document Dropzone**: Drag-and-drop support for PDF, DOCX, PPTX, JPG, and PNG with auto page count detection.
- **Volume Bulk Discounts**: Automatic tiered discounting up to 35% on high-volume print runs.

### 🎨 2. Custom Merchandise Designer Studio (`/customizer`)
- Live 3D/2D preview customizer for custom apparel and photo gifts.
- Supported merchandise:
  - Combed Cotton T-Shirts & Heavyweight Fleece Hoodies
  - Archival Ceramic Coffee Mugs & Heat-Reactive Magic Mugs
  - Cushions & Pillows, Mobile Phone Cases, Acrylic Keychains, and Canvas Frames.
- Logo uploader, custom typography overlays, text color selectors, and direct checkout linking.

### 📦 3. Live Order Tracking & Status Pipeline (`/track`)
- Step-by-step progress pipeline: *Order Placed &rarr; Payment Received &rarr; Preflight & Designing &rarr; Digital Press Printing &rarr; Binding & Finishing &rarr; Quality Inspection &rarr; Shipped / Delivered*.
- Real-time status lookup using Order ID and Customer Email.

### 🔒 4. Privacy-First Cloud Storage (Auto-Purge on Delivery)
- When orders transition to `Delivered`, attached customer files (PDFs, DOCXs, artwork) are automatically deleted from cloud storage.
- Eliminates sensitive document retention and optimizes cloud storage footprint.

### 🛠️ 5. Administrative Control Suite (`/admin`)
- **Order Dispatch Management**: Search, filter, inspect specs, and update order status with one-click invoice generation.
- **Dynamic Pricing Engine**: Custom tier configuration, per-page rates, and tax parameters stored in Firestore.
- **Promotional Coupon Manager**: Create flat rate or percentage discount coupon codes with minimum order constraints and validity dates.
- **Carousel & Reviews Moderator**: Manage homepage hero slides and customer feedback testimonials.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.2.7 (App Router & Turbopack) |
| **UI Library** | React 19.2.4 |
| **Styling** | Tailwind CSS v4 with Custom Glassmorphism Tokens |
| **Icons** | Lucide React |
| **Database & Storage** | Google Firebase (Firestore, Firebase Auth, Firebase Storage) |
| **Animation** | Framer Motion |
| **PDF Generation** | jsPDF |
| **Validation** | Zod & React Hook Form |

---

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── admin/             # Admin management dashboard & sub-pages
│   │   ├── checkout/          # Multi-gateway payment checkout (Stripe, Razorpay, UPI QR)
│   │   ├── customizer/        # 3D interactive merchandise designer studio
│   │   ├── dashboard/         # Customer account portal & order history
│   │   ├── pricecalculator/   # Printster-style live document & book price calculator
│   │   ├── pricing/           # Full rate card & transparent pricing guide
│   │   ├── services/          # Service catalog & configuration modal
│   │   ├── track/             # Live order tracking pipeline
│   │   ├── layout.tsx         # Root layout with theme provider & metadata
│   │   └── page.tsx           # High-conversion international homepage
│   ├── components/
│   │   ├── customizer/        # 3D merchandise preview canvas components
│   │   ├── home/              # Hero carousel & trust ticker
│   │   ├── layout/            # Floating glass Navbar & compliance Footer
│   │   ├── providers/         # Firebase AuthProvider & Theme Provider
│   │   └── upload/            # Secure document drag-and-drop uploader
│   ├── lib/
│   │   ├── firebase.ts        # Firebase Auth, Firestore, and Storage with mock fallbacks
│   │   ├── invoice.ts         # Automated branded PDF invoice generator
│   │   └── pricing.ts         # Pricing calculation engine, GSM matrix & spine calculator
│   └── types/                 # TypeScript interfaces and data models
├── package.json
└── README.md
```

---

## 🚦 Getting Started

### 1. Prerequisites
- Node.js 18.18+ or 20+
- npm, yarn, or pnpm

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd PrintHub
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> **Note**: If Firebase credentials are not provided, the application runs in local mode with mock data stored in `localStorage` and `sessionStorage`.

### 4. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

- `npm run dev`: Starts the Next.js development server with Turbopack.
- `npm run build`: Generates an optimized production build.
- `npm run start`: Runs the built production application.
- `npm run lint`: Executes ESLint for code quality and convention checks.

---

## 📄 License

This project is proprietary and maintained by **SUVIR Printing**. All rights reserved.
