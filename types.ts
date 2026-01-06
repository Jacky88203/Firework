
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  gravity: number;
  friction: number;
  decay: number;
}

export interface Firework {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  distanceToTarget: number;
  distanceTraveled: number;
  coordinates: [number, number][];
  coordinateCount: number;
  angle: number;
  speed: number;
  acceleration: number;
  brightness: number;
  targetRadius: number;
  color: string;
}

export interface ShowTheme {
  name: string;
  description: string;
  colors: string[];
  launchFrequency: number;
  particleCount: number;
  particleSize: number;
  explosionType: 'standard' | 'ring' | 'heart' | 'star';
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING_THEME = 'GENERATING_THEME',
  SHOW_ACTIVE = 'SHOW_ACTIVE'
}
