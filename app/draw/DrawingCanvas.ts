import { Shape } from "@/types/canvas.types";

export class DrawingCanvas {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[];
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedShape: string;
    private shapeDetails: string;

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
        this.init();
        this.initMouseHandlers();
    }

    init() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.existingShapes.forEach((shape) => {
            switch (shape.shape) {
                case "line": {
                    const data = JSON.parse(shape.shapeDetails);
                    const { startX, startY, endX, endY } = data;
                    this.ctx.beginPath();
                    this.ctx.moveTo(startX, startY);
                    this.ctx.lineTo(endX, endY);
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
    };

    mouseMoveHandler = (e: MouseEvent) => {
        if (!this.clicked) return;
        this.init();
        switch (this.selectedShape) {
            case "line": {
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(e.offsetX, e.offsetY);
                this.ctx.stroke();
            }
        }
    };

    mouseUpHandler = (e: MouseEvent) => {
        this.clicked = false;
        switch (this.selectedShape) {
            case "line": {
                const data = {
                    startX: this.startX,
                    startY: this.startY,
                    endX: e.offsetX,
                    endY: e.offsetY,
                };
                this.shapeDetails = JSON.stringify(data);
                if (this.onShapeComplete) {
                    this.onShapeComplete(this.selectedShape, this.shapeDetails);
                }
            }
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
