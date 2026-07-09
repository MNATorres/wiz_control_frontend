import { useEffect, useState } from "react";
import * as api from "./api";
import type { Bulb, Preset, Scene } from "./types";
import { BulbCard } from "./components/BulbCard";
import "./App.css";

function BulbIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.45 1 1.16 1 1.94V16h5v-.16c0-.78.4-1.49 1-1.94A6 6 0 0 0 12 3Z" />
    </svg>
  );
}

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

  const handleForgotten = (mac: string) => {
    setBulbs((current) => current.filter((b) => b.mac !== mac));
  };

  return (
    <main>
      <header className="app-header">
        <div className="app-heading">
          <BulbIcon className="app-logo" />
          <div>
            <h1>WiZ Control</h1>
            <p className="app-subtitle">Smart lighting, right on your network</p>
          </div>
        </div>
        <button className="btn-primary" onClick={discover} disabled={discovering}>
          {discovering ? "Discovering…" : "Discover bulbs"}
        </button>
      </header>

      {error && <p className="app-error">{error}</p>}

      {bulbs.length > 0 && presets.length > 0 && (
        <section>
          <p className="section-label">Presets</p>
          <div className="preset-bar">
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
          </div>
        </section>
      )}

      {bulbs.length === 0 && !discovering && (
        <div className="empty-state">
          <BulbIcon className="empty-state-icon" />
          <p>No bulbs yet</p>
          <p className="empty-state-hint">Click "Discover bulbs" to scan your local network.</p>
        </div>
      )}

      <div className="bulb-grid">
        {bulbs.map((bulb) => (
          <BulbCard
            key={bulb.mac}
            bulb={bulb}
            scenes={scenes}
            onRenamed={handleRenamed}
            onForgotten={handleForgotten}
            refreshSignal={refreshSignal}
          />
        ))}
      </div>
    </main>
  );
}

export default App;
