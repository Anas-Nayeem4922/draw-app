"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useSocket } from "@/hooks/SocketProvider";
import { DrawingCanvas } from "@/app/draw/DrawingCanvas";
import { Shape } from "@/types/canvas.types";
import {
    Check,
    Circle,
    Copy,
    Menu,
    Minus,
    MousePointer,
    MoveUpRight,
    Pencil,
    RectangleHorizontal,
} from "lucide-react";
import { FloatingDock } from "./ui/floating-dock";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

export default function Canvas({ roomId }: { roomId: string }) {
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [selectedShape, setSelectedShape] = useState<string>("select");
    const [copied, setCopied] = useState(false);
    const [strokeColour, setStrokeColour] = useState<string>("#ffffff");
    const [strokeWidth, setStrokeWidth] = useState<number>(2);

    const canvasRef = useRef<HTMLCanvasElement>(null);
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
        if (!shapeDetails) return;

        await axios.post("/api/shape", {
            shape,
            shapeDetails,
            roomId,
        });

        setShapes((s) => [...s, { shape, shapeDetails }]);

        const message = JSON.stringify({
            type: "shape",
            payload: {
                roomId,
                shape: { name: shape, details: shapeDetails },
            },
        });
        if (socket) socket.send(message);
    };

    const deleteShape = async () => {
        const response = await axios.delete(`/api/shape?roomId=${roomId}`);
        if (response.data.message != "Success")
            toast.error(response.data.message);
        fetchShapes();
    };

    useEffect(() => {
        if (canvasRef.current) {
            const c = new DrawingCanvas(
                canvasRef.current,
                shapes,
                selectedShape,
                strokeColour,
                strokeWidth
            );

            c.onShapeComplete = (shape, details) => {
                addShape(shape, details);
            };

            return () => c.destroy();
        }
    }, [selectedShape, strokeColour, strokeWidth, shapes]);

    useEffect(() => {
        if (!socket) return;

        const joinMsg = JSON.stringify({
            type: "join",
            payload: { roomId },
        });

        if (socket.readyState === WebSocket.OPEN) {
            socket.send(joinMsg);
        } else {
            socket.onopen = () => socket.send(joinMsg);
        }

        socket.onmessage = (e) => {
            try {
                const { shape, shapeDetails } = JSON.parse(e.data);
                if (shape && shapeDetails) {
                    setShapes((s) => [...s, { shape, shapeDetails }]);
                }
            } catch (err) {
                console.error("Invalid WS message:", e.data);
            }
        };
    }, [socket, roomId]);

    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.height = window.innerHeight;
            canvasRef.current.width = window.innerWidth;
        }
        fetchShapes();
    }, []);

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
        { icon: <Pencil />, title: "pencil" },
    ];

    const defaultColors = [
        { tailwind: "bg-amber-500", hexCode: "#fe9a00" },
        { tailwind: "bg-rose-400", hexCode: "#ff637e" },
        { tailwind: "bg-lime-500", hexCode: "#7ccf00" },
        { tailwind: "bg-sky-500", hexCode: "#00a6f4" },
        { tailwind: "bg-yellow-950", hexCode: "#432004" },
    ];

    const defaultWidths = [2, 4, 6, 8, 10, 12, 16, 20];

    return (
        <div>
            <div className='flex justify-center fixed bottom-0 left-0 right-0 pb-4'>
                <FloatingDock
                    onClick={setSelectedShape}
                    items={tools}
                    selected={selectedShape}
                />
            </div>
            <div className='flex fixed top-24 mt-14 left-2 md:mt-0 md:left-6'>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        asChild
                        className='cursor-pointer mb-3'
                    >
                        <div className='bg-white text-black rounded-md p-2'>
                            <Menu className='h-4 w-4' />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='w-56 p-4 ml-2'>
                        <div>
                            <h2 className='text-lg font-semibold text-white mb-4'>
                                Stroke
                                <Separator className='mt-1' />
                            </h2>

                            <div className='grid grid-cols-4 gap-3 mb-4'>
                                {defaultColors.map((color, idx) => (
                                    <div
                                        onClick={() =>
                                            setStrokeColour(color.hexCode)
                                        }
                                        key={idx}
                                        className={`${color.tailwind}  h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-sm cursor-pointer`}
                                    ></div>
                                ))}
                            </div>
                            <div className='flex items-center gap-2'>
                                <input
                                    type='color'
                                    value={strokeColour}
                                    onChange={(e) =>
                                        setStrokeColour(e.target.value)
                                    }
                                    className='w-[50%] h-9 appearance-none cursor-pointer rounded-lg border-0 p-0
                                    [::-webkit-color-swatch-wrapper]:p-0
                                    [::-webkit-color-swatch]:rounded-lg [::-webkit-color-swatch]:border-2
                                    [::-webkit-color-swatch]:border-white/10 [::-webkit-color-swatch]:shadow-inner'
                                />
                                <span className='text-muted-foreground text-xs font-semibold'>
                                    Choose a custom colour
                                </span>
                            </div>
                        </div>
                        <Separator className='my-4' />
                        <div>
                            <h2 className='text-lg font-semibold text-white mb-4'>
                                Stroke Width
                            </h2>
                            <Select
                                value={strokeWidth.toString()}
                                onValueChange={(v) => setStrokeWidth(Number(v))}
                            >
                                <SelectTrigger className='cursor-pointer'>
                                    <SelectValue
                                        placeholder={
                                            strokeWidth
                                                ? `${strokeWidth}`
                                                : "Select a stroke width"
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {defaultWidths.map((w, idx) => (
                                        <SelectItem
                                            key={idx}
                                            value={w.toString()}
                                            className='cursor-pointer'
                                        >
                                            {w}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className='bg-zinc-900 mt-18 md:mt-0 fixed top-2 right-4 p-4 backdrop-blur-sm rounded-lg shadow-lg flex items-center z-50 gap-2 max-h-16'>
                <span className='text-sm font-medium text-zinc-100'>
                    Room ID:
                </span>
                <div className='max-w-[200px] sm:max-w-[300px] md:max-w-[400px] truncate'>
                    <code className='bg-zinc-950 px-2 py-1 rounded text-sm truncate'>
                        {roomId}
                    </code>
                </div>
                <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    onClick={copyRoomId}
                    title='Copy room ID'
                >
                    {copied ? (
                        <Check className='h-4 w-4 text-green-500' />
                    ) : (
                        <Copy className='h-4 w-4' />
                    )}
                </Button>
                <Button
                    className='cursor-pointer'
                    onClick={() => deleteShape()}
                >
                    Undo
                </Button>
            </div>
            <canvas ref={canvasRef} className='bg-zinc-900' />
        </div>
    );
}
