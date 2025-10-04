"use client"

import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { toast } from "sonner";
import { useSocket } from "@/hooks/SocketProvider";
import { DrawingCanvas } from "@/app/draw/DrawingCanvas";
import { Shape } from "@/types/canvas.types";
import { Check, Circle, Copy, Minus, MousePointer, MoveUpRight, Pencil, RectangleHorizontal } from "lucide-react";
import { FloatingDock } from "./ui/floating-dock";
import { Button } from "./ui/button";

export default function Canvas({ roomId }: { roomId: string }) {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShape, setSelectedShape] = useState<string>("select");
  const [copied, setCopied] = useState(false);

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

  const deleteShape = async() => {
    const response = await axios.delete(`/api/shape?roomId=${roomId}`)
    if(response.data.message != "Success") 
      toast.error(response.data.message);
    fetchShapes();
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
    if (canvasRef.current) {
      canvasRef.current.height = window.innerHeight;
      canvasRef.current.width = window.innerWidth;
    }
    fetchShapes()
  }, [])

  const copyRoomId = async () => {
        await navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

  const tools = [
    { icon: <MousePointer />, title: "select" },
    { icon: <Circle />, title: "circle" },
    { icon: <Minus />, title: "line" },
    { icon: <RectangleHorizontal />, title: "rectangle" },
    { icon: <MoveUpRight />, title: "arrow" },
    { icon: <Pencil />, title: "pencil" }
  ];

  return (
    <div>
      <div className="flex justify-center fixed bottom-0 left-0 right-0 pb-4">
        <FloatingDock 
          onClick={setSelectedShape} 
          items={tools} 
          selected={selectedShape}
        />
      </div>
      <div className="bg-zinc-900 mt-18 md:mt-0 fixed top-2 right-4 p-4 backdrop-blur-sm rounded-lg shadow-lg flex items-center z-50 gap-2 max-h-16">
      <span className="text-sm font-medium text-zinc-100">Room ID:</span>
      <div className="max-w-[200px] sm:max-w-[300px] md:max-w-[400px] truncate">
        <code className="bg-zinc-950 px-2 py-1 rounded text-sm truncate">
          {roomId}
        </code>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyRoomId} title="Copy room ID">
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
      <Button className="cursor-pointer" onClick={() => deleteShape()}>Undo</Button>
    </div>

      <canvas ref={canvasRef} className="bg-zinc-900" />
    </div>
  )
}
