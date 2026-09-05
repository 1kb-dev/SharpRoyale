import { useRef } from "react";
import { gameState } from "./gameState";
import { ENTITY_DATA } from "./EntityData";

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
    if (entity.isEnemy) {
      renderEnemyEntity(ctx, entity, tileWidth, tileHeight);
    } else {
      renderFriendlyEntity(ctx, entity, tileWidth, tileHeight);
    }
  }
}

function renderEnemyEntity(
  ctx: CanvasRenderingContext2D,
  entity: any,
  tileWidth: number,
  tileHeight: number,
) {
  const size = ENTITY_DATA[entity.entityId].size;
  const [sizeW, sizeH] = size;

  let centerX = entity.position.x * tileWidth;
  let centerY = entity.position.y * tileHeight;

  if (gameState.isMirrored) {
    centerY = (TILE_ROWS - entity.position.y) * tileHeight;
  }

  const x = centerX - (sizeW * tileWidth) / 2;
  const y = centerY - (sizeH * tileHeight) / 2;

  ctx.fillStyle = darken(ENTITY_DATA[entity.entityId].color);
  ctx.fillRect(x, y, tileWidth * size[0], tileHeight * size[1]);
}

function renderFriendlyEntity(
  ctx: CanvasRenderingContext2D,
  entity: any,
  tileWidth: number,
  tileHeight: number,
) {
  const size = ENTITY_DATA[entity.entityId].size;
  const [sizeW, sizeH] = size;

  let centerX = entity.position.x * tileWidth;
  let centerY = entity.position.y * tileHeight;

  if (gameState.isMirrored) {
    centerY = (TILE_ROWS - entity.position.y) * tileHeight;
  }

  const x = centerX - (sizeW * tileWidth) / 2;
  const y = centerY - (sizeH * tileHeight) / 2;

  ctx.fillStyle = ENTITY_DATA[entity.entityId].color;
  ctx.fillRect(x, y, tileWidth * size[0], tileHeight * size[1]);
}
function darken(hex: string, amount = 0.3): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) * (1 - amount));
  const g = Math.max(0, ((num >> 8) & 0xff) * (1 - amount));
  const b = Math.max(0, (num & 0xff) * (1 - amount));
  return `rgb(${r | 0}, ${g | 0}, ${b | 0})`;
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
