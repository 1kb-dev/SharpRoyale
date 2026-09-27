import type { MatchEvent, MatchAction } from "../services/gameEvents";

interface EntityState {
  id: number;
  entityId: number;
  ownerId: number;
  isEnemy: boolean;
  gotHit: number; // Everytime they get hit this turns to "X", and each tick it goes down. This is for giving pulse feedback that entity got hit.
  position: { x: number; y: number };
  lastAction: MatchAction | null;
}

export interface ProjectileState {
  id: number;
  projectileType: number; // The projectile type, used to get the sprite
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  position: { x: number; y: number };
  direction: number;
  speed: number;
  isEnemy: boolean;
  spawnTime: number;
}

export const gameState = {
  matchId: null as number | null,
  tickId: 0,
  entities: new Map<number, EntityState>(),
  projectiles: new Map<number, ProjectileState>(),
  playerId: null as number | null,
  isMirrored: null as boolean | null,
};
