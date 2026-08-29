# 🏗️ MARKSONGLOBAL (MG) STORES — Technical Website Blueprint

This blueprint outlines the complete technical development roadmap for building a premium, modern digital supermarket for **MARKSONGLOBAL STORES**.

---

## 🏛️ 1. Technical Stack Architecture
* **Frontend Framework:** Next.js (App Router recommended for optimal SEO and performance)
* **Hosting & Deployment:** [Vercel](https://vercel.com) (Global Edge network ensures fast loading speeds across Nigerian mobile networks)
* **Backend-as-a-Service:** [Supabase](https://supabase.com) (PostgreSQL Database, Built-in Auth, Real-time APIs, and Object Storage)
* **Styling Framework:** Tailwind CSS (configured with the custom brand identity palette)
* **State Management:** Zustand or React Context (for fluid, fast client-side cart operations)

---

## 🎨 2. UI/UX & Tailwind CSS Configuration
To capture the exact "modern, premium, yet accessible Nigerian supermarket" aesthetic, implement this custom color layout inside your design system tokens:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          emerald: '#004B23',  // Deep Emerald Green (Trust, Freshness, Groceries)
          gold: '#D4AF37',     // Warm Gold (Premium Quality, Electronics Accent)
          charcoal: '#1A1A1A', // Primary Body Text
          offwhite: '#F8F9FA', // Main Page Backgrounds
          white: '#FFFFFF'     // Cards & Core Component Containers
        }
      }
    }
  }
}
```

---

## 🗄️ 3. Supabase Relational Database Schema (PostgreSQL)
Run these SQL structures in your Supabase SQL Editor to initialize your dynamic digital catalog, manage stock, and secure orders.

### A. Categories Table
```sql
create table categories (
  id uuid default gen_random_uuid() primary key,
  name varchar(255) not null,
  slug varchar(255) unique not null,
  icon_url text, -- Path to storage bucket item
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### B. Products Table
```sql
create table products (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references categories(id) on delete set null,
  name varchar(255) not null,
  slug varchar(255) unique not null,
  description text,
  price numeric(12, 2) not null, -- Stored in Nigerian Naira (e.g. 25000.00)
  discount_price numeric(12, 2), -- Populated if an item is actively on sale
  is_deal boolean default false, -- Toggles items into the "Today's Deals" hot section
  stock_quantity integer default 0,
  sku varchar(100) unique,
  images text[], -- Array of full image URLs hosted in Supabase Storage buckets
  specifications jsonb, -- Flexible metadata (e.g. '{"ram": "8GB"}' for phones or '{"weight": "1kg"}' for provisions)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### C. User Profiles Table (Linked to Supabase Native Auth)
```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone_number text,
  delivery_address text,
  state text, -- Essential for regional shipping rules across Nigeria
  city text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### D. Orders & Transaction Items Tables
```sql
create table orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete set null,
  status varchar(50) default 'pending', -- pending, paid, processing, shipped, delivered, cancelled
  total_amount numeric(12, 2) not null,
  shipping_fee numeric(12, 2) not null,
  payment_reference varchar(255) unique, -- Webhook metadata token from Paystack/Flutterwave
  shipping_address text not null,
  recipient_name text not null,
  recipient_phone text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  quantity integer not null,
  price_at_purchase numeric(12, 2) not null
);
```

---

## 🎛️ 4. Supabase Storage Bucket Setup
1. Create a public bucket in your Supabase Dashboard named `product-images`.
2. Set up a Storage Policy allowing public read access (`true`) so imagery renders correctly across your Vercel deployment.
3. Organize assets by categories inside the bucket for simple path definitions (e.g., `product-images/electronics/` or `product-images/groceries/`).

---

## 🗺️ 5. Implementation Roadmap (3-Week Target Launch)

### 🗓️ Phase 1: Infrastructure & Data Hydration (Days 1–5)
* Initialize local code project and connect to a Git provider (GitHub/GitLab).
* Initialize your [Supabase](https://supabase.com) project, run the SQL schema, and populate environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
* Seed mock catalog items across provisions (e.g., Peak Milk, Indomie) and electronics (e.g., Power Bank, Bluetooth Speaker) to test relational mapping.

### 🗓️ Phase 2: Responsive Frontend Assembly (Days 6–12)
* Build your global **Header Nav** featuring the heavy-weight MG branding, full text search, and real-time localized cart summary.
* Code the **Hero Grid Banner**, blending high-resolution product photography from groceries and electronics together under the uniform brand colors.
* Create standard data-fetching interfaces linking category sliders (`Groceries & Provisions`, `Electronics`) directly to your database hooks.

### 🗓️ Phase 3: Transactional Logic & Checkout (Days 13–17)
* Wire up customer profile views using Supabase Authentication modules.
* Build local client state logic for cart management (adding, removing, quantity manipulation).
* Configure a secure Vercel API Route or a Supabase Edge Function to safely interface checkout steps with a Nigerian payment provider SDK.

### 🗓️ Phase 4: Delivery Mapping & Go-Live (Days 18–21)
* Link a basic flat-rate delivery logic matrix based on the customer's state input field during final shipping verification.
* Link production environment parameters onto the [Vercel Deployment Dashboard](https://vercel.com).
* Secure your production custom domain registry, perform live transaction stress-tests with low real-money amounts, and open public operations.
