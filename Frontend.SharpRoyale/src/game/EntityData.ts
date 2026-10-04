interface Entity {
  name: string;
  size: [number, number];
  radius: number;
  isConstruction: boolean;
  color: string;
}

export const ENTITY_DATA: Record<string, Entity> = {
  1: {
    name: "Tower",
    size: [3, 3],
    radius: 0,
    isConstruction: true,
    color: "#8B4513",
  },
  2: {
    name: "King",
    size: [4, 4],
    radius: 0,
    isConstruction: true,
    color: "#FFD700",
  },
  3: {
    name: "Larry",
    size: [1, 1],
    radius: 0.5,
    isConstruction: false,
    color: "#808080",
  },
};
