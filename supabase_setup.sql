-- SUSHIFEST SUPABASE SETUP

-- 1. Profiles (Users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cedula TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Locales (Restaurants)
CREATE TABLE locales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Ratings (Stars)
CREATE TABLE ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    locale_id UUID REFERENCES locales(id) NOT NULL,
    flavor INTEGER CHECK (flavor >= 1 AND flavor <= 5),
    service INTEGER CHECK (service >= 1 AND service <= 5),
    presentation INTEGER CHECK (presentation >= 1 AND presentation <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, locale_id) -- One rating per user per restaurant
);

-- 4. Votes (The actual winner choice)
-- A user can vote for multiple restaurants but only once per restaurant
CREATE TABLE votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    locale_id UUID REFERENCES locales(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, locale_id)
);

-- 5. Coupons (Gift Cards)
CREATE TABLE coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'redeemed')),
    claimed_by UUID REFERENCES profiles(id),
    redeemed_at_locale UUID REFERENCES locales(id),
    redeemed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE locales ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Profiles can be created by anyone" ON profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Locales are public" ON locales FOR SELECT USING (true);

CREATE POLICY "Ratings are viewable by everyone" ON ratings FOR SELECT USING (true);
CREATE POLICY "Anyone can rate" ON ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update their ratings" ON ratings FOR UPDATE USING (true);

CREATE POLICY "Votes are private" ON votes FOR SELECT USING (false); -- Public cannot see vote counts
CREATE POLICY "Anyone can vote" ON votes FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can see their claimed coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Anyone can claim available coupons" ON coupons FOR UPDATE USING (status = 'available') WITH CHECK (true);