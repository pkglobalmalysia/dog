"use client";

import { useAuth } from "@/components/auth-provider";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthTestPage() {
  const { user, profile, session, isLoading, signIn, refreshProfile } = useAuth();
  const [email, setEmail] = useState("ceo@pkibs.com");
  const [password, setPassword] = useState("PKibs@@11");
  const [testResult, setTestResult] = useState("");
  const [directSession, setDirectSession] = useState<any>(null);

  const supabase = createClientComponentClient();

  const testDirectAuth = async () => {
    try {
      console.log("🔍 Testing direct Supabase auth...");
      setTestResult("Testing direct auth...");
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("❌ Direct auth error:", error);
        setTestResult(`Error: ${error.message}`);
      } else {
        console.log("📊 Direct session result:", session);
        setDirectSession(session);
        setTestResult(session ? "Session found!" : "No session");
      }
    } catch (error) {
      console.error("🚨 Direct auth catch:", error);
      setTestResult(`Catch error: ${error}`);
    }
  };

  const testDirectLogin = async () => {
    try {
      console.log("🔐 Attempting direct login...");
      setTestResult("Attempting direct login...");
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "ceo@pkibs.com",
        password: "PKibs@@11",
      });
      
      if (error) {
        console.error("❌ Direct login error:", error);
        setTestResult(`Login error: ${error.message}`);
      } else {
        console.log("✅ Direct login successful:", data);
        setTestResult("Direct login successful!");
        setDirectSession(data.session);
      }
    } catch (error) {
      console.error("🚨 Direct login catch:", error);
      setTestResult(`Direct login catch error: ${error}`);
    }
  };

  const handleTestLogin = async () => {
    setTestResult("Testing login...");
    try {
      const result = await signIn(email, password);
      if (result.error) {
        setTestResult(`Login failed: ${result.error.message}`);
      } else {
        setTestResult("Login successful!");
      }
    } catch (error) {
      setTestResult(`Login error: ${error}`);
    }
  };

  const handleRefreshProfile = async () => {
    setTestResult("Refreshing profile...");
    try {
      await refreshProfile();
      setTestResult("Profile refresh completed");
    } catch (error) {
      setTestResult(`Profile refresh error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Auth Debug Page</h1>
        
        {/* Auth State Display */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Auth State</h2>
          <div className="space-y-2 text-sm">
            <div>🔄 Loading: <span className="font-mono">{isLoading ? "true" : "false"}</span></div>
            <div>👤 User: <span className="font-mono">{user ? user.email : "null"}</span></div>
            <div>📋 Session: <span className="font-mono">{session ? "exists" : "null"}</span></div>
            <div>🏷️ Profile: <span className="font-mono">
              {profile ? `${profile.full_name} (${profile.role})` : "null"}
            </span></div>
          </div>
        </div>

        {/* Test Login */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Login</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <button
              onClick={handleTestLogin}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Login (via AuthProvider)
            </button>
            <button
              onClick={testDirectAuth}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 ml-4"
            >
              Test Direct Auth
            </button>
            <button
              onClick={testDirectLogin}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-4"
            >
              Test Direct Login
            </button>
            <button
              onClick={handleRefreshProfile}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-4"
            >
              Refresh Profile
            </button>
          </div>
          {testResult && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <strong>Result:</strong> {testResult}
            </div>
          )}
          
          {directSession && (
            <div className="mt-4 p-3 bg-green-100 rounded">
              <strong>Direct Session:</strong>
              <div className="text-sm mt-2">
                <div>Email: {directSession.user?.email}</div>
                <div>Expires: {new Date(directSession.expires_at * 1000).toLocaleString()}</div>
                <div>Access Token: {directSession.access_token ? "Present" : "Missing"}</div>
              </div>
            </div>
          )}
        </div>

        {/* Raw Data */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Raw Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify({
              user: user ? { id: user.id, email: user.email } : null,
              profile,
              session: session ? { user: { id: session.user.id, email: session.user.email } } : null,
              isLoading
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
