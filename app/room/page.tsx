"use client"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { roomSchema } from "@/schema/room"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import axios from "axios"
import { toast } from "sonner"
import { useSocket } from "@/hooks/SocketProvider"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Plus, LogIn, Loader as Loader2 } from "lucide-react"
import Splash3dButton from "@/components/ui/3d-splash-button"
import Logo from "@/components/ui/logo"

export default function JoinRoom() {
    const socket = useSocket();
    const router = useRouter();

    const createForm = useForm<z.infer<typeof roomSchema>>({
        resolver: zodResolver(roomSchema),
        defaultValues: {
            roomDetail: ""
        }
    })

    const joinForm = useForm<z.infer<typeof roomSchema>>({
        resolver: zodResolver(roomSchema),
        defaultValues: {
            roomDetail: ""
        }
    })

    const onCreate = async (data: z.infer<typeof roomSchema>) => {
        const response = await axios.post("/api/room", data);
        const roomId = response.data.roomId;
        if(roomId) {
            const message = JSON.stringify({
                type: "create",
                payload: {
                    roomId
                }
            });
            if(socket) {
                socket.send(message);
                toast.success("Room created successfully, joining...");
                router.push(`/room/${roomId}`)
            }
        } else {
            toast.error(response.data.message);
        }
    }

    const onJoin = async(data: z.infer<typeof roomSchema>) => {
        const response = await axios.get(`/api/room?roomId=${data.roomDetail}`);
        if(response.data.message == true) {
            if(socket) {
                const message = JSON.stringify({
                    type: "join",
                    payload: {
                        roomId: data.roomDetail
                    }
                })
                socket.send(message);
                socket.onmessage = (e) => {
                    const wsData = JSON.parse(e.data);
                    if(wsData.roomId) {
                        toast.success("Joining...");
                        router.push(`/room/${data.roomDetail}`);
                    } else if(wsData.error) {
                        toast.error(wsData.error);
                    }
                }
            }
        } else {
            toast.error(response.data.message);
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 30,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
        }
    };

    const iconVariants = {
        initial: { scale: 1 }
    };

    return (
        <div className="h-screen w-full bg-zinc-950 flex items-center justify-center mt-24 p-4 md:p-6 lg:p-8 lg:mt-0">
            <motion.div
                className="w-full max-w-6xl"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    className="text-center mb-8 md:mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-100 mb-3">
                        Welcome to Rooms
                    </h1>
                    <p className="text-zinc-400 text-sm md:text-base">
                        Create a new room or join an existing one to get started
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    <motion.div
                        variants={cardVariants}
                        whileHover={{ y: -5 }}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 shadow-2xl"
                    >
                        <motion.div
                            className="flex items-center gap-3 mb-6"
                            variants={iconVariants}
                            initial="initial"
                            whileHover="hover"
                        >
                            <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                                <Plus className="w-6 h-6 text-zinc-100" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-semibold text-zinc-100">Start a Fresh Canvas</h2>
                                <p className="text-xs md:text-sm text-zinc-500">Name your room and drop the first doodle.</p>
                            </div>
                        </motion.div>

                        <Form {...createForm}>
                            <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-6">
                                <FormField
                                    control={createForm.control}
                                    name="roomDetail"
                                    render={({field}) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-zinc-300 font-medium text-sm">Room Name</FormLabel>
                                            <FormControl>
                                                <motion.div
                                                    whileFocus={{ scale: 1.01 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Input
                                                        placeholder="Enter a name for your room"
                                                        className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500 h-12 focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:border-zinc-600 transition-all"
                                                        {...field}
                                                    />
                                                </motion.div>
                                            </FormControl>
                                            <FormMessage className="text-red-400 text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Splash3dButton
                                        type="submit"
                                        disabled={createForm.formState.isSubmitting}
                                    >
                                        {createForm.formState.isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create & Jump In
                                            </>
                                        )}
                                    </Splash3dButton>
                                </motion.div>
                            </form>
                        </Form>
                    </motion.div>

                    <motion.div
                        variants={cardVariants}
                        whileHover={{ y: -5 }}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 shadow-2xl"
                    >
                        <motion.div
                            className="flex items-center gap-3 mb-6"
                            variants={iconVariants}
                            initial="initial"
                        >
                            <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                                <LogIn className="w-6 h-6 text-zinc-100" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-semibold text-zinc-100">Hop Into a Room</h2>
                                <p className="text-xs md:text-sm text-zinc-500">Got a Room ID? Jump straight into the chaos.</p>
                            </div>
                        </motion.div>

                        <Form {...joinForm}>
                            <form onSubmit={joinForm.handleSubmit(onJoin)} className="space-y-6">
                                <FormField
                                    control={joinForm.control}
                                    name="roomDetail"
                                    render={({field}) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-zinc-300 font-medium text-sm">Room ID</FormLabel>
                                            <FormControl>
                                                <motion.div
                                                    whileFocus={{ scale: 1.01 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Input
                                                        placeholder="Enter the room ID"
                                                        className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500 h-12 focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:border-zinc-600 transition-all"
                                                        {...field}
                                                    />
                                                </motion.div>
                                            </FormControl>
                                            <FormMessage className="text-red-400 text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Splash3dButton
                                        type="submit"
                                        disabled={joinForm.formState.isSubmitting}
                                    >
                                        {joinForm.formState.isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Joining...
                                            </>
                                        ) : (
                                            <>
                                                <LogIn className="w-4 h-4 mr-2" />
                                                Join the Fun
                                            </>
                                        )}
                                    </Splash3dButton>
                                </motion.div>
                            </form>
                        </Form>
                    </motion.div>
                </div>

                <motion.div
                    className="mt-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <p className="text-zinc-600 text-xs md:text-sm">
                        Your room sessions are secure and encrypted
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}
