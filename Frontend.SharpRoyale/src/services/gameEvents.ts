import { gameState } from "../game/gameState";
import { getPlayerInfo } from "./WSconnection";
export interface MatchAction {
  option: number;
  id: number;
  entityId: number;
  ownerId: number;
  values: SpawnValues | MoveValues | DamagedValues | DespawnValues;
  time: string;
}

export interface MatchEvent {
  matchId: number;
  tickId: number;
  actions: MatchAction[];
}

interface SpawnValues {
  position: { x: number; y: number };
}

interface MoveValues {
  position: { x: number; y: number };
}

interface DamagedValues {
  id: number;
}

interface DespawnValues {
  id: number;
}

function isSpawnValues(val: unknown): val is SpawnValues {
  if (typeof val !== "object" || val === null) return false;
  const obj = val as Record<string, unknown>;

  const pos = obj.position;
  if (typeof pos !== "object" || pos === null) return false;
  const posObj = pos as Record<string, unknown>;

  return typeof posObj.x === "number" && typeof posObj.y === "number";
}

function isMoveValues(val: unknown): val is MoveValues {
  if (typeof val !== "object" || val === null) return false;
  const obj = val as Record<string, unknown>;

  const pos = obj.position;
  if (typeof pos !== "object" || pos === null) return false;
  const posObj = pos as Record<string, unknown>;

  return typeof posObj.x === "number" && typeof posObj.y === "number";
}

function isDamagedValues(val: unknown): val is DamagedValues {
  if (typeof val !== "object" || val === null) return false;
  const obj = val as Record<string, unknown>;

  return typeof obj.victimId === "number";
}

function isDespawnValues(val: unknown): val is DespawnValues {
  if (typeof val !== "object" || val === null) return false;
  const obj = val as Record<string, unknown>;

  return typeof obj.id === "number";
}

export async function applyMatchEvent(event: MatchEvent) {
  if (gameState.playerId === null) {
    const playerInfo = await getPlayerInfo();
    if (playerInfo) {
      gameState.playerId = playerInfo.playerId;
      gameState.isMirrored = playerInfo.isMirrored;
    } else {
      console.error("Failed to retrieve player info.");
      return;
    }
  }

  for (const action of event.actions) {
    switch (action.option) {
      case 0: // spawn
        console.log("Applying spawn action:", action);
        applySpawnAction(action);
        break;

      case 1: // spawn
        console.log("Applying spawn action:", action);
        applySpawnAction(action);
        break;

      case 2: // move
        console.log("Applying move action:", action);
        applyMoveAction(action);
        break;

      case 3: // damaged
        console.log("Applying damaged action:", action);
        applyDamagedAction(action);
        break;

      case 4:
        console.log("Applying despawn action:", action);
        applyDespawnAction(action);
        break;
    }
  }
  gameState.tickId = event.tickId;
}

function applySpawnAction(action: MatchAction) {
  if (!isSpawnValues(action.values)) {
    console.error("Invalid spawn values:", action.values);
    return;
  }

  const isEnemy = action.ownerId !== gameState.playerId;

  gameState.entities.set(action.id, {
    id: action.id,
    entityId: action.entityId,
    ownerId: action.ownerId,
    isEnemy: isEnemy,
    gotHit: 0,
    lastAction: action,
    position: action.values.position,
  });
}

function applyMoveAction(action: MatchAction) {
  if (!isMoveValues(action.values)) {
    console.error("Invalid move values:", action.values);
    return;
  }
  const entity = gameState.entities.get(action.id);
  if (!entity) {
    console.error("Entity not found for move action:", action.id);
    return;
  }
  entity.position = action.values.position;
  entity.lastAction = action;
}

function applyDamagedAction(action: MatchAction) {
  if (!isDamagedValues(action.values)) {
    console.error("Invalid damaged values:", action.values);
    return;
  }
  const entity = gameState.entities.get(action.id);
  if (!entity) {
    console.error("Entity not found for damaged action:", action.id);
    return;
  }
  entity.gotHit = 30;
}

function applyDespawnAction(action: MatchAction) {
  if (!isDespawnValues(action.values)) {
    console.error("Invalid despawn values:", action.values);
    return;
  }
  const entity = gameState.entities.get(action.id);
  if (!entity) {
    console.error("Entity not found for despawn action:", action.id);
    return;
  }
  gameState.entities.delete(action.id);
}
