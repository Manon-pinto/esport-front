import { AuthProvider } from "@/context/AuthContext"
import type { Metadata } from "next"
import { Exo_2, Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

// Réservée aux moments de marque (hero, logo) — pas au texte courant
const exo2 = Exo_2({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "600", "700", "800", "900"],
})

// Police du corps de page : lisible et sobre
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "ESPORT PRO",
  description: "Plateforme de tournois esport",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${exo2.variable} ${inter.variable}`}>
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