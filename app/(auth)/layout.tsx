import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <main className="min-h-screen bg-[#121212]">{children}</main>
}
