import Logo from "@/components/ui/logo"
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({ 
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({children} : Readonly<{
    children: React.ReactNode
}>) {
    return <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <div className="min-w-full fixed top-0 left-0 p-4 flex flex-col bg-zinc-950 z-20">
                <Logo/>
            </div>
            {children}
        </div>
}