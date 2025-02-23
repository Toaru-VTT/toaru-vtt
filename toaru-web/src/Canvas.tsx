import { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
}

interface Shape {
  id: string;
  type: "line" | "rectangle" | "circle";
  points: Point[];
}

const drawShape = (shape: Shape, ctx: CanvasRenderingContext2D) => {
  const points = shape.points;
  switch (shape.type) {
    case "line": {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.stroke();
      break;
    }
    case "rectangle": {
      ctx.beginPath();
      ctx.rect(
        points[0].x,
        points[0].y,
        points[1].x - points[0].x,
        points[1].y - points[0].y
      );
      ctx.stroke();
      break;
    }
    case "circle": {
      ctx.beginPath();
      const radius = Math.round(
        Math.sqrt(
          Math.pow(points[1].y - points[0].y, 2) +
            Math.pow(points[1].x - points[0].x, 2)
        )
      );
      console.log(shape, radius);
      ctx.arc(points[0].x, points[0].y, radius, 0, 2 * Math.PI);
      ctx.stroke();
      break;
    }
    default:
      // TODO figure out proper error handling
      alert("unhandled shape type! " + shape.type);
  }
};

const Canvas = ({ shapes }: { shapes: Shape[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // To speed up rendering and prevent flickering, we do all the hard work on
    // an offscreen canvas first, and render in one step. ref:
    // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    const offscreenCtx = offscreenCanvas.getContext("2d")!;

    shapes.forEach((shape) => drawShape(shape, offscreenCtx));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offscreenCanvas, 0, 0);
  }, [shapes]);

  return <canvas width="2000" height="2000" ref={canvasRef} />;
};

export default Canvas;
