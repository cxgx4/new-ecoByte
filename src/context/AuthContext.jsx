import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileName, setProfileName] = useState(null);

    useEffect(() => {
        // Fetch current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfileName(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', userId)
                .single();
                
            if (error) {
                console.error("Error fetching profile:", error);
            } else if (data) {
                setProfileName(data.name);
            }
        } catch (err) {
            console.error("Unexpected error fetching profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email, password, name) => {
        return supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                }
            }
        });
    };

    const signIn = async (email, password) => {
        return supabase.auth.signInWithPassword({ email, password });
    };

    const signOut = async () => {
        return supabase.auth.signOut();
    };
    
    const resetPassword = async (email) => {
        return supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        });
    }
    
    const updatePassword = async (newPassword) => {
        return supabase.auth.updateUser({ password: newPassword });
    }

    const value = {
        session,
        user,
        profileName,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
