let currentDeck: number[] = [3, 3, 3, 3];
let pendingCardsQueue: number[] = [1, 2, 3, 1];

export function getDeck() {
  return currentDeck;
}

export function getCardEntityId(slotId: number): number | undefined {
  return currentDeck[slotId];
}

export function useEntity(slotId: number): number | undefined {
  if (slotId < 0 || slotId >= currentDeck.length) {
    return undefined;
  }

  const entityId = getCardEntityId(slotId);
  if (entityId === undefined) return undefined;

  currentDeck[slotId] = pendingCardsQueue.shift() ?? 0;
  pendingCardsQueue.push(entityId);

  return entityId;
}
