"use client"

import { LineSquiggle } from "lucide-react";
import { BackgroundRippleEffect } from "./ui/background-ripple-effect";
import ColourfulText from "./ui/colourful-text";
import { HoverBorderGradient } from "./ui/hover-border-gradient";
import { useRouter } from "next/navigation";

export default function Hero() {
    const router = useRouter();
    return <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-zinc-950 p-4">
      <BackgroundRippleEffect />
      <div className="w-full flex flex-col gap-10 items-center">
        <div>
            <h2 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-neutral-800 md:text-4xl lg:text-7xl dark:text-neutral-100">
            Sketch <ColourfulText text="Anything,"/> <br/> Laugh About Everything
            </h2>
            <p className="relative z-10 mx-auto mt-4 max-w-xl text-center text-neutral-800 dark:text-neutral-500">
            From genius ideas to stick figures gone wrong, every stroke adds to the story of your shared canvas.
            </p>
        </div>
        <div>
            <HoverBorderGradient containerClassName="rounded-full"
            as="button" onClick={() => router.push("/room")}
            className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2 cursor-pointer">
                <div>Start Drawing</div>
                <LineSquiggle/>
            </HoverBorderGradient>
        </div>
        
      </div>
    </div>
}


    