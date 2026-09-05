import type { MatchEvent, MatchAction } from "../services/gameEvents";

interface EntityState {
  id: number;
  entityId: number;
  ownerId: number;
  isEnemy: boolean;
  position: { x: number; y: number };
  lastAction: MatchAction | null;
}

export const gameState = {
  matchId: null as number | null,
  tickId: 0,
  entities: new Map<number, EntityState>(),
  playerId: null as number | null,
  isMirrored: null as boolean | null,
};
