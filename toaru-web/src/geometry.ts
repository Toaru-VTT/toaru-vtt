export interface Point {
  x: number;
  y: number;
}

export interface Shape {
  id: string;
  type: "line" | "rect" | "circle";
  points: Point[];
}

const genId = (): string => {
  return Math.random().toString(16).slice(2);
};

export const line = (start: Point, end: Point): Shape => {
  return {
    id: genId(),
    type: "line",
    points: [start, end],
  };
};

export const circle = (center: Point, radius: number): Shape => {
  return {
    id: genId(),
    type: "circle",
    points: [center, { x: Math.round(radius), y: center.y }],
  };
};

export const rect = (start: Point, end: Point): Shape => {
  // Canvas render requires that the points go from top left to bottom right
  const [reboxStart, reboxEnd] = [
    { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y) },
    { x: Math.max(start.x, end.x), y: Math.max(start.y, end.y) },
  ];
  return {
    id: genId(),
    type: "rect",
    points: [reboxStart, reboxEnd],
  };
};
