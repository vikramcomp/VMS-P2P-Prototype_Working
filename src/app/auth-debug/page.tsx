"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthTestPageProps {
  isTesting?: boolean;
}

export default function AuthTestPage({ isTesting = false }: AuthTestPageProps = {}) {
  const [email, setEmail] = useState("admin@vms.com");
  const [password, setPassword] = useState("admin123");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isTesting) {
      setEmail("test@example.com");
      setPassword("testpass");
      testLogin();
    }
  }, [isTesting]);

  const testLogin = async () => {
    setIsLoading(true);
    setResult("Testing...");

    try {
      console.log("🧪 Testing login API with:", { email, password: password ? "[HIDDEN]" : "empty" });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UserName: email,
          Password: password
        }),
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log("📡 Raw response:", responseText);

      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse JSON response:", e);
        parsedData = { error: "Failed to parse JSON", raw: responseText };
      }

      setResult(JSON.stringify({
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        data: parsedData
      }, null, 2));

    } catch (error) {
      console.error("❌ API test error:", error);
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8" data-testid="auth-test-page">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">VMS Auth API Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Form */}
          <Card>
            <CardHeader>
              <CardTitle>Test Login API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vms.com"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password:</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                />
              </div>
              
              <Button 
                onClick={testLogin}
                disabled={isLoading || !email || !password}
                className="w-full"
              >
                {isLoading ? "Testing..." : "Test API"}
              </Button>
              
              <div className="text-sm text-gray-600">
                <p><strong>API Endpoint:</strong></p>
                <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                  POST {process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>API Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96 whitespace-pre-wrap">
                {result || "Click 'Test API' to see results"}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}