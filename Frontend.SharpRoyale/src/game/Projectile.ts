import arrowSprite from "../assets/sprites/arrow.png";
import type { ProjectileState } from "./gameState";

export const PROJECTILE_SPRITES: Record<number, string> = {
  0: arrowSprite,
};

const spriteCache = new Map<string, HTMLImageElement>();

function loadOneSprite(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      spriteCache.set(path, img);
      resolve();
    };
    img.onerror = () => reject(new Error(`Failed to load: ${path}`));
    img.src = path;
  });
}

export async function preloadAllSprites(): Promise<void> {
  const allPaths = Object.values(PROJECTILE_SPRITES);
  await Promise.all(allPaths.map(loadOneSprite));
  console.log("All sprites loaded");
}

export function getSprite(path: string): HTMLImageElement | undefined {
  return spriteCache.get(path);
}

export function updateProjectilePosition(
  projectile: ProjectileState,
  elapsedMs: number,
): boolean {
  const dx = projectile.endPosition.x - projectile.startPosition.x;
  const dy = projectile.endPosition.y - projectile.startPosition.y;
  const totalDistance = Math.sqrt(dx * dx + dy * dy);

  const totalDurationMs = (totalDistance / projectile.speed) * 1000;

  const t = Math.min(elapsedMs / totalDurationMs, 1);

  projectile.position = {
    x: projectile.startPosition.x + dx * t,
    y: projectile.startPosition.y + dy * t,
  };

  return t >= 1;
}

export function updateAllProjectiles(
  projectiles: Map<number, ProjectileState>,
): void {
  const now = performance.now();
  for (const p of projectiles.values()) {
    const elapsedMs = now - p.spawnTime;
    const done = updateProjectilePosition(p, elapsedMs);
    if (done) {
      projectiles.delete(p.id);
      console.log(
        `Projectile ${p.id} reached its destination and was removed.`,
      );
    }
  }
}
