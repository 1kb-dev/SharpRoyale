import { useState, useEffect, useRef } from "react";
import { connectToMatch } from "../services/WSconnection";
import { sendSpawnAction } from "../services/gameRequests";
import {
  renderFrame,
  setupCanvasResolution,
  TILE_COLS,
  TILE_ROWS,
} from "../game/renderer";
import { applyMatchEvent } from "../services/gameEvents";
import DeckContainer from "./deckContainer";
import { getCardEntityId } from "../services/deckService";
import { gameState } from "../game/gameState";

interface GameWindowProps {
  matchId: number | null;
  setMatchId: React.Dispatch<React.SetStateAction<number | null>>;
}

let eventSource: EventSource | null = null;
let autoJoin: Boolean = true;

const GameWindow = ({ matchId, setMatchId }: GameWindowProps) => {
  const [matchStatus, setMatchStatus] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeCard = useRef<number | null>(null);
  const previewTile = useRef<{ x: number; y: number; valid: boolean } | null>(
    null,
  );

  useEffect(() => {
    if (autoJoin) {
      autoJoin = false;
      handleJoinMatchClick(setMatchId, setMatchStatus, setIsJoining);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setupCanvasResolution(canvas);
    const observer = new ResizeObserver(() => setupCanvasResolution(canvas));
    observer.observe(canvas);

    let frameId: number;
    const loop = () => {
      renderFrame(ctx, activeCard.current, previewTile.current);
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (matchId == null) return;
    const cleanup = connectToMatch(matchId, applyMatchEvent);
    return cleanup;
  }, [matchId]);

  const onPointerMove = (e: PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || activeCard.current == null) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridX = Math.floor((x / rect.width) * TILE_COLS) + 0.5;
    const gridY = Math.floor((y / rect.height) * TILE_ROWS) + 0.5;

    previewTile.current = {
      x: gridX,
      y: gridY,
      valid: true, // TODO: Implement placement validation logic
    };
  };

  const onPointerUp = () => {
    window.removeEventListener("pointermove", onPointerMove);

    if (previewTile.current?.valid && activeCard.current != null) {
      let entityId = getCardEntityId(activeCard.current);
      if (entityId == null) {
        console.error("Invalid card ID:", activeCard.current);
        return;
      }

      let spawnY = previewTile.current.y;
      if (gameState.isMirrored) {
        spawnY = TILE_ROWS - spawnY;
      }

      sendSpawnAction("Spawn", {
        entityId: entityId,
        Position: { x: previewTile.current.x, y: spawnY },
      });
      console.info(
        "Spawn action sent for entityId:",
        entityId,
        "at position:",
        previewTile.current,
      );
    }

    activeCard.current = null;
    previewTile.current = null;
  };

  const handleCardPointerDown = (cardId: number, e: React.PointerEvent) => {
    console.log("pointer down", cardId);
    e.currentTarget.setPointerCapture(e.pointerId);
    activeCard.current = cardId;
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp, { once: true });
  };

  return (
    <div className="game-window">
      <canvas ref={canvasRef} />
      {matchId === null && <p>{matchStatus}</p>}
      {matchId === null && (
        <button
          disabled={isJoining}
          className="join-match-button"
          onClick={() =>
            handleJoinMatchClick(setMatchId, setMatchStatus, setIsJoining)
          }
        >
          Join Before Its Too Late!!!
        </button>
      )}
      <DeckContainer onCardPointerDown={handleCardPointerDown} />
    </div>
  );
};

function handleJoinMatchClick(
  setMatchId: React.Dispatch<React.SetStateAction<number | null>>,
  setMatchStatus: React.Dispatch<React.SetStateAction<string>>,
  setIsJoining: React.Dispatch<React.SetStateAction<boolean>>,
) {
  setIsJoining(true);
  eventSource = new EventSource(`http://localhost:5182/api/lobby/stream/join`, {
    withCredentials: true,
  });
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.matchId) {
      setMatchId(data.matchId);
      setMatchStatus("Found Match!!! joining: " + data.matchId + "...");
      eventSource?.close();
    }
  };
}

export default GameWindow;
