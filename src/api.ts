import type { Bulb, PilotState, Preset, Scene } from "./types";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function postJson(url: string, body: unknown): Promise<unknown> {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => json(r));
}

export function listBulbs(): Promise<Bulb[]> {
  return fetch("/api/bulbs").then((r) => json<Bulb[]>(r));
}

export function discoverBulbs(): Promise<Bulb[]> {
  return fetch("/api/bulbs/discover", { method: "POST" }).then((r) => json<Bulb[]>(r));
}

export function getScenes(): Promise<Scene[]> {
  return fetch("/api/scenes").then((r) => json<Scene[]>(r));
}

export async function getPilot(mac: string): Promise<PilotState> {
  const raw = await fetch(`/api/bulbs/${mac}/pilot`).then((r) => json<{ result: PilotState }>(r));
  return raw.result;
}

export function setState(mac: string, on: boolean): Promise<unknown> {
  return postJson(`/api/bulbs/${mac}/state`, { on });
}

export function setDimming(mac: string, value: number): Promise<unknown> {
  return postJson(`/api/bulbs/${mac}/dimming`, { value });
}

export function setColor(mac: string, rgb: { r: number; g: number; b: number }): Promise<unknown> {
  return postJson(`/api/bulbs/${mac}/color`, rgb);
}

export function setColorTemp(mac: string, temp: number): Promise<unknown> {
  return postJson(`/api/bulbs/${mac}/color`, { temp });
}

export function setScene(mac: string, sceneId: number, speed?: number): Promise<unknown> {
  return postJson(`/api/bulbs/${mac}/scene`, { sceneId, speed });
}

export function getPresets(): Promise<Preset[]> {
  return fetch("/api/presets").then((r) => json<Preset[]>(r));
}

export function applyPreset(key: string): Promise<unknown> {
  return postJson(`/api/presets/${key}/apply`, {});
}

export function renameBulb(mac: string, name: string): Promise<Bulb> {
  return fetch(`/api/bulbs/${mac}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  }).then((r) => json<Bulb>(r));
}

export async function forgetBulb(mac: string): Promise<void> {
  const res = await fetch(`/api/bulbs/${mac}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
}
