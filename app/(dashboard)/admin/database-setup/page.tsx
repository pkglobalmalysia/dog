"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Database, AlertTriangle, CheckCircle } from "lucide-react";

export default function DatabaseSetupPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [setupResults, setSetupResults] = useState<any>(null);

  const handleSetupDatabase = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Setup failed');
      }
      
      setSetupResults(result);
      setMessage({ type: "success", text: result.message });
      
    } catch (error: any) {
      console.error("Setup error:", error);
      setMessage({ type: "error", text: error.message || "Setup failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleTestDatabase = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/test-db');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Test failed');
      }
      
      setSetupResults(result);
      setMessage({ type: "success", text: "Database test completed" });
      
    } catch (error: any) {
      console.error("Test error:", error);
      setMessage({ type: "error", text: error.message || "Test failed" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (profile?.role !== "admin") {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Admin access required to view this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Database Setup</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test Database</CardTitle>
            <CardDescription>
              Check which database tables exist and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleTestDatabase} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Database"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Setup Database</CardTitle>
            <CardDescription>
              Get SQL commands to create missing tables and columns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSetupDatabase} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Setup Database"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {message && (
        <Alert className={message.type === "error" ? "border-red-500" : "border-green-500"}>
          {message.type === "error" ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {setupResults && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(setupResults, null, 2)}
            </pre>
            
            {setupResults.results && setupResults.results.some((r: any) => r.sql) && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">SQL Commands to run in Supabase Dashboard:</h3>
                {setupResults.results.map((result: any, index: number) => (
                  result.sql && (
                    <div key={index} className="mb-4">
                      <h4 className="font-medium text-sm text-gray-600 mb-1">
                        {result.action}:
                      </h4>
                      <pre className="bg-black text-green-400 p-3 rounded text-xs overflow-auto">
                        {result.sql}
                      </pre>
                    </div>
                  )
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
