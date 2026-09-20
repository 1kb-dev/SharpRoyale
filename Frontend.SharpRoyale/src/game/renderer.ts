import { useRef } from "react";
import { gameState } from "./gameState";
import { ENTITY_DATA, ShapeType } from "./EntityData";

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

  const baseColor = darken(ENTITY_DATA[entity.entityId].color);
  if (entity.gotHit > 0) {
    ctx.fillStyle = pulseColor(baseColor, entity.gotHit);
    entity.gotHit = Math.max(0, entity.gotHit - 1);
  } else {
    ctx.fillStyle = baseColor;
  }

  renderObject(
    ctx,
    x,
    y,
    tileWidth * size[0],
    tileHeight * size[1],
    ENTITY_DATA[entity.entityId].shape,
  );
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

  const baseColor = ENTITY_DATA[entity.entityId].color;

  if (entity.gotHit > 0) {
    ctx.fillStyle = pulseColor(baseColor, entity.gotHit);
    entity.gotHit = Math.max(0, entity.gotHit - 1);
  } else {
    ctx.fillStyle = baseColor;
  }

  renderObject(
    ctx,
    x,
    y,
    tileWidth * size[0],
    tileHeight * size[1],
    ENTITY_DATA[entity.entityId].shape,
  );
}

function renderObject(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  shape: ShapeType,
) {
  switch (shape) {
    case ShapeType.Square:
      ctx.fillRect(x, y, w, h);
      break;
    case ShapeType.Circle: {
      const centerX = x + w / 2;
      const centerY = y + h / 2;
      const radius = Math.min(w, h) / 2;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    default:
      throw new Error(`Unknown shape type: ${shape}`);
  }
}

function darken(hex: string, amount = 0.3): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) * (1 - amount));
  const g = Math.max(0, ((num >> 8) & 0xff) * (1 - amount));
  const b = Math.max(0, (num & 0xff) * (1 - amount));
  return `rgb(${r | 0}, ${g | 0}, ${b | 0})`;
}

const HIT_FLASH_DURATION = 30; // ticks

function pulseColor(baseColor: string, gotHit: number): string {
  const t = gotHit / HIT_FLASH_DURATION; // 1 -> just hit, 0 -> worn off
  const easedT = 1 - Math.pow(1 - t, 3); // ease-out: fast rise, smooth long tail

  const [h, s, l] = hexOrRgbToHsl(baseColor);

  // push lightness toward ~90%, scaled by how "hit" we still are
  const targetL = 0.9;
  const newL = l + (targetL - l) * easedT;

  return hslToRgbString(h, s, newL);
}

function hexOrRgbToHsl(color: string): [number, number, number] {
  let r: number, g: number, b: number;

  if (color.startsWith("rgb")) {
    const match = color.match(/[\d.]+/g)!;
    [r, g, b] = match.map(Number);
  } else {
    const clean = color.replace("#", "");
    r = parseInt(clean.substring(0, 2), 16);
    g = parseInt(clean.substring(2, 4), 16);
    b = parseInt(clean.substring(4, 6), 16);
  }

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, l];
}

function hslToRgbString(h: number, s: number, l: number): string {
  if (s === 0) {
    const v = Math.round(l * 255);
    return `rgb(${v}, ${v}, ${v})`;
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);

  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
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
