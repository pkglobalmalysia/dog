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
import { authRateLimiter } from "@/lib/auth-rate-limiter";
import { authDebugger } from "@/lib/auth-debugger";

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
  getRateLimitInfo: () => any; // Rate limit information
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
  const profileFetchInProgress = useRef(false);
  
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
      // Prevent concurrent profile fetches for the same user
      if (profileFetchInProgress.current) {
        console.log("🔄 Profile fetch already in progress, skipping...");
        return null;
      }

      // Check cache first
      const cached = profileCache.get(userId);
      if (cached) {
        console.log("✨ Profile cache hit for user:", userId);
        return cached;
      }

      try {
        profileFetchInProgress.current = true;
        console.log("📡 Fetching profile for user:", userId);
        
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
        console.log("✅ Profile fetched and cached:", data);
        return data as Profile;
      } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
      } finally {
        profileFetchInProgress.current = false;
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
    authRateLimiter.reset();
    console.log("🔄 Rate limiting manually reset");
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
        authDebugger.log('session_check', 'Getting initial session')
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
          authDebugger.log('session_check', 'User found in session, fetching profile')
          console.log("👤 User found, fetching profile...");
          try {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
            console.log("✅ Profile set:", profileData);
          } catch (profileError) {
            authDebugger.log('error', `Profile fetch error in initializeAuth: ${profileError}`)
            console.error("❌ Profile fetch error:", profileError);
          }
        }
        
        // Set up auth state change listener for future changes
        console.log("🔔 Setting up auth listener...");
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          authDebugger.log('session_check', `Auth state change - Event: ${event}, Has session: ${!!session}`)
          console.log("🔄 Auth state change:", event, session ? `has session for ${session.user?.email}` : "no session");
          
          setSession(session);
          setUser(session?.user || null);
          
          if (session?.user) {
            authDebugger.log('session_check', 'User found in auth state change, fetching profile')
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

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      authDebugger.log('attempt', `Login attempt for ${email}`, new Error().stack)
      console.log("🔐 SignIn: Starting login process...");
      
      // Check rate limiting first
      const rateLimitCheck = authRateLimiter.isRateLimited();
      if (rateLimitCheck.limited) {
        authDebugger.log('rate_limit', `Rate limited: ${rateLimitCheck.message}`);
        console.warn("🚫 Rate limited:", rateLimitCheck.message);
        return { 
          error: { 
            message: rateLimitCheck.message || "Rate limited. Please wait before trying again." 
          } 
        }
      }
      
      const now = Date.now();
      
      // Legacy rate limiting (keeping as backup)
      // Reset attempt count if more than a minute has passed
      if (now - firstAttemptTime.current > MINUTE_COOLDOWN) {
        loginAttemptCount.current = 0;
        firstAttemptTime.current = now;
      }
      
      // Check basic rate limiting between attempts (prevent rapid clicking)
      if (now - lastLoginAttempt.current < LOGIN_COOLDOWN) {
        const remainingTime = Math.ceil((LOGIN_COOLDOWN - (now - lastLoginAttempt.current)) / 1000);
        console.warn(`⏰ Rate limit: Need to wait ${remainingTime} seconds between attempts.`);
        return { 
          error: { 
            message: `Please wait ${remainingTime} seconds between login attempts.` 
          } 
        };
      }
      
      // Record this attempt in both systems
      lastLoginAttempt.current = now;
      loginAttemptCount.current += 1;
      authRateLimiter.recordAttempt();
      
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
        if (error.message?.includes('rate limit') || 
            error.message?.includes('Too many') ||
            error.message?.includes('Request rate limit reached')) {
          authDebugger.log('rate_limit', `Supabase rate limit hit: ${error.message}`);
          console.error("🚫 Supabase rate limit hit! Implementing extended lockout.");
          
          // Record Supabase rate limit (this creates a longer lockout)
          authRateLimiter.recordSupabaseRateLimit();
          
          // Block further attempts for 10 minutes when we hit Supabase rate limit
          firstAttemptTime.current = now;
          loginAttemptCount.current = MAX_ATTEMPTS_PER_MINUTE;
          
          return { 
            error: { 
              message: "Supabase rate limit reached. Please wait 10 minutes before trying again. This is to prevent account lockout." 
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
        authDebugger.log('success', `Login successful for ${email}`)
        console.log("✅ SignIn: Login successful, updating state...");
        
        // Reset rate limiting on successful login
        loginAttemptCount.current = 0;
        firstAttemptTime.current = 0;
        authRateLimiter.recordSuccess();
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
  }, [supabase]);

  const signUp = useCallback(async (
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
  }, [supabase]);

  const signOut = useCallback(async () => {
    try {
      authDebugger.log('attempt', 'User signing out');
      // Reset rate limiting on signout
      loginAttemptCount.current = 0;
      firstAttemptTime.current = 0;
      authRateLimiter.reset();
      console.log("🧹 Rate limiting reset on signout");
      
      if (supabase) {
        await supabase.auth.signOut();
        authDebugger.log('success', 'User signed out successfully');
      } else {
        authDebugger.log('error', 'Supabase client not initialized on signout');
        console.error("Supabase client is not initialized.");
      }
    } catch (error) {
      authDebugger.log('error', `Sign out error: ${error}`);
      console.error("Sign out error:", error);
    }
  }, [supabase]);

  const getRateLimitInfo = useCallback(() => {
    const status = authRateLimiter.getStatus();
    const rateLimitCheck = authRateLimiter.isRateLimited();
    
    return {
      isRateLimited: rateLimitCheck.limited,
      remainingTime: rateLimitCheck.remainingTime,
      message: rateLimitCheck.message,
      attempts: status.attempts,
      windowStart: status.windowStart,
      lockedUntil: status.lockedUntil
    };
  }, []);

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
      getRateLimitInfo,
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
      getRateLimitInfo,
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
