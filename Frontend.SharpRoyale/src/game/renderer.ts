import { gameState } from "./gameState";
import { ENTITY_DATA } from "./EntityData";
import { ENTITY_SPRITES, getSprite, PROJECTILE_SPRITES } from "./spriteHandler";

export const TILE_COLS = 18;
export const TILE_ROWS = 32;

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  activeCard: number | null,
  previewTile: { x: number; y: number; valid: boolean } | null,
) {
  const canvas = ctx.canvas;
  const canvasWidth = canvas.clientWidth; // logical/CSS pixels
  const canvasHeight = canvas.clientHeight;
  const tileWidth = canvasWidth / TILE_COLS;
  const tileHeight = canvasHeight / TILE_ROWS;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  renderSeaAndBridge(ctx, tileWidth, tileHeight);
  renderTiles(ctx, tileWidth, tileHeight, canvasWidth, canvasHeight);
  renderTickText(ctx, gameState.tickId);
  renderEntities(ctx, tileWidth, tileHeight);
  renderProjectiles(ctx, tileWidth, tileHeight);

  // Prview Tile
  if (activeCard != null && previewTile != null) {
    const px = previewTile.x * tileWidth;
    const py = previewTile.y * tileHeight;

    ctx.beginPath();
    ctx.arc(px, py, 20, 0, Math.PI * 2);
    ctx.fillStyle = previewTile.valid
      ? "rgba(0,255,0,0.4)"
      : "rgba(255,0,0,0.4)";
    ctx.fill();
  }
}

export function setupCanvasResolution(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect(); // CSS size, e.g. 360x640

  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);

  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset before scaling again on resize
  ctx.scale(dpr, dpr);

  return ctx;
}

function renderTiles(
  ctx: CanvasRenderingContext2D,
  tileWidth: number,
  tileHeight: number,
  canvasWidth: number,
  canvasHeight: number,
) {
  ctx.strokeStyle = "#46573d";
  ctx.lineWidth = 1;
  for (let col = 0; col <= TILE_COLS; col++) {
    const x = col * tileWidth;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
  }
  for (let row = 0; row <= TILE_ROWS; row++) {
    const y = row * tileHeight;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
  }
}

function renderTickText(ctx: CanvasRenderingContext2D, tickId: number) {
  ctx.fillStyle = "#f0e2c0";
  ctx.font = "16px monospace";
  ctx.fillText(`Tick: ${tickId}`, 10, 20);
}

function renderEntities(
  ctx: CanvasRenderingContext2D,
  tileWidth: number,
  tileHeight: number,
) {
  for (const entity of gameState.entities.values()) {
    renderEntity(ctx, entity, tileWidth, tileHeight);
  }
}

function renderProjectiles(
  ctx: CanvasRenderingContext2D,
  tileWidth: number,
  tileHeight: number,
) {
  console.log(`Rendering ${gameState.projectiles.size} projectiles`);
  for (const projectile of gameState.projectiles.values()) {
    const spritePath = PROJECTILE_SPRITES[projectile.projectileType];
    if (!spritePath) {
      console.error(
        `No sprite found for projectile type ${projectile.projectileType}`,
      );
      continue;
    }

    const img = getSprite(spritePath);
    if (!img) {
      console.error(`Sprite not preloaded for path: ${spritePath}`);
      continue;
    }

    let centerX = projectile.position.x * tileWidth;
    let centerY = projectile.position.y * tileHeight;
    let renderDirection = projectile.direction;

    if (gameState.isMirrored) {
      centerY = (TILE_ROWS - projectile.position.y) * tileHeight;
      renderDirection = (180 - projectile.direction + 360) % 360;
    }

    const size = 1;
    const drawWidth = size * tileWidth;
    const drawHeight = size * tileHeight;

    const radians = (renderDirection * Math.PI) / 180;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(radians);
    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  }
}

function renderEntity(
  ctx: CanvasRenderingContext2D,
  entity: any,
  tileWidth: number,
  tileHeight: number,
) {
  const entityData = ENTITY_DATA[entity.entityId];
  const spritePath = ENTITY_SPRITES[entity.entityId];
  const sprite = spritePath ? getSprite(spritePath) : undefined;
  if (!entityData || !sprite) {
    console.error(`Sprite not preloaded for entity type: ${entity.entityId}`);
    return;
  }

  const [sizeW, sizeH] = entityData.size;

  let centerX = entity.position.x * tileWidth;
  let centerY = entity.position.y * tileHeight;

  if (gameState.isMirrored) {
    centerY = (TILE_ROWS - entity.position.y) * tileHeight;
  }

  const hasDirection = entity.direction !== null;
  let renderDirection = entity.direction ?? (entity.isEnemy ? 180 : 0);
  if (hasDirection && gameState.isMirrored) {
    renderDirection = (180 - renderDirection + 360) % 360;
  }

  const drawWidth = sizeW * tileWidth;
  const drawHeight = sizeH * tileHeight;
  const radians = (renderDirection * Math.PI) / 180;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(radians);
  if (entity.gotHit > 0) {
    ctx.filter = "brightness(1.8)";
    entity.gotHit = Math.max(0, entity.gotHit - 1);
  } else if (entity.isEnemy) {
    ctx.filter = "brightness(0.7)";
  }
  ctx.drawImage(sprite, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  ctx.restore();
}

function renderSeaAndBridge(
  ctx: CanvasRenderingContext2D,
  tileWidth: number,
  tileHeight: number,
) {
  const canvasWidth = ctx.canvas.clientWidth;
  const canvasHeight = ctx.canvas.clientHeight;

  const riverTopY = tileHeight * 14.5;
  const riverBottomY = tileHeight * 17.5;
  const bridgeDeckTopY = riverTopY - tileHeight * 0.6;
  const bridgeDeckBottomY = riverBottomY + tileHeight * 0.6;
  const bridgeDeckWidth = tileWidth * 2.2;
  const leftBridgeCenterX = tileWidth * 3.5;
  const rightBridgeCenterX = tileWidth * 14.5;
  const bridgeCenterXs = [leftBridgeCenterX, rightBridgeCenterX];
  const bridgeSidePillarWidth = tileWidth * 0.14;
  const bridgeEdgeGrassWidth = tileWidth * 0.18;
  const laneShadeWidth = tileWidth * 2.3;
  const laneShadeLeftX = leftBridgeCenterX - laneShadeWidth / 2;
  const laneShadeRightX = rightBridgeCenterX - laneShadeWidth / 2;

  ctx.save();

  const fieldGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  fieldGradient.addColorStop(0, "#89c95f");
  fieldGradient.addColorStop(0.5, "#7fbe57");
  fieldGradient.addColorStop(1, "#74b953");
  ctx.fillStyle = fieldGradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = "rgba(73, 121, 51, 0.12)";
  ctx.fillRect(0, 0, canvasWidth, riverTopY);
  ctx.fillRect(0, riverBottomY, canvasWidth, canvasHeight - riverBottomY);

  ctx.fillStyle = "rgba(255, 246, 214, 0.10)";
  ctx.fillRect(
    0,
    riverTopY - tileHeight * 0.16,
    canvasWidth,
    tileHeight * 0.16,
  );
  ctx.fillRect(0, riverBottomY, canvasWidth, tileHeight * 0.16);

  const riverGradient = ctx.createLinearGradient(0, riverTopY, 0, riverBottomY);
  riverGradient.addColorStop(0, "#7cc9ff");
  riverGradient.addColorStop(0.5, "#2f89d8");
  riverGradient.addColorStop(1, "#1d68b8");
  ctx.fillStyle = riverGradient;
  ctx.fillRect(0, riverTopY, canvasWidth, riverBottomY - riverTopY);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = Math.max(1, tileHeight * 0.06);
  for (let row = 0; row < 4; row++) {
    const waveY = riverTopY + tileHeight * (0.45 + row * 0.72);
    ctx.beginPath();
    for (let x = 0; x <= canvasWidth; x += tileWidth * 0.75) {
      const offset =
        Math.sin((x / canvasWidth) * Math.PI * 4 + row) * tileHeight * 0.08;
      if (x === 0) {
        ctx.moveTo(x, waveY + offset);
      } else {
        ctx.lineTo(x, waveY + offset);
      }
    }
    ctx.stroke();
  }

  for (const bridgeCenterX of bridgeCenterXs) {
    const bridgeLeftX = bridgeCenterX - bridgeDeckWidth / 2;
    const bridgeDeckHeight = bridgeDeckBottomY - bridgeDeckTopY;

    ctx.fillStyle = "#8e5b2c";
    ctx.fillRect(
      bridgeLeftX,
      bridgeDeckTopY,
      bridgeDeckWidth,
      bridgeDeckHeight,
    );

    ctx.fillStyle = "#d7b27a";
    ctx.fillRect(
      bridgeLeftX,
      bridgeDeckTopY,
      bridgeDeckWidth,
      tileHeight * 0.22,
    );
    ctx.fillRect(
      bridgeLeftX,
      bridgeDeckBottomY - tileHeight * 0.22,
      bridgeDeckWidth,
      tileHeight * 0.22,
    );

    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.fillRect(
      bridgeLeftX,
      bridgeDeckTopY,
      bridgeSidePillarWidth,
      bridgeDeckHeight,
    );
    ctx.fillRect(
      bridgeLeftX + bridgeDeckWidth - bridgeSidePillarWidth,
      bridgeDeckTopY,
      bridgeSidePillarWidth,
      bridgeDeckHeight,
    );

    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = Math.max(1, tileHeight * 0.05);
    for (let step = 1; step < 5; step++) {
      const plankY = bridgeDeckTopY + (bridgeDeckHeight * step) / 5;
      ctx.beginPath();
      ctx.moveTo(bridgeLeftX, plankY);
      ctx.lineTo(bridgeLeftX + bridgeDeckWidth, plankY);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(34, 54, 31, 0.2)";
    ctx.fillRect(
      bridgeLeftX - tileWidth * 0.15,
      bridgeDeckTopY + tileHeight * 0.08,
      bridgeEdgeGrassWidth,
      bridgeDeckHeight - tileHeight * 0.16,
    );
    ctx.fillRect(
      bridgeLeftX + bridgeDeckWidth - tileWidth * 0.03,
      bridgeDeckTopY + tileHeight * 0.08,
      bridgeEdgeGrassWidth,
      bridgeDeckHeight - tileHeight * 0.16,
    );
  }

  ctx.fillStyle = "rgba(112, 79, 39, 0.20)";
  ctx.fillRect(laneShadeLeftX, 0, laneShadeWidth, riverTopY);
  ctx.fillRect(
    laneShadeLeftX,
    riverBottomY,
    laneShadeWidth,
    canvasHeight - riverBottomY,
  );
  ctx.fillRect(laneShadeRightX, 0, laneShadeWidth, riverTopY);
  ctx.fillRect(
    laneShadeRightX,
    riverBottomY,
    laneShadeWidth,
    canvasHeight - riverBottomY,
  );

  ctx.restore();
}
