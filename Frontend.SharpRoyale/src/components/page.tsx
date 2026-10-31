import { useEffect, useState } from "react";
import GameWindow from "./gameWindow";
import { assignEntityData } from "../game/EntityData";

function Page() {
  const [registerResult, setRegisterResult] = useState<string>("");
  const [matchId, setMatchId] = useState<number | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  let didRegister = false;

  useEffect(() => {
    if (didRegister) return;
    didRegister = true;
    (async () => {
      // Entity metadata must be available before any card or frame renders.
      await Promise.all([RegisterUser(setRegisterResult), assignEntityData()]);
      setReady(true);
    })();
  }, []);

  return (
    <>
      <header>{registerResult}</header>
      <div className="page">
        {ready && <GameWindow matchId={matchId} setMatchId={setMatchId} />}
      </div>
    </>
  );
}

async function RegisterUser(
  setRegisterResult: React.Dispatch<React.SetStateAction<string>>,
) {
  const generateUsername = () => {
    const options = [
      "player",
      "ranger",
      "rocket",
      "shadow",
      "vortex",
      "blaze",
      "pixel",
      "comet",
      "nova",
      "storm",
      "ember",
      "cinder",
      "atlas",
      "onyx",
    ];
    return (
      options[Math.floor(Math.random() * options.length)] +
      Math.floor(Math.random() * 1000)
    );
  };

  const username = generateUsername();
  const password = `${username}123`;

  try {
    const response = await fetch("http://localhost:5182/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      setRegisterResult(username);
    } else if (!response.ok) {
      const body = await response.text();
      const message = body ? body : response.statusText;
      setRegisterResult(`Error ${response.status}: ${message}`);
    }
  } catch (error) {
    setRegisterResult(`Network error: ${error}`);
  }
}

export default Page;
