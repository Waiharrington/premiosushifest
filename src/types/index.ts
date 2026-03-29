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
    prize_type: 'discount' | 'gift' | 'sponsor_gift' | 'courtesy' | 'try_again';
    prize_image?: string;
    is_redeemed?: boolean;
    redeemed_at?: string;
    created_at: string;
}

export interface Sponsor {
    id: string;
    name: string;
    logo_url?: string;
    contact_email?: string;
    is_active: boolean;
    created_at: string;
}
