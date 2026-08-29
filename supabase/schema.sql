-- ============================================================
-- MARKSONGLOBAL STORES — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- A. Categories Table
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name varchar(255) not null,
  slug varchar(255) unique not null,
  icon_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- B. Products Table
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references categories(id) on delete set null,
  name varchar(255) not null,
  slug varchar(255) unique not null,
  description text,
  price numeric(12, 2) not null,
  discount_price numeric(12, 2),
  is_deal boolean default false,
  stock_quantity integer default 0,
  sku varchar(100) unique,
  images text[],
  specifications jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- C. User Profiles Table (linked to Supabase Auth)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone_number text,
  delivery_address text,
  state text,
  city text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- D. Orders Table
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete set null,
  status varchar(50) default 'pending',
  total_amount numeric(12, 2) not null,
  shipping_fee numeric(12, 2) not null,
  payment_reference varchar(255) unique,
  shipping_address text not null,
  recipient_name text not null,
  recipient_phone text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- E. Order Items Table
create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  quantity integer not null,
  price_at_purchase numeric(12, 2) not null
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table categories enable row level security;
alter table products enable row level security;
alter table profiles enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Public read for categories and products
create policy "Public can read categories" on categories for select using (true);
create policy "Public can read products" on products for select using (true);

-- Profiles: users manage their own
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Orders: users see their own orders
create policy "Users can view own orders" on orders for select using (auth.uid() = user_id);
create policy "Users can insert own orders" on orders for insert with check (auth.uid() = user_id);
create policy "Users can view own order items" on order_items for select using (
  order_id in (select id from orders where user_id = auth.uid())
);
