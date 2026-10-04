import arrowSprite from "../assets/sprites/arrow.png";
import kingSprite from "../assets/sprites/king.png";
import larrySprite from "../assets/sprites/larry.png";
import towerSprite from "../assets/sprites/tower.png";

export const PROJECTILE_SPRITES: Record<number, string> = {
  0: arrowSprite,
};

export const ENTITY_SPRITES: Record<number, string> = {
  1: towerSprite,
  2: kingSprite,
  3: larrySprite,
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
  const allPaths = [
    ...Object.values(PROJECTILE_SPRITES),
    ...Object.values(ENTITY_SPRITES),
  ];
  await Promise.all(allPaths.map(loadOneSprite));
  console.log("All sprites loaded");
}

export function getSprite(path: string): HTMLImageElement | undefined {
  return spriteCache.get(path);
}
