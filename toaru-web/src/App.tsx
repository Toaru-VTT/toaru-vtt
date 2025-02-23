import Canvas from "./Canvas";

const App = () => {
  return (
    <>
      <h1>Hello world</h1>
      <Canvas
        shapes={[
          {
            id: "test1",
            type: "line",
            points: [
              { x: 100, y: 100 },
              { x: 400, y: 200 },
            ],
          },
          {
            id: "test2",
            type: "circle",
            points: [
              { x: 500, y: 600 },
              { x: 400, y: 200 },
            ],
          },
          {
            id: "test3",
            type: "rectangle",
            points: [
              { x: 200, y: 300 },
              { x: 700, y: 800 },
            ],
          },
        ]}
      />
    </>
  );
};

export default App;
