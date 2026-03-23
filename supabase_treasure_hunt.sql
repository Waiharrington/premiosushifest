-- Table for treasure hunt visits
CREATE TABLE IF NOT EXISTS treasure_hunt_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    locale_id UUID REFERENCES locales(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, locale_id)
);

-- Table for treasure hunt prizes
CREATE TABLE IF NOT EXISTS treasure_hunt_prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    locale_id UUID REFERENCES locales(id) ON DELETE CASCADE,
    prize_name TEXT NOT NULL,
    prize_type TEXT NOT NULL, -- 'discount', 'gift', 'try_again'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE treasure_hunt_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasure_hunt_prizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own visits" ON treasure_hunt_visits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own prizes" ON treasure_hunt_prizes
    FOR SELECT USING (auth.uid() = user_id);
