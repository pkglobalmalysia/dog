"use client";

import React, { useEffect } from "react";

export function TestProvider({ children }: { children: React.ReactNode }) {
  console.log("🧪 TestProvider component rendering...");
  
  useEffect(() => {
    console.log("🎉 TestProvider useEffect is WORKING!");
  }, []);

  return <div>{children}</div>;
}
