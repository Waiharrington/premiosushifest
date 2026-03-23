export interface UserProfile {
    id: string;
    cedula: string;
    full_name: string;
    phone: string;
    created_at?: string;
}

export interface Locale {
    id: string;
    name: string;
    image_url: string;
    description: string;
}

export interface Rating {
    id: string;
    user_id: string;
    locale_id: string;
    flavor: number;
    service: number;
    presentation: number;
    created_at: string;
}

export interface Vote {
    id: string;
    user_id: string;
    locale_id: string;
    created_at: string;
}

export interface TreasureHuntVisit {
    id: string;
    user_id: string;
    locale_id: string;
    created_at: string;
}

export interface TreasureHuntPrize {
    id: string;
    user_id: string;
    locale_id: string;
    prize_name: string;
    prize_type: 'discount' | 'gift' | 'try_again';
    created_at: string;
}
