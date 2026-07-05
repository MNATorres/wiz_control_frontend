import { useEffect, useRef, useState } from "react";
import type { Bulb, PilotState, Scene } from "../types";
import * as api from "../api";
import "./BulbCard.css";

type Mode = "color" | "white" | "scenes";

function rgbToHex(r = 255, g = 255, b = 255): string {
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const value = parseInt(hex.slice(1), 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function useDebounced<Args extends unknown[]>(fn: (...args: Args) => void, delayMs: number) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  return (...args: Args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delayMs);
  };
}

interface BulbCardProps {
  bulb: Bulb;
  scenes: Scene[];
  onRenamed: (bulb: Bulb) => void;
  refreshSignal: number;
}

export function BulbCard({ bulb, scenes, onRenamed, refreshSignal }: BulbCardProps) {
  const [pilot, setPilot] = useState<PilotState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("color");
  const [name, setName] = useState(bulb.name ?? "");

  const refreshPilot = () => {
    api
      .getPilot(bulb.mac)
      .then((result) => {
        setPilot(result);
        setError(null);
      })
      .catch((err: Error) => setError(err.message));
  };

  useEffect(() => {
    refreshPilot();
    const interval = setInterval(refreshPilot, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulb.mac, refreshSignal]);

  const debouncedDimming = useDebounced((value: number) => {
    api.setDimming(bulb.mac, value).catch((err: Error) => setError(err.message));
  }, 300);

  const debouncedColor = useDebounced((hex: string) => {
    api.setColor(bulb.mac, hexToRgb(hex)).catch((err: Error) => setError(err.message));
  }, 300);

  const debouncedTemp = useDebounced((temp: number) => {
    api.setColorTemp(bulb.mac, temp).catch((err: Error) => setError(err.message));
  }, 300);

  const toggle = () => {
    const next = !pilot?.state;
    setPilot((p) => (p ? { ...p, state: next } : p));
    api
      .setState(bulb.mac, next)
      .catch((err: Error) => setError(err.message))
      .then(refreshPilot);
  };

  const selectScene = (sceneId: number) => {
    setPilot((p) => (p ? { ...p, sceneId } : p));
    api
      .setScene(bulb.mac, sceneId, pilot?.speed)
      .catch((err: Error) => setError(err.message))
      .then(refreshPilot);
  };

  const commitName = () => {
    if (name === (bulb.name ?? "")) return;
    api.renameBulb(bulb.mac, name).then(onRenamed).catch((err: Error) => setError(err.message));
  };

  return (
    <div className={`bulb-card${pilot ? "" : " offline"}`}>
      <div className="bulb-card-header">
        <input
          className="bulb-name-input"
          value={name}
          placeholder={bulb.ip}
          onChange={(e) => setName(e.target.value)}
          onBlur={commitName}
        />
        <input type="checkbox" checked={pilot?.state ?? false} onChange={toggle} />
      </div>

      {error && <div className="bulb-error">{error}</div>}

      <div className="bulb-field">
        <label>Brightness</label>
        <input
          type="range"
          min={10}
          max={100}
          value={pilot?.dimming ?? 100}
          onChange={(e) => {
            const value = Number(e.target.value);
            setPilot((p) => (p ? { ...p, dimming: value } : p));
            debouncedDimming(value);
          }}
        />
      </div>

      <div className="bulb-tabs">
        <button className={mode === "color" ? "active" : ""} onClick={() => setMode("color")}>
          Color
        </button>
        <button className={mode === "white" ? "active" : ""} onClick={() => setMode("white")}>
          White
        </button>
        <button className={mode === "scenes" ? "active" : ""} onClick={() => setMode("scenes")}>
          Scenes
        </button>
      </div>

      {mode === "color" && (
        <div className="bulb-field">
          <label>Color</label>
          <input
            type="color"
            value={rgbToHex(pilot?.r, pilot?.g, pilot?.b)}
            onChange={(e) => debouncedColor(e.target.value)}
          />
        </div>
      )}

      {mode === "white" && (
        <div className="bulb-field">
          <label>Color temperature ({pilot?.temp ?? 2700}K)</label>
          <input
            type="range"
            min={2200}
            max={6500}
            step={100}
            value={pilot?.temp ?? 2700}
            onChange={(e) => {
              const temp = Number(e.target.value);
              setPilot((p) => (p ? { ...p, temp } : p));
              debouncedTemp(temp);
            }}
          />
        </div>
      )}

      {mode === "scenes" && (
        <div className="scene-grid">
          {scenes.map((scene) => (
            <button
              key={scene.id}
              className={pilot?.sceneId === scene.id ? "active" : ""}
              onClick={() => selectScene(scene.id)}
            >
              {scene.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
