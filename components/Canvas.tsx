"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "sonner";
import { useSocket } from "@/hooks/SocketProvider";
import { Button } from "./ui/button";

interface Shape {
    shape: string,
    shapeDetails: string
}

export default function Canvas({roomId} : {roomId: string}) {
    const [shapes, setShapes] = useState<Shape[]>([]);
    const socket = useSocket();

    const fetchShapes = async () => {
        const response = await axios.get(`/api/shape?roomId=${roomId}`);
        if (response.data.shapes) {
            const mapped = response.data.shapes.map((s: any) => ({
                shape: s.name,
                shapeDetails: s.details,
            }));
            setShapes(mapped);
        } else {
            toast.error(response.data.message);
        }
    };

    const addShape = async (shape: string, shapeDetails: string) => {
        await axios.post("/api/shape", {
            shape,
            shapeDetails,
            roomId
        })
    }

    const sendMessage = () => {
        const message = JSON.stringify({
            type: "shape",
            payload: {
                roomId,
                shape: {
                    name: "circle",
                    details: "Circle detail"
                }
            }
        })
        if(socket) {
            socket.send(message);
        }
    }

    useEffect(() => {
        if (socket) {
            // send join message when connection opens
            socket.onopen = () => {
                const message = JSON.stringify({
                    type: "join",
                    payload: { roomId }
                });
                console.log(message);
                socket.send(message);
            };

            // listen for incoming messages
            socket.onmessage = (e) => {
                const { shape, shapeDetails } = JSON.parse(e.data);
                setShapes(s => [...s, { shape, shapeDetails }]);
                addShape(shape, shapeDetails);
            };
        }
    }, [socket]);

    useEffect(() => {
        fetchShapes();
    }, []);

    return (
        <div>
            {shapes?.map((s, id) => (
                <div key={id}>
                    <div className="text-xl text-cherry">{s.shape}</div>
                    <div className="text-turmeric">{s.shapeDetails}</div>
                </div>
            ))}
            <Button onClick={sendMessage}>Click me to send message</Button>
        </div>
    )
}
