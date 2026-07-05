import { useEffect, useState } from "react";
import * as api from "./api";
import type { Bulb, Scene } from "./types";
import { BulbCard } from "./components/BulbCard";
import "./App.css";

function App() {
  const [bulbs, setBulbs] = useState<Bulb[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [discovering, setDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listBulbs().then(setBulbs).catch((err: Error) => setError(err.message));
    api.getScenes().then(setScenes).catch((err: Error) => setError(err.message));
  }, []);

  const discover = () => {
    setDiscovering(true);
    setError(null);
    api
      .discoverBulbs()
      .then(setBulbs)
      .catch((err: Error) => setError(err.message))
      .finally(() => setDiscovering(false));
  };

  const handleRenamed = (updated: Bulb) => {
    setBulbs((current) => current.map((b) => (b.mac === updated.mac ? updated : b)));
  };

  return (
    <main>
      <header className="app-header">
        <h1>WiZ Control</h1>
        <button onClick={discover} disabled={discovering}>
          {discovering ? "Discovering…" : "Discover bulbs"}
        </button>
      </header>

      {error && <p className="app-error">{error}</p>}
      {bulbs.length === 0 && !discovering && <p>No bulbs yet — click "Discover bulbs".</p>}

      <div className="bulb-grid">
        {bulbs.map((bulb) => (
          <BulbCard key={bulb.mac} bulb={bulb} scenes={scenes} onRenamed={handleRenamed} />
        ))}
      </div>
    </main>
  );
}

export default App;
