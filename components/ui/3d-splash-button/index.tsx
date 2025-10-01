"use client";
import { cn } from "@/lib/utils";
import { AnimationOptions, useAnimate } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

export interface Splash3dButtonProps {
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
}

const Splash3dButton = ({
  className,
  children,
  onClick,
  disabled,
  type,
}: Splash3dButtonProps) => {
  const { isActive, handlePress } = usePress();
  const [scope, animate] = useAnimate();
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    // @ts-expect-error for safari
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContextRef.current = new AudioContext();

    fetch("../../click.mp3")
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) =>
        audioContextRef.current!.decodeAudioData(arrayBuffer),
      )
      .then((decodedAudio) => {
        audioBufferRef.current = decodedAudio;
      })
      .catch((err) => console.error("Error loading audio", err));
  }, []);

  function playAudio() {
    if (!audioContextRef.current || !audioBufferRef.current) return;

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;

    const gainNode = audioContextRef.current.createGain();
    gainNode.gain.value = 0.8;

    source.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    source.start();
  }

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    playAudio();
    handlePress();
    animation(e);
    if (onClick) onClick(e);
  }

  function createEle(x: string, y: string) {
    const ele = document.createElement("div");
    ele.className = cn("absolute rounded-full bg-white dark:bg-white");

    const size = random(15, 25);

    Object.assign(ele.style, {
      height: `${size}px`,
      width: `${size}px`,
      left: x,
      top: y,
      transform: "translate(-50%, -50%)",
    });

    return ele;
  }

  async function animation(e: React.MouseEvent<HTMLButtonElement>) {
    if (!scope.current) return;
    const t: AnimationOptions = { duration: 0.4, ease: "easeOut" };
    const wrapper = scope.current.querySelector("#splash-wrapper");

    const numElements = Math.floor(Math.random() * 5) + 5; // 5 to 10
    const elements: HTMLElement[] = [];

    const bounding = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX ? `${e.clientX - bounding.left}px` : "50%";
    const clickY = e.clientY ? `${e.clientY - bounding.top}px` : "50%";

    for (let i = 0; i < numElements; i++) {
      const ele = createEle(clickX, clickY);
      wrapper.appendChild(ele);
      elements.push(ele);
    }

    await Promise.all(
      elements.map((e) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50 + 50; // 50 to 100

        const xOffset = Math.cos(angle) * distance;
        const yOffset = Math.sin(angle) * distance;

        return animate(e, { x: xOffset, y: yOffset, scale: 0 }, t);
      }),
    );

    elements.forEach((ele) => ele.remove());
  }

  return (
    <button
      type={type}
      ref={scope}
      disabled={disabled}
      className={cn(
        "group relative cursor-pointer w-full",
        "disabled:pointer-events-none",
      )}
      onClick={handleClick}
      aria-label="3D Splash Button"
    >
      <span id="splash-wrapper" className="absolute inset-0" />
      <span
        className={cn(
          "absolute inset-0 translate-y-[4px] rounded-md",
          "bg-d-fg/40",
        )}
      ></span>
      <span
        className={cn(
          "relative flex items-center justify-center rounded-md px-3 py-2.5 inset-shadow-sm will-change-transform select-none",
          "bg-gray-100 text-sm font-bold text-black/80 dark:bg-white dark:text-zinc-950",
          "group-hover:translate-y-[-2px] group-hover:[transition-duration:250ms]",
          "[transition:translate_600ms_ease-out]",
          isActive && "translate-y-[4px]! [transition-duration:34ms]!",
          className,
        )}
      >
        {children}
      </span>
    </button>
  );
};

export default Splash3dButton;

const usePress = (duration = 34, debounceTime = 34) => {
  const [isActive, setIsActive] = useState(false);
  const lastPressTime = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const handlePress = useCallback(() => {
    const now = Date.now();
    if (now - lastPressTime.current < debounceTime) return;

    lastPressTime.current = now;
    setIsActive(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsActive(false);
    }, duration);
  }, [duration, debounceTime]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    isActive,
    handlePress,
  };
};

function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
