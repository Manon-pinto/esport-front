import { AuthProvider } from "@/context/AuthContext"
import type { Metadata } from "next"
import { Orbitron } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
})

export const metadata: Metadata = {
  title: "ESPORT PRO",
  description: "Plateforme de tournois esport",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={orbitron.variable}>
      <body>
        <AuthProvider>
          <Header />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}