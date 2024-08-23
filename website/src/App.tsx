import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [session, setSession] = useState("");

  useEffect(() => {
    fetch("http://localhost:8081/session", { method: "POST" })
      .then((response) => response.json())
      .then((data) => {
        setCount(data.state.count);
        setSession(data.session);
      });
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }
    fetch(`http://localhost:8081/session/${session}`)
      .then((response) => response.json())
      .then((data) => {
        setCount(data.state.count ?? 0);
      });
  }, [session]);

  const increment = () => {
    fetch(`http://localhost:8081/session/${session}`, {
      method: "POST",
      body: JSON.stringify({ count: count + 1 }),
    })
      .then((response) => response.json())
      .then((data) => setCount(data.state.count));
  };

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={increment}>count is {count}</button>

        <p>
          Using Session:{" "}
          <input
            type="text"
            defaultValue={session}
            onChange={(evt) => setSession(evt.target.value)}
          />
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
