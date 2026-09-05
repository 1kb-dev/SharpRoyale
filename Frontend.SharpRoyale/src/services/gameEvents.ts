import { gameState } from "../game/gameState";
import { getPlayerInfo } from "./WSconnection";
export interface MatchAction {
  option: number;
  id: number;
  entityId: number;
  ownerId: number;
  values: SpawnValues | AttackValues;
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

interface AttackValues {
  dummy: number;
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
  // a log saying the players id and the owner id and whether it is an enemy or not

  gameState.entities.set(action.id, {
    id: action.id,
    entityId: action.entityId,
    ownerId: action.ownerId,
    isEnemy: isEnemy,
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
