import { createRoot } from "react-dom/client";
import { registerPMTilesProtocol } from "./lib/mapProtocol";
import App from "./App.tsx";
import "./index.css";

// Register PMTiles protocol ONCE before any component renders
registerPMTilesProtocol();

createRoot(document.getElementById("root")!).render(<App />);
