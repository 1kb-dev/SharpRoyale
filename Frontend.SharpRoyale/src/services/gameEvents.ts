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

interface ProjectileSpawnValues {
  id: number;
  attackerId: number;
  projectileType: number;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  direction: number;
  speed: number;
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

function isProjectileSpawnValues(val: unknown): val is ProjectileSpawnValues {
  if (typeof val !== "object" || val === null) return false;
  const obj = val as Record<string, unknown>;

  const startPosition = obj.startPosition;
  if (typeof startPosition !== "object" || startPosition === null) return false;
  const startObj = startPosition as Record<string, unknown>;

  const endPosition = obj.endPosition;
  if (typeof endPosition !== "object" || endPosition === null) return false;
  const endObj = endPosition as Record<string, unknown>;

  return (
    typeof obj.projectileId === "number" &&
    typeof obj.attackerId === "number" &&
    typeof obj.projectileType === "number" &&
    typeof startObj.x === "number" &&
    typeof startObj.y === "number" &&
    typeof endObj.x === "number" &&
    typeof endObj.y === "number" &&
    typeof obj.direction === "number" &&
    typeof obj.speed === "number"
  );
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

      case 3: // damaged: Server sends both attacker and Victim Id, but rn only the victim is used to apply the damage effect
        console.log("Applying damaged action:", action);
        applyDamagedAction(action);
        break;
      case 4: // Projectile Spawn
        console.log("Applying projectile spawn action:", action);
        applyProjectileSpawnAction(action);
        break;
      case 5: // Projectile Move
        console.log("Applying projectile move action:", action);
        //applyMoveAction(action);
        break;
      case 6: // Despawn
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

function applyProjectileSpawnAction(action: MatchAction) {
  if (!isProjectileSpawnValues(action.values)) {
    console.error("Invalid projectile spawn values:", action.values);
    return;
  }

  const isEnemy = action.ownerId !== gameState.playerId;

  gameState.projectiles.set(action.values.id, {
    id: action.values.id,
    projectileType: action.values.projectileType,
    startPosition: action.values.startPosition,
    endPosition: action.values.endPosition,
    position: action.values.startPosition,
    direction: action.values.direction,
    speed: action.values.speed,
    isEnemy: isEnemy,
    spawnTime: performance.now(),
  });
}
