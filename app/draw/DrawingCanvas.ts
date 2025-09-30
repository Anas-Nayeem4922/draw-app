import { Shape } from "@/types/canvas.types";
import { Point } from "@/types/points.type";

export class DrawingCanvas {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[];
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedShape: string;
    private shapeDetails: string;
    private points: Point[];

    onShapeComplete?: (shape: string, details: string) => void;

    constructor(
        canvas: HTMLCanvasElement,
        shapes: Shape[],
        selectedShape: string
    ) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = shapes;
        this.clicked = false;
        this.selectedShape = selectedShape;
        this.shapeDetails = "";
        this.points = [];
        this.init();
        this.initMouseHandlers();
    }

    init() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.existingShapes.forEach((shape) => {
            const data = JSON.parse(shape.shapeDetails);
            switch (shape.shape) {
                case "line": {
                    const { startX, startY, endX, endY } = data;
                    this.ctx.beginPath();
                    this.ctx.moveTo(startX, startY);
                    this.ctx.lineTo(endX, endY);
                    this.ctx.stroke();
                    break;
                }
                case "rectangle": {
                    const { startX, startY, height, width } = data;
                    this.ctx.strokeRect(startX, startY, width, height);
                    break;
                }
                case "circle": {
                    const { startX, startY, radius } = data;
                    this.ctx.beginPath();
                    this.ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
                    this.ctx.stroke();
                    break;
                }
                case "arrow": {
                    const { startX, startY, endX, endY } = data;
                    this.ctx.beginPath();
                    this.ctx.moveTo(startX, startY);
                    this.ctx.lineTo(endX, endY);
                    this.ctx.stroke();
                    const arrowHeadSize = 15;
                    const angle = Math.atan2(endY - startY, endX - startX);
                    this.ctx.beginPath();
                    this.ctx.moveTo(endX, endY);
                    this.ctx.lineTo(
                        endX - Math.cos(angle - Math.PI / 6) * arrowHeadSize,
                        endY - Math.sin(angle - Math.PI / 6) * arrowHeadSize
                    );
                    this.ctx.stroke();
                    this.ctx.beginPath();
                    this.ctx.moveTo(endX, endY);
                    this.ctx.lineTo(
                        endX - Math.cos(angle + Math.PI / 6) * arrowHeadSize,
                        endY - Math.sin(angle + Math.PI / 6) * arrowHeadSize
                    );
                    this.ctx.stroke();
                    break;
                }
                case "pencil": {
                    const { points } = data;
                    this.ctx.beginPath();
                    points.forEach((point: Point, index: number) => {
                        if (index === 0) {
                            this.ctx.moveTo(point.x, point.y);
                        } else {
                            this.ctx.lineTo(point.x, point.y);
                        }
                    });
                    this.ctx.stroke();
                    break;
                }
            }
        });
    }

    mouseDownHandler = (e: MouseEvent) => {
        this.clicked = true;
        this.startX = e.offsetX;
        this.startY = e.offsetY;

        if (this.selectedShape === "pencil") {
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY);
        }
    };

    mouseMoveHandler = (e: MouseEvent) => {
        if (!this.clicked) return;
        if (this.selectedShape !== "pencil") {
            this.init();
        }
        const startX = this.startX,
            startY = this.startY;
        switch (this.selectedShape) {
            case "line": {
                this.ctx.beginPath();
                this.ctx.moveTo(startX, startY);
                this.ctx.lineTo(e.offsetX, e.offsetY);
                this.ctx.stroke();
                break;
            }
            case "rectangle": {
                this.ctx.strokeRect(
                    startX,
                    startY,
                    e.offsetX - startX,
                    e.offsetY - startY
                );
                break;
            }
            case "circle": {
                const radius = Math.sqrt(
                    Math.pow(e.offsetX - startX, 2) +
                        Math.pow(e.offsetY - startY, 2)
                );
                this.ctx.beginPath();
                this.ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
                this.ctx.stroke();
                break;
            }
            case "arrow": {
                const endX = e.offsetX;
                const endY = e.offsetY;
                this.ctx.beginPath();
                this.ctx.moveTo(startX, startY);
                this.ctx.lineTo(endX, endY);
                this.ctx.stroke();
                const arrowHeadSize = 15;
                const angle = Math.atan2(endY - startY, endX - startX);
                this.ctx.beginPath();
                this.ctx.moveTo(endX, endY);
                this.ctx.lineTo(
                    endX - Math.cos(angle - Math.PI / 6) * arrowHeadSize,
                    endY - Math.sin(angle - Math.PI / 6) * arrowHeadSize
                );
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.moveTo(endX, endY);
                this.ctx.lineTo(
                    endX - Math.cos(angle + Math.PI / 6) * arrowHeadSize,
                    endY - Math.sin(angle + Math.PI / 6) * arrowHeadSize
                );
                this.ctx.stroke();
                break;
            }
            case "pencil": {
                this.ctx.lineTo(e.offsetX, e.offsetY);
                this.points?.push({ x: e.offsetX, y: e.offsetY });
                this.ctx.strokeStyle = "#000000";
                this.ctx.lineWidth = 2;
                this.ctx.lineCap = "round";
                this.ctx.stroke();
                break;
            }
        }
    };

    mouseUpHandler = (e: MouseEvent) => {
        this.clicked = false;
        const startX = this.startX,
            startY = this.startY;
        switch (this.selectedShape) {
            case "line":
            case "arrow":
                const data = {
                    startX,
                    startY,
                    endX: e.offsetX,
                    endY: e.offsetY,
                };
                this.shapeDetails = JSON.stringify(data);
                break;
            case "rectangle": {
                const data = {
                    startX,
                    startY,
                    width: e.offsetX - startX,
                    height: e.offsetY - startY,
                };
                this.shapeDetails = JSON.stringify(data);
                break;
            }
            case "circle": {
                const data = {
                    startX,
                    startY,
                    radius: Math.sqrt(
                        Math.pow(e.offsetX - startX, 2) +
                            Math.pow(e.offsetY - startY, 2)
                    ),
                };
                this.shapeDetails = JSON.stringify(data);
                break;
            }
            case "pencil": {
                const data = {
                    points: this.points,
                };
                this.shapeDetails = JSON.stringify(data);
                this.points = [];
                break;
            }
        }
        if (this.onShapeComplete) {
            this.onShapeComplete(this.selectedShape, this.shapeDetails);
        }
    };

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    }
}
