"use client"

import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { toast } from "sonner";
import { useSocket } from "@/hooks/SocketProvider";
import { DrawingCanvas } from "@/app/draw/DrawingCanvas";
import { Shape } from "@/types/canvas.types";

export default function Canvas({ roomId }: { roomId: string }) {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShape, setSelectedShape] = useState<string>("line");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socket = useSocket();

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
    if (!shapeDetails) return;

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
    if (canvasRef.current) {
      const c = new DrawingCanvas(canvasRef.current, shapes, selectedShape);

      c.onShapeComplete = (shape, details) => {
        addShape(shape, details);
      };

      return () => c.destroy();
    }
  }, [selectedShape, shapes])

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
    if(canvasRef.current) {
      canvasRef.current.height = window.innerHeight;
      canvasRef.current.width = window.innerWidth;
    }
    fetchShapes()
  }, [])

  return (
    <div>
      <canvas ref={canvasRef} className="bg-red-300"/>
    </div>
  )
}
