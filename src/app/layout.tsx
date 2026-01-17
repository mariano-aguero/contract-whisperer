import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Contract Whisperer - AI-Powered Smart Contract Analysis",
  description:
    "Analyze Ethereum and Base smart contracts using artificial intelligence. Identify risks, explain functions, and review transactions.",
  authors: [{ name: "Mariano Aguero", url: "mailto:mariano.aguero@gmail.com" }],
  openGraph: {
    title: "Contract Whisperer - AI-Powered Smart Contract Analysis",
    description:
      "Analyze Ethereum and Base smart contracts using artificial intelligence. Identify risks, explain functions, and review transactions.",
    url: "https://contract-whisperer.vercel.app",
    siteName: "Contract Whisperer",
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contract Whisperer - AI-Powered Smart Contract Analysis",
    description:
      "Analyze Ethereum and Base smart contracts using artificial intelligence. Identify risks, explain functions, and review transactions.",
    images: ["/og.svg"],
    creator: "@marianoaguero",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
