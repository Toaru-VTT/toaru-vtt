import { useReducer, useState } from "react";
import Canvas from "./Canvas";
import { Point, Shape, line } from "./geometry";

type Tool = "pen" | "eraser" | "select";

type Action =
  | { type: "create"; shape: Shape }
  | { type: "update"; id: string; points: Point[] }
  | { type: "delete"; id: string };

export const reducer = (shapes: Shape[], action: Action): Shape[] => {
  switch (action.type) {
    case "create":
      return [...shapes, action.shape];
    case "update":
      return shapes.map((s) =>
        s.id === action.id ? { ...s, points: action.points } : s
      );
    case "delete":
      return shapes.filter((s) => s.id !== action.id);
    default:
      return shapes;
  }
};

const handlePointerDown = (
  point: Point,
  tool: Tool,
  dispatch: React.Dispatch<Action>
) => {
  if (tool === "pen") {
    dispatch({ type: "create", shape: line(point, point) });
  }
};

const handlePointerMove = (
  point: Point,
  tool: Tool,
  shapes: Shape[],
  dispatch: React.Dispatch<Action>
) => {
  if (tool !== "pen") return;
  // TODO when we get to concurrent editing, the last shape may change over the
  // course of a draw. How can we model tracking the shape ID as part of
  // drawing? Maybe switch from `useState<bool>` to `useState<string | null>` in
  // Canvas?
  const lastShape = shapes[shapes.length - 1];
  if (lastShape?.type === "line") {
    dispatch({
      type: "update",
      id: lastShape.id,
      points: [lastShape.points[0], point],
    });
  }
};

const Whiteboard = () => {
  const [shapes, dispatch] = useReducer(reducer, []);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tool, setTool] = useState<Tool>("pen");

  return (
    <Canvas
      shapes={shapes}
      onPointerDown={(point: Point) => handlePointerDown(point, tool, dispatch)}
      onPointerMove={(point: Point) =>
        handlePointerMove(point, tool, shapes, dispatch)
      }
    />
  );
};

export default Whiteboard;
