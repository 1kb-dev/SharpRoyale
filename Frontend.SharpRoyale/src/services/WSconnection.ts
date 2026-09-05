import { HubConnectionBuilder, HubConnection } from "@microsoft/signalr";
import type { MatchEvent } from "./gameEvents";

let connection: HubConnection | null = null;

export function connectToMatch(
  matchId: number,
  onEvent: (data: MatchEvent) => void,
): () => void {
  console.log("Connecting to match with ID:", matchId);
  connection = new HubConnectionBuilder()
    .withUrl(`http://localhost:5182/hubs/match/${matchId}`)
    .withAutomaticReconnect()
    .build();

  connection.on("TickResult", (data) => {
    if (data.actions.length > 0) {
      console.log("Received MatchEvent:", data);
    }
    onEvent(data);
  });

  connection
    .start()
    .catch((err) => console.error("SignalR connection failed:", err));

  return () => {
    connection?.stop();
  };
}

export interface SpawnActionValues {
  entityId: number;
  Position: { x: number; y: number };
}

export function sendSpawnAction(action: string, values: SpawnActionValues) {
  if (!connection) {
    console.error("SignalR connection is not established.");
    return;
  }

  connection
    .invoke("SendPlayerAction", action, values)
    .catch((err) => console.error("Error sending spawn action:", err));
}

interface PlayerInfo {
  playerId: number;
  matchId: number;
  isMirrored: boolean;
}
export async function getPlayerInfo(): Promise<PlayerInfo | null> {
  if (!connection) {
    console.error("SignalR connection is not established.");
    return null;
  }

  try {
    const playerInfo = await connection.invoke<PlayerInfo>("GetPlayerInfo");
    console.info("RETURNED PLAYER INFO:", playerInfo);
    return playerInfo;
  } catch (err) {
    console.error("Error getting player ID:", err);
    return null;
  }
}
