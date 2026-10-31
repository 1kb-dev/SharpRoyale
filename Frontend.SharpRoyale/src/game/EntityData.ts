import { getEntities } from "../hooks/getEntities";
export interface Entity {
  entityId: number;
  name: string;
  size: [number, number];
  radius: number;
  isConstruction: boolean;
  color: string;
}

export const ENTITY_DATA: Record<number, Entity> = {};

export async function assignEntityData(): Promise<void> {
  try {
    const entities = await getEntities();
    entities.forEach((entity) => {
      ENTITY_DATA[entity.entityId] = {
        ...entity,
        color: ENTITY_DATA[entity.entityId]?.color ?? "",
      };
    });
  } catch (error) {
    console.error("Error fetching entity data:", error);
  }
}
