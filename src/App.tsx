import { useEffect, useState } from "react";
import "./App.css";

type HealthStatus = "checking" | "ok" | "error";

function App() {
  const [status, setStatus] = useState<HealthStatus>("checking");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setStatus(data.status === "ok" ? "ok" : "error"))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <main>
      <h1>WiZ Control</h1>
      <p>Backend status: {status}</p>
    </main>
  );
}

export default App;
