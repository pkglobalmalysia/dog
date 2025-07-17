import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

// Disable debug logs in production
if (process.env.NODE_ENV === 'production') {
  const originalLog = console.log;
  console.log = (...args: any[]) => {
    // Only log if it's an error or doesn't contain debug emojis
    const message = args[0];
    if (typeof message === 'string' && /^[🔍📊✅🔄📝👤📚🎓💾🚀🔥🔑🚨📭🧪]/.test(message)) {
      return; // Skip debug logs with emojis
    }
    originalLog(...args);
  };
}

export const metadata: Metadata = {
  title: "LMS - Learning Management System",
  description: "A comprehensive learning management system",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}