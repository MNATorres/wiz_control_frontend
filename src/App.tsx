import { useEffect, useState } from "react";
import * as api from "./api";
import type { Bulb, Preset, Scene } from "./types";
import { BulbCard } from "./components/BulbCard";
import "./App.css";

function App() {
  const [bulbs, setBulbs] = useState<Bulb[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [discovering, setDiscovering] = useState(false);
  const [applyingPreset, setApplyingPreset] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshSignal, setRefreshSignal] = useState(0);

  useEffect(() => {
    api.listBulbs().then(setBulbs).catch((err: Error) => setError(err.message));
    api.getScenes().then(setScenes).catch((err: Error) => setError(err.message));
    api.getPresets().then(setPresets).catch((err: Error) => setError(err.message));
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

  const applyPreset = (key: string) => {
    setApplyingPreset(key);
    setError(null);
    api
      .applyPreset(key)
      .catch((err: Error) => setError(err.message))
      .finally(() => {
        setApplyingPreset(null);
        setRefreshSignal((n) => n + 1);
      });
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

      {bulbs.length > 0 && presets.length > 0 && (
        <section className="preset-bar">
          {presets.map((preset) => (
            <button
              key={preset.key}
              className="preset-button"
              disabled={applyingPreset !== null}
              onClick={() => applyPreset(preset.key)}
            >
              <span className="preset-swatches">
                {preset.colors.map((c, i) => (
                  <span
                    key={i}
                    className="preset-swatch"
                    style={{ background: `rgb(${c.r}, ${c.g}, ${c.b})` }}
                  />
                ))}
              </span>
              {applyingPreset === preset.key ? "Applying…" : preset.name}
            </button>
          ))}
        </section>
      )}

      {bulbs.length === 0 && !discovering && <p>No bulbs yet — click "Discover bulbs".</p>}

      <div className="bulb-grid">
        {bulbs.map((bulb) => (
          <BulbCard
            key={bulb.mac}
            bulb={bulb}
            scenes={scenes}
            onRenamed={handleRenamed}
            refreshSignal={refreshSignal}
          />
        ))}
      </div>
    </main>
  );
}

export default App;
