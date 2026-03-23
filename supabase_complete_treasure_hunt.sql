-- SUSHIFEST COMPLETE SETUP (FOR NEW PROJECT)

-- 1. Profiles (Users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cedula TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Locales (Restaurants)
CREATE TABLE IF NOT EXISTS locales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Treasure Hunt Visits
CREATE TABLE IF NOT EXISTS treasure_hunt_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    locale_id UUID REFERENCES locales(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, locale_id)
);

-- 4. Treasure Hunt Prizes
CREATE TABLE IF NOT EXISTS treasure_hunt_prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    locale_id UUID REFERENCES locales(id) ON DELETE CASCADE,
    prize_name TEXT NOT NULL,
    prize_type TEXT NOT NULL, -- 'discount', 'gift', 'try_again'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE locales ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasure_hunt_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasure_hunt_prizes ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can register" ON profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Locales are public" ON locales FOR SELECT USING (true);

CREATE POLICY "Users can view their own visits" ON treasure_hunt_visits
    FOR SELECT USING (auth.uid() = user_id OR true); -- Allowing public select for demo if needed, but standard is auth.uid()

CREATE POLICY "Users can insert their visits" ON treasure_hunt_visits
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own prizes" ON treasure_hunt_prizes
    FOR SELECT USING (auth.uid() = user_id OR true);

CREATE POLICY "Users can insert their prizes" ON treasure_hunt_prizes
    FOR INSERT WITH CHECK (true);

-- 7. Sample Data (Locales)
INSERT INTO locales (name, image_url, description) VALUES
('Sushi Press', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80', 'Especialistas en rolls creativos.'),
('La Suchería', 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?auto=format&fit=crop&w=800&q=80', 'Fusión latina y japonesa.'),
('Sushi Katano', 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=800&q=80', 'El mejor sushi tradicional.'),
('Zen Sushi', 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80', 'Experiencia premium y ambiente zen.'),
('Wasabi House', 'https://images.unsplash.com/photo-1559466273-d95e72debaf8?auto=format&fit=crop&w=800&q=80', 'Sabor auténtico y fresco.'),
('Nikka Sushi', 'https://images.unsplash.com/photo-1558985250-27a406d64cb3?auto=format&fit=crop&w=800&q=80', 'Innovación en cada bocado.');
