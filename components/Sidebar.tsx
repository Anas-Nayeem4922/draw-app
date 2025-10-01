"use client";
import React, { useState } from "react";
import {
  IconBrandTabler,
  IconSettings,
  IconLogin2,
  IconLogout2
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import Hero from "./Hero";
import { signOut, useSession } from "next-auth/react";

export function SidebarComponent() {

  const session = useSession();
  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-zinc-700 dark:bg-zinc-800 min-h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
              {session.status === "authenticated" && <div>
                    <SidebarLink onClick={() => signOut()} link={{
                        label: "Logout",
                        icon: <IconLogout2 className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200"/>,
                        href:"#"
                    }}/>
                </div>}
              {session.status === "unauthenticated" && <div>
                    <SidebarLink link={{
                        label: "Signin",
                        icon: <IconLogin2 className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200"/>,
                        href:"/signin"
                    }}/>
                </div>}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      <Hero/>
    </div>
  );
}
export const Logo = () => {
  return (
    <a
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <img src="../Logo.png" alt="" className="h-6 w-7 rounded-md" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold text-xl whitespace-pre text-black dark:text-white"
      >
        Canvasly
      </motion.span>
    </a>
  );
};
export const LogoIcon = () => {
  return (
    <a
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <img src="../Logo.png" className="h-6 w-7 rounded-md" />
    </a>
  );
};
