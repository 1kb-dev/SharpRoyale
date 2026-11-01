import React, { useState } from "react";
import Card from "./card";
import { getDeck } from "../services/deckService";

interface DeckContainerProps {
  deck: number[];
  onCardPointerDown: (cardId: number, e: React.PointerEvent) => void;
}

const DeckContainer = ({ deck, onCardPointerDown }: DeckContainerProps) => {
  return (
    <div className="deck-container">
      {Object.entries(deck).map(([slotId, entityId]) => (
        <Card
          entityId={entityId}
          key={slotId}
          onPointerDown={(e) => onCardPointerDown(Number(slotId), e)}
        />
      ))}
    </div>
  );
};

export default DeckContainer;
