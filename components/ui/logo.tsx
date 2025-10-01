"use client"

import { useRouter } from "next/navigation"

export default function Logo() {
    const router = useRouter();
    return <div onClick={() => router.push("/")} className="flex items-center gap-4 w-full cursor-pointer">
        <img src="../../Logo.png" className="h-12 w-16 rounded-md"/>
        <div className="text-white font-bold text-2xl">Canvasly</div>
    </div>
}