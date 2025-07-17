"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Session, User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/supabase";
import { profileCache } from "@/lib/auth-cache";

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    userData: Partial<Profile>
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetRateLimit: () => void; // Add this function
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  // Track initialization to prevent multiple calls
  const authListenerRef = useRef<{ data?: { subscription?: any } } | null>(null);
  const initAttempted = useRef(false);
  
  // Rate limiting for login attempts
  const lastLoginAttempt = useRef(0);
  const loginAttemptCount = useRef(0);
  const LOGIN_COOLDOWN = 5000; // 5 seconds between attempts
  const MAX_ATTEMPTS_PER_MINUTE = 3; // Maximum 3 attempts per minute
  const MINUTE_COOLDOWN = 60000; // 60 seconds
  const firstAttemptTime = useRef(0);

  // Create a single, memoized Supabase client
  const supabase = useMemo(() => {
    return createClientComponentClient();
  }, []);

  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      // Check cache first
      const cached = profileCache.get(userId);
      if (cached) {
        return cached;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          return null;
        }

        // Cache the result
        profileCache.set(userId, data);
        return data as Profile;
      } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    if (user) {
      try {
        // Clear cache and fetch fresh data
        profileCache.clear(user.id);
        const profileData = await fetchProfile(user.id);
        setProfile(profileData);
      } catch (error) {
        console.error("Error refreshing profile:", error);
      }
    }
  }, [user, fetchProfile]);

  const resetRateLimit = useCallback(() => {
    loginAttemptCount.current = 0;
    firstAttemptTime.current = 0;
    lastLoginAttempt.current = 0;
  }, []);

  // Initialize auth only once using useEffect
  useEffect(() => {
    if (initAttempted.current || !supabase) {
      return;
    }
    
    initAttempted.current = true;
    console.log("🚀 Initializing auth...");
    
    const initializeAuth = async () => {
      try {
        console.log("📡 Getting initial session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Error getting session:", error);
        } else {
          console.log("📊 Initial session:", session ? `Found session for ${session.user?.email}` : "No session");
        }

        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          console.log("👤 User found, fetching profile...");
          try {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
            console.log("✅ Profile set:", profileData);
          } catch (profileError) {
            console.error("❌ Profile fetch error:", profileError);
          }
        }
        
        // Set up auth state change listener for future changes
        console.log("🔔 Setting up auth listener...");
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("🔄 Auth state change:", event, session ? `has session for ${session.user?.email}` : "no session");
          
          setSession(session);
          setUser(session?.user || null);
          
          if (session?.user) {
            try {
              const profileData = await fetchProfile(session.user.id);
              setProfile(profileData);
              console.log("✅ Listener: Profile updated:", profileData);
            } catch (error) {
              console.error("❌ Listener: Profile fetch error:", error);
            }
          } else {
            setProfile(null);
            console.log("🧹 Listener: Cleared profile");
          }
        });
        
        // Store subscription for cleanup
        authListenerRef.current = { data: { subscription } };
        
      } catch (error) {
        console.error("🚨 Auth initialization error:", error);
      } finally {
        console.log("✅ Auth initialization complete");
        setIsLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
    
    // Cleanup function
    return () => {
      if (authListenerRef.current?.data?.subscription) {
        authListenerRef.current.data.subscription.unsubscribe();
      }
    };
  }, [supabase, fetchProfile]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("🔐 SignIn: Starting login process...");
      
      const now = Date.now();
      
      // Reset attempt count if more than a minute has passed
      if (now - firstAttemptTime.current > MINUTE_COOLDOWN) {
        loginAttemptCount.current = 0;
        firstAttemptTime.current = now;
      }
      
      // Check if we've exceeded attempts in the last minute
      if (loginAttemptCount.current >= MAX_ATTEMPTS_PER_MINUTE) {
        const timeUntilReset = Math.ceil((MINUTE_COOLDOWN - (now - firstAttemptTime.current)) / 1000);
        console.warn(`🚫 Too many login attempts. Need to wait ${timeUntilReset} seconds.`);
        return { 
          error: { 
            message: `Too many login attempts. Please wait ${timeUntilReset} seconds before trying again.` 
          } 
        };
      }
      
      // Check basic rate limiting between attempts
      if (now - lastLoginAttempt.current < LOGIN_COOLDOWN) {
        const remainingTime = Math.ceil((LOGIN_COOLDOWN - (now - lastLoginAttempt.current)) / 1000);
        console.warn(`⏰ Rate limit: Need to wait ${remainingTime} seconds between attempts.`);
        return { 
          error: { 
            message: `Please wait ${remainingTime} seconds before trying again.` 
          } 
        };
      }
      
      // Record this attempt
      lastLoginAttempt.current = now;
      loginAttemptCount.current += 1;
      
      // Set first attempt time if this is the first attempt in this window
      if (loginAttemptCount.current === 1) {
        firstAttemptTime.current = now;
      }
      
      console.log(`📊 Login attempt ${loginAttemptCount.current}/${MAX_ATTEMPTS_PER_MINUTE} in current window`);
      
      if (!supabase) {
        console.error("Supabase client is not initialized.");
        return { error: { message: "Supabase client is not initialized." } };
      }

      console.log("🔄 Attempting Supabase authentication...");
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ SignIn: Login failed:", error);
        
        // Handle specific error types
        if (error.message?.includes('rate limit') || error.message?.includes('Too many')) {
          console.error("🚫 Supabase rate limit hit! Blocking further attempts for 2 minutes.");
          // Block further attempts for 2 minutes when we hit Supabase rate limit
          firstAttemptTime.current = now;
          loginAttemptCount.current = MAX_ATTEMPTS_PER_MINUTE;
          return { 
            error: { 
              message: "Rate limit reached. Please wait 2 minutes before trying again." 
            } 
          };
        }
        
        if (error.message?.includes('Invalid login credentials')) {
          return { 
            error: { 
              message: "Invalid email or password. Please check your credentials." 
            } 
          };
        }
        
        if (error.message?.includes('Email not confirmed')) {
          return { 
            error: { 
              message: "Please check your email and confirm your account before logging in." 
            } 
          };
        }
        
        return { error };
      }

      if (data.user && data.session) {
        console.log("✅ SignIn: Login successful, updating state...");
        
        // Reset rate limiting on successful login
        loginAttemptCount.current = 0;
        firstAttemptTime.current = 0;
        console.log("🎉 Rate limiting reset after successful login");
        
        // Note: Don't manually update state here - let the auth listener handle it
        // This prevents duplicate state updates that could cause extra API calls
        console.log("🔄 Letting auth listener handle state update...");
        
        return { error: null };
      }

      return { error: "No user data returned" };
    } catch (err: any) {
      console.error("❌ SignIn: Exception:", err);
      return { error: err };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: Partial<Profile>
  ) => {
    try {
      if (!supabase) {
        console.error("Supabase client is not initialized.");
        return { error: "Supabase client is not initialized." };
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name || email,
            role: userData.role || "student",
            address: userData.address || "",
            ic_number: userData.ic_number || "",
          },
        },
      });

      return { error };
    } catch (err: any) {
      console.error("Signup error:", err);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      // Reset rate limiting on signout
      loginAttemptCount.current = 0;
      firstAttemptTime.current = 0;
      console.log("🧹 Rate limiting reset on signout");
      
      if (supabase) {
        await supabase.auth.signOut();
      } else {
        console.error("Supabase client is not initialized.");
      }
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      session,
      isLoading: isLoading && !initialized, // Only show loading if not initialized
      signIn,
      signUp,
      signOut,
      refreshProfile,
      resetRateLimit,
    }),
    [
      user,
      profile,
      session,
      isLoading,
      initialized,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      resetRateLimit,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
