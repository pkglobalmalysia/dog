import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { generateSEOMetadata, jsonLd } from "@/lib/seo"

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

export const metadata: Metadata = generateSEOMetadata({
  title: "Learn English in Malaysia | #1 English Speaking Course",
  description: "Master English speaking with iCSE Malaysia's proven coaching program. Join 10,000+ confident speakers. Professional English training with guaranteed results. Enroll today!",
  keywords: [
    "learn english",
    "learn english in malaysia", 
    "malaysia english course",
    "english speaking course",
    "iCSE malaysia",
    "i can speak english",
    "english speaking programs"
  ]
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-MY" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd.organization)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd.website)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd.course)
          }}
        />
        <link rel="canonical" href="https://icse-malaysia.com" />
        <meta name="google-site-verification" content="your-google-verification-code" />
        <meta name="msvalidate.01" content="your-bing-verification-code" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}