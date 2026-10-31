import type { Entity } from "../game/EntityData";

const API_BASE_URL = "http://localhost:5182";

export async function getEntities(): Promise<Entity[]> {
  const response = await fetch(`${API_BASE_URL}/api/lobby/entities`);
  if (!response.ok) {
    throw new Error(`Failed to fetch entities: ${response.statusText}`);
  }

  const data: ApiEntity[] = await response.json();
  return data.map((entity) => ({
    entityId: entity.entityId,
    name: entity.name,
    size: [entity.width, entity.height] as [number, number],
    radius: entity.hitboxRadius,
    isConstruction: entity.isConstruction,
    color: "",
  }));
}

interface ApiEntity {
  entityId: number;
  name: string;
  width: number;
  height: number;
  hitboxRadius: number;
  elixirCost: number;
  isConstruction: boolean;
  restrictedDeployment: boolean;
  speed: number;
  attackDistance: number;
  damage: number;
}
