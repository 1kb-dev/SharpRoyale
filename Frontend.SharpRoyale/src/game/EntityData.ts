interface Entity {
  name: string;
  shape: ShapeType;
  size: [number, number];
  radius: number;
  isConstruction: boolean;
  color: string;
}

export enum ShapeType {
  Circle,
  Square,
}

export const ENTITY_DATA: Record<string, Entity> = {
  1: {
    name: "Tower",
    shape: ShapeType.Square,
    size: [3, 3],
    radius: 0,
    isConstruction: true,
    color: "#8B4513",
  },
  2: {
    name: "King",
    shape: ShapeType.Square,
    size: [4, 4],
    radius: 0,
    isConstruction: true,
    color: "#FFD700",
  },
  3: {
    name: "Larry",
    shape: ShapeType.Circle,
    size: [1, 1],
    radius: 0.5,
    isConstruction: false,
    color: "#808080",
  },
};
