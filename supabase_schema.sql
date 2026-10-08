-- ==============================================================================
-- CMCart Full Production Supabase PostgreSQL Schema
-- Version: 3.0
-- Includes: All tables, indexes, RLS policies, triggers, and helper functions
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for text search

-- ==============================================================================
-- 1. PROFILES (linked with Firebase Auth or Supabase Auth)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_uid VARCHAR(255) UNIQUE NOT NULL,   -- Firebase UID or Supabase Auth UID
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(30),
    avatar_url TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 2. CATEGORIES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(60),                         -- Lucide icon name (e.g. "Smartphone")
    image_url TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    item_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 3. PRODUCTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(280) UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100),
    brand VARCHAR(100),
    sku VARCHAR(100) UNIQUE,
    current_price DECIMAL(12, 2) NOT NULL,
    original_price DECIMAL(12, 2) NOT NULL,
    discount_percentage INT DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    status VARCHAR(30) DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock')),
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_deal_of_the_day BOOLEAN DEFAULT FALSE,
    is_best_seller BOOLEAN DEFAULT FALSE,
    is_new_arrival BOOLEAN DEFAULT FALSE,
    specifications JSONB DEFAULT '{}'::jsonb,
    offers TEXT[] DEFAULT ARRAY[]::TEXT[],
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 4. PRODUCT IMAGES (Cloudinary / any CDN)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    cloudinary_public_id VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 5. PRODUCT VARIANTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_name VARCHAR(100) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    price_modifier DECIMAL(12, 2) DEFAULT 0.00,
    stock_quantity INT NOT NULL DEFAULT 0,
    attributes JSONB DEFAULT '{}'::jsonb, -- e.g. {"size": "M", "color": "Red"}
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 6. INVENTORY
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    stock_quantity INT NOT NULL DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    status VARCHAR(30) DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 7. ADDRESSES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    address_line TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    type VARCHAR(20) DEFAULT 'Home' CHECK (type IN ('Home', 'Office', 'Other')),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 8. CART & CART ITEMS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES public.cart(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    is_saved_for_later BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 9. WISHLIST & WISHLIST ITEMS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wishlist_id UUID NOT NULL REFERENCES public.wishlist(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(wishlist_id, product_id)
);

-- ==============================================================================
-- 10. COUPONS & COUPON USAGE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL,
    minimum_order_amount DECIMAL(10, 2) DEFAULT 0,
    maximum_discount_amount DECIMAL(10, 2),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    usage_limit INT DEFAULT 1000,
    times_used INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.coupon_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 11. ORDERS, ORDER ITEMS & PAYMENTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id),
    address_id UUID REFERENCES public.addresses(id),
    shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN (
        'Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery',
        'Delivered', 'Cancelled', 'Returned'
    )),
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0.00,
    delivery_fee DECIMAL(12, 2) DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(60),
    payment_status VARCHAR(30) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Completed', 'Failed', 'Refunded', 'COD Pending', 'COD Collected')),
    coupon_id UUID REFERENCES public.coupons(id),
    tracking_number VARCHAR(100),
    carrier VARCHAR(100),
    estimated_delivery TEXT,
    timeline JSONB DEFAULT '[]'::jsonb,       -- array of {status, time, completed, note}
    is_paid BOOLEAN DEFAULT FALSE,
    cod_collected BOOLEAN DEFAULT FALSE,
    cod_collected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    variant_id UUID REFERENCES public.product_variants(id),
    product_name VARCHAR(255) NOT NULL,
    product_image TEXT,
    variant_name VARCHAR(100),
    sku VARCHAR(100),
    selected_options JSONB DEFAULT '{}'::jsonb,  -- {"color": "Red", "size": "M"}
    unit_price DECIMAL(12, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_price DECIMAL(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(60) NOT NULL,
    gateway_transaction_id VARCHAR(150),
    payment_status VARCHAR(30) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Completed', 'Failed', 'Refunded')),
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 12. REVIEWS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewer_name VARCHAR(150),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(150),
    comment TEXT NOT NULL,
    helpful_count INT DEFAULT 0,
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 13. NOTIFICATIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'order' CHECK (type IN ('order', 'promo', 'price_drop', 'system')),
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 14. BANNERS (Homepage Promotional Banners)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    subtitle VARCHAR(255),
    tag VARCHAR(60),
    badge_text VARCHAR(60),
    image_url TEXT NOT NULL,
    gradient TEXT,                        -- CSS gradient string for overlay
    cta_text VARCHAR(60) DEFAULT 'Shop Now',
    cta_link VARCHAR(255) DEFAULT '/products',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 15. HOMEPAGE SECTIONS (CMS Engine)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.homepage_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    subtitle VARCHAR(255),
    section_type VARCHAR(50) NOT NULL CHECK (section_type IN (
        'hero_banner', 'deals', 'categories', 'best_sellers',
        'banner_promo', 'new_arrivals', 'coupons', 'recommended', 'custom'
    )),
    display_order INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'disabled', 'scheduled', 'expired')),
    layout VARCHAR(40) DEFAULT 'grid' CHECK (layout IN ('grid', 'carousel', 'horizontal_scroll', 'banner', 'list')),
    config JSONB DEFAULT '{}'::jsonb,     -- {"mode": "automatic", "limit": 8}
    deal_id UUID,                         -- reference to a deal (not FK to allow flexibility)
    start_at TIMESTAMP WITH TIME ZONE,
    end_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 16. DEALS (Flash Deals / Deals of the Day)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    title VARCHAR(150),
    subtitle VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'scheduled', 'expired', 'disabled')),
    deal_badge VARCHAR(30) DEFAULT 'DEAL',
    start_at TIMESTAMP WITH TIME ZONE,
    end_at TIMESTAMP WITH TIME ZONE,
    limit_per_customer INT DEFAULT 2,
    promotional_stock INT DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.deal_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    deal_price DECIMAL(12, 2) NOT NULL,
    discount_percentage INT DEFAULT 0,
    display_order INT DEFAULT 0,
    UNIQUE(deal_id, product_id)
);

-- ==============================================================================
-- 17. CAMPAIGNS (Promotional Campaign Bundles)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'scheduled', 'expired', 'disabled')),
    start_at TIMESTAMP WITH TIME ZONE,
    end_at TIMESTAMP WITH TIME ZONE,
    section_ids TEXT[] DEFAULT ARRAY[]::TEXT[],      -- homepage section IDs to bundle
    coupon_codes TEXT[] DEFAULT ARRAY[]::TEXT[],     -- coupon codes to bundle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 18. SETTINGS (Global Store Config)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Seed default settings
INSERT INTO public.settings (key, value, description) VALUES
    ('store_name', '"CMCart Technologies India"', 'Primary store brand name'),
    ('support_email', '"operations@cmcart.com"', 'Customer support email address'),
    ('free_shipping_threshold', '999', 'Cart total above which shipping is free (INR)'),
    ('standard_delivery_fee', '99', 'Standard delivery charge in INR'),
    ('tax_rate', '18', 'GST tax rate percentage'),
    ('enable_razorpay', 'true', 'Enable Razorpay payment gateway'),
    ('enable_cod', 'true', 'Enable Cash on Delivery option'),
    ('auto_confirm_orders', 'true', 'Auto-confirm orders after payment'),
    ('low_stock_threshold', '5', 'Units below which low stock alert triggers'),
    ('maintenance_mode', 'false', 'When true, storefront shows maintenance page')
ON CONFLICT (key) DO NOTHING;

-- ==============================================================================
-- 19. API KEYS (For CMCart Insights & External Apps)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application VARCHAR(150) NOT NULL,
    purpose TEXT,
    environment VARCHAR(20) DEFAULT 'Production' CHECK (environment IN ('Production', 'Test')),
    api_key VARCHAR(100) UNIQUE NOT NULL,
    api_secret_hash VARCHAR(255) NOT NULL,           -- store bcrypt hash, never plaintext
    permissions TEXT[] DEFAULT ARRAY[]::TEXT[],      -- e.g. {"orders:read", "products:read"}
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'revoked')),
    last_used_at TIMESTAMP WITH TIME ZONE,
    requests_today INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 20. DATASET REGISTRY (Tracks uploaded datasets for Dataset Manager)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.dataset_registry (
    id VARCHAR(100) PRIMARY KEY,                    -- e.g. "ds-1728392844000"
    name VARCHAR(150) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    is_temporary BOOLEAN DEFAULT FALSE,
    stats JSONB DEFAULT '{}'::jsonb,                -- {orders, products, categories, revenue}
    data JSONB,                                     -- full dataset snapshot (optional for large datasets)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================

-- Products
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(current_price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON public.products(rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON public.products(is_best_seller) WHERE is_best_seller = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON public.products(is_new_arrival) WHERE is_new_arrival = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING gin(name gin_trgm_ops);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_profile ON public.orders(profile_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_profile ON public.reviews(profile_id);

-- Cart & Wishlist
CREATE INDEX IF NOT EXISTS idx_cart_profile ON public.cart(profile_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_profile ON public.wishlist(profile_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_profile ON public.notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(profile_id, is_read) WHERE is_read = FALSE;

-- Banners & Sections
CREATE INDEX IF NOT EXISTS idx_banners_active ON public.banners(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_order ON public.homepage_sections(display_order);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_status ON public.homepage_sections(status);

-- Deals
CREATE INDEX IF NOT EXISTS idx_deals_status ON public.deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_active ON public.deals(start_at, end_at);

-- API Keys
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON public.api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON public.api_keys(status);

-- ==============================================================================
-- AUTO-UPDATE TRIGGERS
-- ==============================================================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all relevant tables
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_product_variants_updated_at
    BEFORE UPDATE ON public.product_variants
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_addresses_updated_at
    BEFORE UPDATE ON public.addresses
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_coupons_updated_at
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_banners_updated_at
    BEFORE UPDATE ON public.banners
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_homepage_sections_updated_at
    BEFORE UPDATE ON public.homepage_sections
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_deals_updated_at
    BEFORE UPDATE ON public.deals
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_campaigns_updated_at
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_api_keys_updated_at
    BEFORE UPDATE ON public.api_keys
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-calculate product discount_percentage on price change
CREATE OR REPLACE FUNCTION public.calc_product_discount()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.original_price > 0 AND NEW.original_price >= NEW.current_price THEN
        NEW.discount_percentage := ROUND(((NEW.original_price - NEW.current_price) / NEW.original_price) * 100);
    ELSE
        NEW.discount_percentage := 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_products_calc_discount
    BEFORE INSERT OR UPDATE OF current_price, original_price ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.calc_product_discount();

-- Auto-update category item_count when products change
CREATE OR REPLACE FUNCTION public.update_category_item_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' AND OLD.category_id IS NOT NULL THEN
        UPDATE public.categories
        SET item_count = (SELECT COUNT(*) FROM public.products WHERE category_id = OLD.category_id AND is_active = TRUE),
            updated_at = NOW()
        WHERE id = OLD.category_id;
    ELSIF NEW.category_id IS NOT NULL THEN
        UPDATE public.categories
        SET item_count = (SELECT COUNT(*) FROM public.products WHERE category_id = NEW.category_id AND is_active = TRUE),
            updated_at = NOW()
        WHERE id = NEW.category_id;
        -- Also update old category if category changed
        IF TG_OP = 'UPDATE' AND OLD.category_id IS NOT NULL AND OLD.category_id != NEW.category_id THEN
            UPDATE public.categories
            SET item_count = (SELECT COUNT(*) FROM public.products WHERE category_id = OLD.category_id AND is_active = TRUE),
                updated_at = NOW()
            WHERE id = OLD.category_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_category_count
    AFTER INSERT OR UPDATE OF category_id, is_active OR DELETE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_category_item_count();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_registry ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- HELPER FUNCTIONS
-- ==============================================================================

-- Check if the requesting user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE auth_uid = auth.uid()::text AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get the current user's profile ID
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID AS $$
  SELECT id FROM public.profiles WHERE auth_uid = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- ==============================================================================
-- RLS POLICIES
-- ==============================================================================

-- PUBLIC READ (catalog, banners, homepage sections)
CREATE POLICY "Public read active products"
    ON public.products FOR SELECT
    USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Public read active categories"
    ON public.categories FOR SELECT
    USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Public read active banners"
    ON public.banners FOR SELECT
    USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Public read approved reviews"
    ON public.reviews FOR SELECT
    USING (status = 'approved' OR public.is_admin());

CREATE POLICY "Public read product images"
    ON public.product_images FOR SELECT
    USING (TRUE);

CREATE POLICY "Public read product variants"
    ON public.product_variants FOR SELECT
    USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Public read active homepage sections"
    ON public.homepage_sections FOR SELECT
    USING (status = 'active' OR public.is_admin());

CREATE POLICY "Public read active deals"
    ON public.deals FOR SELECT
    USING (status = 'active' OR public.is_admin());

CREATE POLICY "Public read deal products"
    ON public.deal_products FOR SELECT
    USING (TRUE);

CREATE POLICY "Public read active coupons"
    ON public.coupons FOR SELECT
    USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Public read settings"
    ON public.settings FOR SELECT
    USING (TRUE);

-- CUSTOMER SELF-MANAGEMENT
CREATE POLICY "Users manage own profile"
    ON public.profiles FOR ALL
    USING (auth_uid = auth.uid()::text);

CREATE POLICY "Users manage own cart"
    ON public.cart FOR ALL
    USING (profile_id = public.current_profile_id());

CREATE POLICY "Users manage own cart items"
    ON public.cart_items FOR ALL
    USING (cart_id IN (SELECT id FROM public.cart WHERE profile_id = public.current_profile_id()));

CREATE POLICY "Users manage own wishlist"
    ON public.wishlist FOR ALL
    USING (profile_id = public.current_profile_id());

CREATE POLICY "Users manage own wishlist items"
    ON public.wishlist_items FOR ALL
    USING (wishlist_id IN (SELECT id FROM public.wishlist WHERE profile_id = public.current_profile_id()));

CREATE POLICY "Users manage own addresses"
    ON public.addresses FOR ALL
    USING (profile_id = public.current_profile_id() OR public.is_admin());

CREATE POLICY "Users view own orders"
    ON public.orders FOR SELECT
    USING (profile_id = public.current_profile_id() OR public.is_admin());

CREATE POLICY "Users create own orders"
    ON public.orders FOR INSERT
    WITH CHECK (profile_id = public.current_profile_id() OR public.is_admin());

CREATE POLICY "Users view own order items"
    ON public.order_items FOR SELECT
    USING (order_id IN (SELECT id FROM public.orders WHERE profile_id = public.current_profile_id()) OR public.is_admin());

CREATE POLICY "Users view own payments"
    ON public.payments FOR SELECT
    USING (order_id IN (SELECT id FROM public.orders WHERE profile_id = public.current_profile_id()) OR public.is_admin());

CREATE POLICY "Users view own notifications"
    ON public.notifications FOR SELECT
    USING (profile_id = public.current_profile_id() OR public.is_admin());

CREATE POLICY "Users update own notifications"
    ON public.notifications FOR UPDATE
    USING (profile_id = public.current_profile_id());

CREATE POLICY "Users delete own notifications"
    ON public.notifications FOR DELETE
    USING (profile_id = public.current_profile_id());

CREATE POLICY "Users create reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (profile_id = public.current_profile_id());

CREATE POLICY "Users update own reviews"
    ON public.reviews FOR UPDATE
    USING (profile_id = public.current_profile_id() OR public.is_admin());

CREATE POLICY "Users log coupon usage"
    ON public.coupon_usage FOR INSERT
    WITH CHECK (profile_id = public.current_profile_id());

CREATE POLICY "Users view own coupon usage"
    ON public.coupon_usage FOR SELECT
    USING (profile_id = public.current_profile_id() OR public.is_admin());

-- ADMIN FULL ACCESS
CREATE POLICY "Admin full products access"
    ON public.products FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin full categories access"
    ON public.categories FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin full orders access"
    ON public.orders FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin full order items access"
    ON public.order_items FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin full inventory access"
    ON public.inventory FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin full banners access"
    ON public.banners FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin full homepage sections access"
    ON public.homepage_sections FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin full deals access"
    ON public.deals FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin full deal products access"
    ON public.deal_products FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin full campaigns access"
    ON public.campaigns FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin full coupons access"
    ON public.coupons FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin full settings access"
    ON public.settings FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin full payments access"
    ON public.payments FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin full api keys access"
    ON public.api_keys FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin full dataset registry access"
    ON public.dataset_registry FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage product images"
    ON public.product_images FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin manage product variants"
    ON public.product_variants FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin notifications insert"
    ON public.notifications FOR INSERT
    WITH CHECK (public.is_admin() OR profile_id = public.current_profile_id());

-- ==============================================================================
-- USEFUL VIEWS FOR ADMIN DASHBOARD
-- ==============================================================================

-- Admin: Revenue summary by month
CREATE OR REPLACE VIEW public.admin_revenue_by_month AS
SELECT
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) AS order_count,
    SUM(total_amount) AS total_revenue,
    AVG(total_amount) AS avg_order_value
FROM public.orders
WHERE status NOT IN ('Cancelled', 'Returned')
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Admin: Top products by order count
CREATE OR REPLACE VIEW public.admin_top_products AS
SELECT
    p.id,
    p.name,
    p.brand,
    p.current_price,
    p.rating,
    p.review_count,
    SUM(oi.quantity) AS total_units_sold,
    SUM(oi.total_price) AS total_revenue
FROM public.products p
JOIN public.order_items oi ON p.id = oi.product_id
JOIN public.orders o ON oi.order_id = o.id
WHERE o.status NOT IN ('Cancelled', 'Returned')
GROUP BY p.id, p.name, p.brand, p.current_price, p.rating, p.review_count
ORDER BY total_units_sold DESC;

-- Admin: Low stock products alert
CREATE OR REPLACE VIEW public.admin_low_stock_products AS
SELECT
    p.id,
    p.name,
    p.sku,
    p.brand,
    p.stock,
    p.status,
    c.name AS category_name
FROM public.products p
LEFT JOIN public.categories c ON p.category_id = c.id
WHERE p.stock <= 5 AND p.is_active = TRUE
ORDER BY p.stock ASC;

-- ==============================================================================
-- GRANT PERMISSIONS TO SERVICE ROLE
-- ==============================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- ==============================================================================
-- END OF CMCart Full Schema v3.0
-- ==============================================================================
