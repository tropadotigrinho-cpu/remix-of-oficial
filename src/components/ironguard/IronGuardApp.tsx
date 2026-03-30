import { useState } from "react";
import { D } from "./constants";
import NavBar from "./NavBar";
import HomePage from "./HomePage";
import MapaPage from "./MapaPage";
import ChatPage from "./ChatPage";
import FeedPage from "./FeedPage";
import SOSModal from "./SOSModal";

export default function IronGuardApp() {
  const [nav, setNav] = useState("home");
  const [showSOS, setShowSOS] = useState(false);

  return (
    <div
      style={{
        fontFamily: "'DM Sans','SF Pro Display','Helvetica Neue',sans-serif",
        background: D.bg,
        height: "100dvh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* PAGE CONTENT */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        {nav === "home" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
            <HomePage onSOS={() => setShowSOS(true)} />
          </div>
        )}
        {nav === "mapa" && <MapaPage />}
        {nav === "chat" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
            <ChatPage />
          </div>
        )}
        {nav !== "home" && nav !== "mapa" && nav !== "chat" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
            <span style={{ fontSize: 42, opacity: 0.2 }}>{nav === "feed" ? "📡" : "👤"}</span>
            <span style={{ color: D.muted, fontSize: 13 }}>Página em construção</span>
          </div>
        )}
      </div>

      {/* NAVBAR */}
      <NavBar nav={nav} setNav={setNav} />

      {/* SOS MODAL */}
      {showSOS && <SOSModal onClose={() => setShowSOS(false)} />}
    </div>
  );
}
