import React from "react";
import { ENTITY_DATA } from "../game/EntityData";
import { ENTITY_SPRITES } from "../game/spriteHandler";

interface CardProps {
  entityId: number;
  onPointerDown: (e: React.PointerEvent) => void;
}

const PX_PER_UNIT = 52;

const Card = ({ entityId, onPointerDown }: CardProps) => {
  const entity = ENTITY_DATA[entityId];
  const spritePath = ENTITY_SPRITES[entityId];

  // Entity metadata is fetched at startup; skip until it has arrived.
  if (!entity || !spritePath) return null;

  const [width, height] = entity.size;

  return (
    <div className="card" onPointerDown={onPointerDown}>
      <img
        className="entity-shape"
        src={spritePath}
        alt={entity.name}
        draggable={false}
        style={{
          width: `${width * PX_PER_UNIT}px`,
          height: `${height * PX_PER_UNIT}px`,
        }}
      />
    </div>
  );
};

export default Card;
