import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { LanguageProvider } from "@/contexts/language-context"
import { ThemeProvider } from "@/contexts/theme-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "Africa Freelancer",
  description: "Professional freelance platform connecting clients with talented freelancers",
  generator: "v0.app",
}

const geistSans = GeistSans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = GeistMono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
