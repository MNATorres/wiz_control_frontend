export interface Bulb {
  mac: string;
  ip: string;
  name?: string;
  lastSeen: string;
}

export interface PilotState {
  state?: boolean;
  dimming?: number;
  r?: number;
  g?: number;
  b?: number;
  temp?: number;
  sceneId?: number;
  speed?: number;
  mac?: string;
  rssi?: number;
}

export interface Scene {
  id: number;
  name: string;
}

// A preset tone is either an RGB color or a kelvin white (dedicated white LEDs).
export type PresetColor = { dimming: number } & (
  | { r: number; g: number; b: number }
  | { temp: number }
);

export interface Preset {
  key: string;
  name: string;
  colors: PresetColor[];
}

export interface AnimatedTheme {
  key: string;
  name: string;
  emoji: string;
  sceneId: number;
  speed: number;
}
