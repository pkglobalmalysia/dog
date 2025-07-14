"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, usePathname } from "next/navigation";
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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log("🎯 AuthProvider component rendering...");
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Track if we've attempted initialization
  const initAttempted = useRef(false);

  // TEST useEffect - let's see if this works
  useEffect(() => {
    console.log("🚀 EARLY useEffect is running! This means useEffect works!");
  }, []);

  console.log("🔍 Current pathname:", pathname);
  console.log("📊 Current state - isLoading:", isLoading, "initialized:", initialized);

  const supabase = useMemo(() => {
    console.log("🔧 Creating Supabase client...");
    const client = createClientComponentClient();
    if (client) {
      console.log("✅ Supabase client created successfully");
    } else {
      console.error("❌ Failed to create Supabase client");
    }
    return client;
  }, []);

  const fetchProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      console.log("🔍 Fetching profile for user:", userId);
      
      // Check cache first
      const cached = profileCache.get(userId);
      if (cached) {
        console.log("📦 Profile found in cache:", cached);
        return cached;
      }

      try {
        if (!supabase) {
          console.error("❌ Supabase client is not initialized.");
          return null;
        }
        
        console.log("🌐 Fetching profile from database...");
        
        // Add timeout protection to prevent hanging (increased to 15 seconds)
        const profilePromise = supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
          
        console.log("⏱️ Starting Promise.race with 15s timeout...");
        
        let timeoutId: NodeJS.Timeout | undefined;
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            console.log("⚠️ Profile fetch timeout triggered");
            reject(new Error("Profile fetch timeout - please check your internet connection"));
          }, 15000);
        });

        const result = await Promise.race([profilePromise, timeoutPromise]);
        
        // Clear the timeout since we got a result
        if (timeoutId) clearTimeout(timeoutId);
        console.log("📡 Promise.race completed, result:", result);
        
        const { data, error } = result;

        if (error) {
          console.error("❌ Error fetching profile:", error);
          return null;
        }

        console.log("✅ Profile fetched successfully:", data);
        // Cache the result
        profileCache.set(userId, data);
        return data as Profile;
      } catch (error) {
        console.error("🚨 Catch block - Error fetching profile:", error);
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
        // On error, don't update profile state to prevent showing stale data
      }
    }
  }, [user, fetchProfile]);

  const getDashboardPath = useCallback((role: string, approved?: boolean) => {
    switch (role) {
      case "student":
        return "/dashboard/student";
      case "teacher":
        return approved ? "/dashboard/teacher" : "/pending-approval";
      case "admin":
        return "/admin";
      default:
        return "/";
    }
  }, []);

  // Direct initialization since useEffect isn't working
  if (supabase && !initAttempted.current && !initialized) {
    console.log("🔥 DIRECT INITIALIZATION - Running during render!");
    initAttempted.current = true;
    
    // Run async initialization
    (async () => {
      try {
        console.log("📡 Direct: Getting initial session...");
        
        // First, try to refresh the session to make sure we have the latest
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Direct: Error getting session:", error);
        } else {
          console.log("📊 Direct: Initial session:", session ? `Found session for ${session.user?.email}` : "No session");
        }

        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          console.log("👤 Direct: User found, fetching profile...");
          try {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
            console.log("✅ Direct: Profile set:", profileData);
            
            // Force a re-render to update the UI
            setIsLoading(false);
            setInitialized(true);
          } catch (profileError) {
            console.error("❌ Direct: Profile fetch error:", profileError);
            setIsLoading(false);
            setInitialized(true);
          }
        } else {
          setIsLoading(false);
          setInitialized(true);
        }
        
        // Set up auth state change listener for future changes
        console.log("🔔 Direct: Setting up auth listener...");
        supabase.auth.onAuthStateChange(async (event, session) => {
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
        
      } catch (error) {
        console.error("🚨 Direct: Auth initialization error:", error);
        setIsLoading(false);
        setInitialized(true);
      }
    })();
  }

  const handleAuthStateChange = useCallback(
    async (session: Session | null) => {
      console.log("Auth state change - Session:", session ? "exists" : "null");
      console.log("Current pathname:", pathname);
      
      try {
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          console.log("👤 User session found, fetching profile for:", session.user.email);
          console.log("🆔 User ID:", session.user.id);
          
          try {
            console.log("🚀 About to call fetchProfile...");
            const profileData = await fetchProfile(session.user.id);
            console.log("📊 fetchProfile returned:", profileData);
            
            if (profileData) {
              setProfile(profileData);
              console.log("✅ Profile set to:", profileData);
            } else {
              console.warn("⚠️ Profile fetch returned null, user may need to complete registration");
              setProfile(null);
            }
          } catch (profileError) {
            console.error("🚨 Failed to fetch profile:", profileError);
            // Don't block authentication if profile fetch fails
            // User can still access basic functionality
            setProfile(null);
          }

          // Only redirect if on auth pages - avoid redirecting on dashboard/protected pages
          // Use profile state instead of profileData variable
        } else {
          console.log("No user session, clearing profile");
          setProfile(null);
          profileCache.clear();

          // Only redirect to login if on protected routes
          if (
            (pathname.startsWith("/dashboard") ||
              pathname.startsWith("/admin") ||
              pathname === "/pending-approval") &&
            pathname !== "/login"
          ) {
            console.log("Redirecting to login from protected route");
            router.replace("/login");
          }
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        setProfile(null);
      } finally {
        // Always ensure loading state is cleared
        setIsLoading(false);
      }
    },
    [fetchProfile, pathname, router, getDashboardPath]
  );

  console.log("🎬 About to set up useEffect for auth initialization...");

  // Try useLayoutEffect instead - runs before useEffect
  useLayoutEffect(() => {
    console.log("🚀 useLayoutEffect RUNNING - this should work!");
    
    if (!supabase) {
      console.error("❌ No supabase in layoutEffect");
      return;
    }
    
    const quickInit = async () => {
      console.log("⚡ Quick auth initialization...");
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("📊 LayoutEffect session:", session ? "Found" : "None");
        
        if (session) {
          setSession(session);
          setUser(session.user);
          setIsLoading(false);
          setInitialized(true);
          
          // Try to fetch profile
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
          console.log("✅ LayoutEffect profile set:", profileData?.full_name);
        } else {
          setIsLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error("❌ LayoutEffect error:", error);
        setIsLoading(false);
        setInitialized(true);
      }
    };
    
    quickInit();
  }, [supabase, fetchProfile]);

  // Simple test useEffect
  useEffect(() => {
    console.log("🔥 SIMPLE useEffect is working!");
  }, []);

  useEffect(() => {
    console.log("🎉 useEffect callback is RUNNING!");
    
    const initializeAuth = async () => {
      console.log("🚀 Initializing auth...");
      
      if (!supabase) {
        console.error("❌ Supabase client is not initialized.");
        setIsLoading(false);
        setInitialized(true);
        return;
      }

      try {
        console.log("📡 Getting initial session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Error getting session:", error);
        } else {
          console.log("� Initial session:", session ? "Found session" : "No session");
        }

        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          console.log("� User found, fetching profile...");
          try {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
            console.log("✅ Profile set:", profileData);
          } catch (profileError) {
            console.error("❌ Profile fetch error:", profileError);
          }
        }
        
      } catch (error) {
        console.error("� Auth initialization error:", error);
      } finally {
        console.log("✅ Auth initialization complete");
        setIsLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []); // Empty dependency array

  const signIn = async (email: string, password: string) => {
    try {
      console.log("🔐 SignIn: Starting login process...");
      if (!supabase) {
        console.error("Supabase client is not initialized.");
        return { error: "Supabase client is not initialized." };
      }
      
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ SignIn: Login failed:", error);
        return { error };
      }

      if (data.user && data.session) {
        console.log("✅ SignIn: Login successful, updating state...");
        
        // Manually update state since auth state change listener isn't working
        setSession(data.session);
        setUser(data.user);
        
        // Fetch and set profile
        try {
          const profileData = await fetchProfile(data.user.id);
          setProfile(profileData);
          console.log("✅ SignIn: Profile set:", profileData);
        } catch (profileError) {
          console.error("❌ SignIn: Profile fetch error:", profileError);
        }
        
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
    }),
    [
      user,
      profile,
      session,
      isLoading,
      initialized,
      refreshProfile,
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
