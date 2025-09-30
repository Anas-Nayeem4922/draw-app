"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "sonner";
import { useSocket } from "@/hooks/SocketProvider";
import { Button } from "./ui/button";

interface Shape {
  shape: string
  shapeDetails: string
}

export default function Canvas({ roomId }: { roomId: string }) {
  const [shapes, setShapes] = useState<Shape[]>([])
  const socket = useSocket()

  const fetchShapes = async () => {
    const response = await axios.get(`/api/shape?roomId=${roomId}`)
    if (response.data.shapes) {
      const mapped = response.data.shapes.map((s: any) => ({
        shape: s.name,
        shapeDetails: s.details,
      }))
      setShapes(mapped)
    } else {
      toast.error(response.data.message)
    }
  }

  const addShape = async (shape: string, shapeDetails: string) => {

    await axios.post("/api/shape", {
      shape,
      shapeDetails,
      roomId,
    })

    setShapes((s) => [...s, { shape, shapeDetails }])

    const message = JSON.stringify({
      type: "shape",
      payload: {
        roomId,
        shape: { name: shape, details: shapeDetails },
      },
    })
    if (socket) socket.send(message)
  }

  useEffect(() => {
    if (!socket) return

    const joinMsg = JSON.stringify({
      type: "join",
      payload: { roomId },
    })

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(joinMsg)
    } else {
      socket.onopen = () => socket.send(joinMsg)
    }

    socket.onmessage = (e) => {
      try {
        const { shape, shapeDetails } = JSON.parse(e.data)
        if (shape && shapeDetails) {
          setShapes((s) => [...s, { shape, shapeDetails }])
        }
      } catch (err) {
        console.error("Invalid WS message:", e.data)
      }
    }
  }, [socket, roomId])

  useEffect(() => {
    fetchShapes()
  }, [])

  return (
    <div>
      {shapes?.map((s, id) => (
        <div key={id}>
          <h1 className="font-bold">
            {id}: <span className="text-xl text-cherry">{s.shape}</span>
          </h1>
        </div>
      ))}
      <Button
        className="mt-10"
        onClick={() => addShape("circle", "Circle detail")}
      >
        Click me to add + sync shape
      </Button>
    </div>
  )
}
