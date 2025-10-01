"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2, LogIn } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { authSchema } from "@/schema/auth"
import axios from "axios"
import Splash3dButton from "@/components/ui/3d-splash-button"

export default function Signup() {
    const router = useRouter()
    const form = useForm<z.infer<typeof authSchema>>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            username: "",
            password: ""
        }
    })

    const onSubmit = async (data: z.infer<typeof authSchema>) => {
        const response = await axios.post("/api/signup", data);
        if(response.data.id) {
            toast.success(response.data.message);
            router.push("/");
        } else {
            toast.error(response.data.message);
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                stiffness: 100,
                damping: 10
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-950 from-60% to-zinc-800 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1]
                }}
                className="w-full max-w-md"
            >
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.2)] p-8">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                            delay: 0.3,
                            duration: 0.5,
                            ease: "easeOut"
                        }}
                        className="text-center space-y-2 mb-8"
                    >
                        <h1 className="text-3xl font-bold text-white">
                            Create Account
                        </h1>
                        <p className="text-slate-400">
                            Sign up to start your drawing
                        </p>
                    </motion.div>

                    <Form {...form}>
                        <motion.form 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            onSubmit={form.handleSubmit(onSubmit)} 
                            className="space-y-5"
                        >
                            <motion.div variants={itemVariants}>
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-zinc-300 font-semibold">Username</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="Enter your username" 
                                                    className="bg-zinc-800 
                                                    border border-zinc-700 
                                                    text-zinc-100 focus-visible:border-zinc-600 focus-visible:ring-zinc-600 placeholder-zinc-500 h-12 transition-all duration-200"
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage className="text-zinc-100" />
                                        </FormItem>
                                    )}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-zinc-300 font-semibold">Password</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="password" 
                                                    placeholder="Enter your password" 
                                                    className="bg-zinc-800 
                                                    border border-zinc-700 
                                                    text-zinc-100 focus-visible:border-zinc-600 focus-visible:ring-zinc-600 placeholder-zinc-500 h-12 transition-all duration-200"
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage className="text-zinc-100" />
                                        </FormItem>
                                    )}
                                />
                            </motion.div>

                            <motion.div
                                variants={itemVariants}
                                className="pt-2"
                            >
                                <Splash3dButton 
                                    disabled={form.formState.isSubmitting}
                                >
                                    {form.formState.isSubmitting ? (
                                        <motion.div 
                                            className="flex items-center justify-center gap-2"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <Loader2 className="h-4 w-4 animate-spin"/>
                                            <span>Signing up...</span>
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            className="flex items-center justify-center gap-2"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <LogIn className="h-4 w-4" />
                                            <span>Sign Up</span>
                                        </motion.div>
                                    )}
                                </Splash3dButton>
                            </motion.div>
                        </motion.form>
                    </Form>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="mt-6 text-center text-zinc-100"
                    >
                        <p>
                            <span className="mr-1">Already have an account?{' '}</span>
                            <Link 
                                href="/signin" 
                                className="text-lg text-radicchio/95 hover:text-radicchio hover:underline font-semibold hover:font-bold transition-all duration-100"
                            >
                                Sign in
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}