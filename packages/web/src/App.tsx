import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { signIn, signUp, useSession } from "./lib/auth-client";
import { hc } from "hono/client";
import type { API } from "@kochbuch/core/api";
import { useState } from "react";

function App() {
  const session = useSession();
  const [link, setLink] = useState("");

  const handleApiTest = async () => {
    const client = hc<API.Api>(`${import.meta.env.VITE_API_BASE_URL}/api`);
    const res = await client["from-link"].$get({ query: { url: link } });
    const json = await res.json();
    console.log("res", json);
  };

  const handleSignup = async () => {
    await signUp.email({
      email: "test@test.de",
      name: "test",
      password: "testtest",
    });
  };

  const handleSignin = async () => {
    await signIn.email({
      email: "test@test.de",
      password: "testtest",
    });
  };

  return (
    <>
      {session.data != null ? <p>Hallo {session.data.user.name}</p> : null}
      <input
        placeholder="Link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleSignup}>Sign Up</button>
        <button onClick={handleSignin}>Sign In</button>
        <button onClick={handleApiTest}>Test</button>
      </div>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
