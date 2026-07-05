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

export interface PresetColor {
  r: number;
  g: number;
  b: number;
  dimming: number;
}

export interface Preset {
  key: string;
  name: string;
  colors: PresetColor[];
}
