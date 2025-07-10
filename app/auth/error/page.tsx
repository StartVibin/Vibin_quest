"use client";

import { useSearchParams } from "next/navigation";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Authentication Error</h1>
      <p>Error: {error}</p>
      <p>This usually means the bot token is not configured correctly.</p>
      <button 
        onClick={() => window.history.back()}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Go Back
      </button>
    </div>
  );
} 