import type { ProjectileState } from "./gameState";

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
