import { reducer } from "./Whiteboard";
import { Point, Shape } from "./geometry";

const testLine = (id: string, points: Point[]): Shape => ({
  id,
  type: "line",
  points,
});

describe("reducer", () => {
  test("creates a shape", () => {
    const initialState: Shape[] = [];
    const action = {
      type: "create" as const,
      shape: testLine("1", [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ]),
    };
    const newState = reducer(initialState, action);

    expect(newState).toHaveLength(1);
    expect(newState[0]).toMatchObject(action.shape);
  });

  test("updates a shape's points", () => {
    const initialState: Shape[] = [
      testLine("1", [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ]),
    ];
    const updatedPoints = [
      { x: 5, y: 5 },
      { x: 15, y: 15 },
    ];
    const action = { type: "update" as const, id: "1", points: updatedPoints };
    const newState = reducer(initialState, action);

    expect(newState).toHaveLength(1);
    expect(newState[0].points).toEqual(updatedPoints);
  });

  test("deletes a shape", () => {
    const initialState: Shape[] = [
      testLine("1", [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ]),
    ];
    const action = { type: "delete" as const, id: "1" };
    const newState = reducer(initialState, action);

    expect(newState).toHaveLength(0);
  });

  test("ignores updates to non-existent shapes", () => {
    const initialState: Shape[] = [
      testLine("1", [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ]),
    ];
    const action = {
      type: "update" as const,
      id: "2",
      points: [
        { x: 5, y: 5 },
        { x: 15, y: 15 },
      ],
    };
    const newState = reducer(initialState, action);

    expect(newState).toEqual(initialState);
  });
});
