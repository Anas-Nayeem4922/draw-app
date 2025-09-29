"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { roomSchema } from "@/schema/room"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import axios from "axios"
import { toast } from "sonner"
import { useSocket } from "@/hooks/SocketProvider"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

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

    return <div className="bg-gradient-to-br from-pearl to-butter h-screen w-full flex justify-around items-center">
        {/* Create room */}
        <div className="w-[40%] h-[40%] bg-white rounded-2xl drop-shadow-lg flex flex-col p-6">
            <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreate)}>
                    <FormField control={createForm.control} name="roomDetail"
                    render={({field}) => {
                        return <FormItem className="space-y-2">
                            <FormLabel className="text-slate-900 font-semibold">Enter your room name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter room name"
                                        className="bg-white border-cherry focus-visible:border-cherry focus-visible:ring-cherry/50 text-slate-700 placeholder-gray-500 h-11 transition-all duration-200"
                                        {...field} />
                                </FormControl>
                                <FormMessage className="text-cherry" />
                            </FormItem>
                        }}
                    />
                    <Button 
                    className="w-full bg-cherry/95 hover:bg-cherry text-white font-medium h-11 transition-all duration-300 shadow-sm cursor-pointer mt-6" type="submit" disabled={createForm.formState.isSubmitting}>Create your room</Button>
                </form>
                
            </Form>
        </div>
        {/* Join Room */}
        <div className="w-[40%] h-[40%] bg-white rounded-2xl drop-shadow-lg flex flex-col p-6">
            <Form {...joinForm}>
                <form onSubmit={joinForm.handleSubmit(onJoin)}>
                    <FormField control={joinForm.control} name="roomDetail"
                    render={({field}) => {
                        return <FormItem className="space-y-2">
                            <FormLabel className="text-slate-900 font-semibold">Enter room id</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter room id"
                                        className="bg-white border-cherry focus-visible:border-cherry focus-visible:ring-cherry/50 text-slate-700 placeholder-gray-500 h-11 transition-all duration-200"
                                        {...field} />
                                </FormControl>
                                <FormMessage className="text-cherry" />
                            </FormItem>
                        }}
                    />
                    <Button 
                    className="w-full bg-cherry/95 hover:bg-cherry text-white font-medium h-11 transition-all duration-300 shadow-sm cursor-pointer mt-6" type="submit" disabled={joinForm.formState.isSubmitting}>Join room</Button>
                </form>
                
            </Form>
        </div>
    </div>
}