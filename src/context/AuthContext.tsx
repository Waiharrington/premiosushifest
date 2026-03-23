"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';

interface AuthContextType {
    user: UserProfile | null;
    login: (cedula: string) => Promise<boolean>;
    register: (name: string, cedula: string, phone: string) => Promise<UserProfile | null>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = () => {
            const storedUser = localStorage.getItem('sushifest_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = async (cedula: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('cedula', cedula)
            .single();

        if (data) {
            setUser(data);
            localStorage.setItem('sushifest_user', JSON.stringify(data));
            return true;
        }
        return false;
    };

    const register = async (name: string, cedula: string, phone: string) => {
        // First check if exists
        const { data: existing } = await supabase
            .from('profiles')
            .select('*')
            .eq('cedula', cedula)
            .single();

        if (existing) {
            setUser(existing);
            localStorage.setItem('sushifest_user', JSON.stringify(existing));
            return existing;
        }

        const { data } = await supabase
            .from('profiles')
            .insert([{ full_name: name, cedula, phone }])
            .select()
            .single();

        if (data) {
            setUser(data);
            localStorage.setItem('sushifest_user', JSON.stringify(data));
            return data;
        }
        return null;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('sushifest_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
