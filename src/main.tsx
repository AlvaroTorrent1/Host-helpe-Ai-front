import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { initMediaService } from "./services/mediaService";

// Initialize media service to ensure storage bucket exists
initMediaService().catch(error => {
  console.error("Failed to initialize media service:", error);
  // Continue app initialization even if bucket creation fails
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
